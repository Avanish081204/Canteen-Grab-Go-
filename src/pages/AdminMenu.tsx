import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, ClipboardList, Download, Edit, Search } from 'lucide-react';
import { 
  MenuItem, 
  Order, 
  updateOrderStatus, 
  OrderStatus,
  fetchMenuItems,
  addMenuItem,
  updateMenuItem,
  fetchStaffOrders
} from '@/lib/store';
import { downloadBill } from '@/lib/bill-utils';
import {
  generateMenuItemId,
  getMenuCategories,
} from '@/lib/menu-overrides';
import { builtInMenuImages } from '@/lib/menu-images';
import { useProfile } from '@/hooks/use-profile';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type ItemDraft = {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string;
  image: string;
  isCombo: boolean;
  isAvailable: boolean;
};

function toDraft(item?: MenuItem): ItemDraft {
  if (!item) {
    return {
      id: generateMenuItemId(),
      name: '',
      price: '',
      category: 'Snacks',
      description: '',
      image: '',
      isCombo: false,
      isAvailable: true,
    };
  }
  return {
    id: item.id,
    name: item.name,
    price: String(item.price),
    category: item.category,
    description: item.description,
    image: item.image,
    isCombo: Boolean(item.isCombo),
    isAvailable: item.isAvailable,
  };
}

function draftToItem(d: ItemDraft): MenuItem {
  return {
    id: d.id,
    name: d.name.trim(),
    price: Number(d.price),
    category: d.isCombo ? 'Combos' : d.category.trim(),
    image: d.image.trim(),
    description: d.description.trim(),
    isCombo: d.isCombo ? true : undefined,
    isAvailable: d.isAvailable,
  };
}

export default function AdminMenu() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(() => toDraft());

  const categories = useMemo(() => {
    const derived = Array.from(new Set(items.map((i) => i.category))).sort((a, b) => a.localeCompare(b));
    return ['All', ...derived];
  }, [items]);

  useEffect(() => {
    if (loading) return;
    if (role !== 'admin') {
      toast.error('Access Denied: Admin only');
      navigate('/');
    }
  }, [role, loading, navigate]);

  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (selectedCategory === 'All' ? true : i.category === selectedCategory))
      .filter((i) => (q ? `${i.name} ${i.description}`.toLowerCase().includes(q) : true));
  }, [items, selectedCategory, query]);

  const combosCount = useMemo(() => items.filter((i) => i.category === 'Combos' || i.isCombo).length, [items]);

  const openAdd = () => {
    setEditingItem(null);
    setDraft(toDraft());
    setIsDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setDraft(toDraft(item));
    setIsDialogOpen(true);
  };

  const loadMenu = async () => {
    setIsMenuLoading(true);
    const data = await fetchMenuItems();
    setItems(data);
    setIsMenuLoading(false);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const saveItem = async () => {
    if (!draft.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const priceNum = Number(draft.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (!draft.image.trim()) {
      toast.error('Image URL is required (or choose a built-in image)');
      return;
    }
    if (!draft.isCombo && !draft.category.trim()) {
      toast.error('Category is required');
      return;
    }
    const itemData = draftToItem(draft);
    
    if (editingItem) {
      await updateMenuItem(editingItem.id, itemData);
      toast.success('Item updated');
    } else {
      await addMenuItem(itemData);
      toast.success('Item added');
    }
    
    setIsDialogOpen(false);
    loadMenu();
    window.dispatchEvent(new Event('menuUpdated'));
  };

  const handleToggleStock = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: newStatus } : i)));
    
    const success = await updateMenuItem(item.id, { isAvailable: newStatus });
    if (!success) {
      toast.error('Failed to update stock');
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !newStatus } : i)));
    } else {
      window.dispatchEvent(new Event('menuUpdated'));
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchStaffOrders();
      setOrders(data);
    };

    loadOrders();

    const sync = () => {
      loadMenu();
      loadOrders();
    };
    window.addEventListener('menuUpdated', sync);
    const interval = setInterval(() => loadOrders(), 5000);
    return () => {
      window.removeEventListener('menuUpdated', sync);
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      {/* Sticky Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Top Row: Back button, Title, Add Item Button */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <h1 className="text-base sm:text-xl font-bold text-foreground">Menu Admin</h1>
            </div>

            <Button size="sm" onClick={openAdd} className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1.5 rounded-lg sm:rounded-xl">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Sub Row: Quick Badges */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">Items: {items.length}</Badge>
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">Combos: {combosCount}</Badge>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-2">
            <TabsTrigger value="menu" className="text-xs sm:text-sm py-1.5">Menu Items</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm py-1.5 flex items-center justify-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* Menu Items Tab */}
          <TabsContent value="menu">
            <section className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-border">
              {/* Search & Category Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                <div>
                  <Label htmlFor="search" className="text-xs font-medium mb-1 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search items..."
                      className="pl-8 text-xs sm:text-sm py-1.5 h-9 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1 block">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9 text-xs sm:text-sm rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs sm:text-sm">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile Card View (sm:hidden) */}
              <div className="block md:hidden space-y-2.5">
                {filtered.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/30 border border-border/70 rounded-xl flex items-center justify-between gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover border border-border flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-foreground truncate">{item.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">{item.category}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{item.description || 'No description'}</p>
                      <p className="text-xs font-bold text-primary mt-0.5">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Switch checked={item.isAvailable} onCheckedChange={() => handleToggleStock(item)} />
                        <span className="text-[10px] font-semibold text-muted-foreground">{item.isAvailable ? 'In' : 'Out'}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="h-7 text-[11px] px-2">
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">No items match your filters.</div>
                )}
              </div>

              {/* Desktop Table View (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Combo</TableHead>
                      <TableHead>In Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={`${item.name} image`}
                              className="h-10 w-10 rounded-lg object-cover border border-border"
                              loading="lazy"
                            />
                            <div>
                              <div className="font-semibold text-foreground">{item.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                              <div className="text-[11px] text-muted-foreground">ID: {item.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>{item.isCombo || item.category === 'Combos' ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Switch checked={item.isAvailable} onCheckedChange={() => handleToggleStock(item)} />
                            <span className="text-sm text-muted-foreground">{item.isAvailable ? 'Available' : 'Out'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">No items match your filters.</div>
                )}
              </div>
            </section>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <section className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-border">
              {/* Mobile Orders List */}
              <div className="block md:hidden space-y-2.5">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">No orders yet.</div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-3 bg-muted/30 border border-border/70 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-xs">{order.token}</Badge>
                        <Badge variant={order.type === 'dine-in' ? 'default' : order.type === 'take-away' ? 'secondary' : 'destructive'} className="text-[10px]">
                          {order.type === 'dine-in' ? 'Dine In' : order.type === 'take-away' ? 'Take Away' : 'Delivery'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="font-bold text-xs text-primary">₹{order.total}</span>
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={order.status}
                            onValueChange={async (val) => {
                              setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: val as OrderStatus } : o));
                              await updateOrderStatus(order.id, val as OrderStatus);
                            }}
                          >
                            <SelectTrigger className="h-7 text-[11px] w-[110px] rounded-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placed">Placed</SelectItem>
                              <SelectItem value="cooking">Cooking</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="collected">Collected</SelectItem>
                              <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadBill(order)}>
                            <Download className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">{order.token}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.type === 'dine-in' ? 'default' : order.type === 'take-away' ? 'secondary' : 'destructive'}>
                              {order.type === 'dine-in' ? 'Dine In' : order.type === 'take-away' ? 'Take Away' : 'Delivery'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">₹{order.total}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={async (val) => {
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: val as OrderStatus } : o));
                                await updateOrderStatus(order.id, val as OrderStatus);
                              }}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="cooking">Cooking</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="collected">Collected</SelectItem>
                                <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => downloadBill(order)}
                              title="Download Bill"
                            >
                              <Download className="w-4 h-4 text-primary" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[92vw] sm:max-w-[600px] p-4 sm:p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingItem ? 'Update the item details and save.' : 'Create a new menu item (or combo).'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input className="h-9 text-xs sm:text-sm" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input
                  className="h-9 text-xs sm:text-sm"
                  value={draft.price}
                  inputMode="decimal"
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input
                  className="h-9 text-xs sm:text-sm"
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Short description"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <div className="flex items-center gap-2 rounded-xl border border-border p-2.5">
                  <Switch
                    checked={draft.isCombo}
                    onCheckedChange={(checked) =>
                      setDraft((d) => ({
                        ...d,
                        isCombo: checked,
                        category: checked ? 'Combos' : d.category,
                      }))
                    }
                  />
                  <div>
                    <div className="text-xs font-semibold">Combo</div>
                    <div className="text-[10px] text-muted-foreground">Sets category to “Combos”.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={draft.isCombo ? 'Combos' : draft.category}
                  onValueChange={(val) => setDraft((d) => ({ ...d, category: val }))}
                  disabled={draft.isCombo}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMenuCategories()
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    <SelectItem value="Combos" className="text-xs">Combos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Built-in image</Label>
                    <Select
                      value={builtInMenuImages.some((o) => o.src === draft.image) ? draft.image : ''}
                      onValueChange={(val) => setDraft((d) => ({ ...d, image: val }))}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select image" />
                      </SelectTrigger>
                      <SelectContent>
                        {builtInMenuImages.map((opt) => (
                          <SelectItem key={opt.src} value={opt.src} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Or image URL</Label>
                    <Input
                      className="h-9 text-xs"
                      value={draft.image}
                      onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {draft.image ? (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={draft.image}
                      alt="Selected preview"
                      className="h-12 w-12 rounded-lg object-cover border border-border"
                      loading="lazy"
                    />
                    <div className="text-xs text-muted-foreground">Preview</div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Availability</Label>
                <div className="flex items-center gap-2 rounded-xl border border-border p-2.5">
                  <Switch
                    checked={draft.isAvailable}
                    onCheckedChange={(checked) => setDraft((d) => ({ ...d, isAvailable: checked }))}
                  />
                  <span className="text-xs text-muted-foreground">{draft.isAvailable ? 'In stock' : 'Out of stock'}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={saveItem} className="text-xs font-bold">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
