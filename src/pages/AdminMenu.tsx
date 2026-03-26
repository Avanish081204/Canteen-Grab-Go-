import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, ClipboardList } from 'lucide-react';
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
  DialogTrigger,
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
    // Keep category valid when categories change
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

  const handleResetMenu = () => {
    toast.error('Reset is disabled when using database.');
  };

  const handleForceSaveCurrent = () => {
    toast.info('Menu is automatically synced with database.');
  };

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchStaffOrders();
      setOrders(data);
    };

    loadOrders(); // Initial load

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
    <div className="min-h-screen bg-background pb-12">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Items: {items.length}</Badge>
              <Badge variant="secondary">Combos: {combosCount}</Badge>
              <Button variant="outline" onClick={handleResetMenu}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={handleForceSaveCurrent}>
                Save
              </Button>
              <Button onClick={openAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Menu Admin</h1>
              <p className="text-muted-foreground">
                Add/edit items, toggle stock, and manage combos.
              </p>
            </header>

            <section className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="w-full sm:w-64">
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search items..."
                    />
                  </div>
                  <div className="w-full sm:w-56">
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

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
                        <Button variant="outline" onClick={() => openEdit(item)}>
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
            </section>
          </TabsContent>

          <TabsContent value="orders">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Order List</h1>
              <p className="text-muted-foreground">
                View all orders placed.
              </p>
            </header>

            <section className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the item details and save.' : 'Create a new menu item (or combo).'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  value={draft.price}
                  inputMode="decimal"
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Short description"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
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
                    <div className="text-sm font-medium">Combo</div>
                    <div className="text-xs text-muted-foreground">If enabled, category becomes “Combos”.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={draft.isCombo ? 'Combos' : draft.category}
                  onValueChange={(val) => setDraft((d) => ({ ...d, category: val }))}
                  disabled={draft.isCombo}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMenuCategories()
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    <SelectItem value="Combos">Combos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Choose built-in image</Label>
                    <Select
                      value={builtInMenuImages.some((o) => o.src === draft.image) ? draft.image : ''}
                      onValueChange={(val) => setDraft((d) => ({ ...d, image: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select image" />
                      </SelectTrigger>
                      <SelectContent>
                        {builtInMenuImages.map((opt) => (
                          <SelectItem key={opt.src} value={opt.src}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Or paste image URL</Label>
                    <Input
                      value={draft.image}
                      onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {draft.image ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={draft.image}
                      alt="Selected preview"
                      className="h-16 w-16 rounded-xl object-cover border border-border"
                      loading="lazy"
                    />
                    <div className="text-sm text-muted-foreground">Preview</div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Availability</Label>
                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <Switch
                    checked={draft.isAvailable}
                    onCheckedChange={(checked) => setDraft((d) => ({ ...d, isAvailable: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">{draft.isAvailable ? 'Available' : 'Out of stock'}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveItem}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
