import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Trash2,
  Sliders,
  History,
  Search,
  TrendingDown,
  Layers,
} from 'lucide-react';
import {
  fetchInventory,
  updateStock,
  restockItem,
  recordWaste,
  fetchInventoryLogs,
  fetchWasteLogs,
  InventoryItem,
  InventoryLogEntry,
  WasteLogEntry,
} from '@/lib/inventory';
import { useProfile } from '@/hooks/use-profile';
import AdminSubNav from '@/components/AdminSubNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

export default function AdminInventory() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLogEntry[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteLogEntry[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');

  // Dialog states
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [wasteDialogOpen, setWasteDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [restockQuantity, setRestockQuantity] = useState<string>('20');
  const [restockNotes, setRestockNotes] = useState<string>('');
  const [wasteQuantity, setWasteQuantity] = useState<string>('1');
  const [wasteReason, setWasteReason] = useState<'expired' | 'damaged' | 'spoiled' | 'cancelled_order' | 'other'>('expired');
  const [wasteNotes, setWasteNotes] = useState<string>('');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('Count verification');

  const categories = useMemo(() => {
    const list = Array.from(new Set(items.map((i) => i.category))).sort();
    return ['All', ...list];
  }, [items]);

  const loadData = async () => {
    setIsDataLoading(true);
    try {
      const [invItems, invLogs, wLogs] = await Promise.all([
        fetchInventory(),
        fetchInventoryLogs(50),
        fetchWasteLogs(50),
      ]);
      setItems(invItems);
      setLogs(invLogs);
      setWasteLogs(wLogs);
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('inventoryUpdated', handleSync);
    window.addEventListener('menuUpdated', handleSync);
    return () => {
      window.removeEventListener('inventoryUpdated', handleSync);
      window.removeEventListener('menuUpdated', handleSync);
    };
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const outOfStock = items.filter((i) => i.stock_quantity <= 0).length;
    const lowStock = items.filter(
      (i) => i.stock_quantity > 0 && i.stock_quantity <= i.low_stock_threshold
    ).length;
    const inStock = items.filter((i) => i.stock_quantity > i.low_stock_threshold).length;
    const totalStockUnits = items.reduce((acc, i) => acc + i.stock_quantity, 0);

    return { total, inStock, lowStock, outOfStock, totalStockUnits };
  }, [items]);

  // Filtered list
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === 'in_stock') matchStatus = item.stock_quantity > item.low_stock_threshold;
      else if (statusFilter === 'low') matchStatus = item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold;
      else if (statusFilter === 'out') matchStatus = item.stock_quantity <= 0;

      return matchCat && matchSearch && matchStatus;
    });
  }, [items, selectedCategory, searchQuery, statusFilter]);

  // Quick Restock handler (+10)
  const handleQuickRestock = async (item: InventoryItem, amount: number = 10) => {
    const ok = await restockItem(item.id, amount, `Quick +${amount} restock`);
    if (ok) {
      toast.success(`Added ${amount} units to ${item.name}`);
      loadData();
    } else {
      toast.error('Failed to restock item');
    }
  };

  // Submit Restock Dialog
  const handleSaveRestock = async () => {
    if (!selectedItem) return;
    const qty = parseInt(restockQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const ok = await restockItem(selectedItem.id, qty, restockNotes);
    if (ok) {
      toast.success(`Successfully restocked ${qty} units of ${selectedItem.name}`);
      setRestockDialogOpen(false);
      setRestockNotes('');
      loadData();
    } else {
      toast.error('Failed to restock');
    }
  };

  // Submit Waste Dialog
  const handleSaveWaste = async () => {
    if (!selectedItem) return;
    const qty = parseInt(wasteQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid waste quantity');
      return;
    }

    const ok = await recordWaste(selectedItem.id, qty, wasteReason, wasteNotes);
    if (ok) {
      toast.success(`Logged ${qty} waste units for ${selectedItem.name}`);
      setWasteDialogOpen(false);
      setWasteNotes('');
      loadData();
    } else {
      toast.error('Failed to record waste');
    }
  };

  // Submit Adjust Dialog
  const handleSaveAdjust = async () => {
    if (!selectedItem) return;
    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid non-negative quantity');
      return;
    }

    const ok = await updateStock(selectedItem.id, qty, 'adjustment', adjustReason);
    if (ok) {
      toast.success(`Updated stock of ${selectedItem.name} to ${qty}`);
      setAdjustDialogOpen(false);
      setAdjustReason('');
      loadData();
    } else {
      toast.error('Failed to adjust stock');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Inventory...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <AdminSubNav
        title="Inventory Management"
        icon={<Package className="w-4 h-4" />}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={loadData}
          disabled={isDataLoading}
          className="text-xs h-8 rounded-lg shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isDataLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </AdminSubNav>

      <main className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Menu Items</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">{stats.totalStockUnits} units in stock</p>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'in_stock' ? 'all' : 'in_stock')}
            className={`cursor-pointer transition-all bg-card border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3 ${
              statusFilter === 'in_stock' ? 'border-green-500 ring-2 ring-green-500/20' : 'border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">In Stock</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.inStock}</p>
              <p className="text-[10px] text-muted-foreground">Normal levels</p>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
            className={`cursor-pointer transition-all bg-card border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3 ${
              statusFilter === 'low' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Low Stock</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.lowStock}</p>
              <p className="text-[10px] text-muted-foreground">≤ threshold units</p>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
            className={`cursor-pointer transition-all bg-card border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3 ${
              statusFilter === 'out' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Out of Stock</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              <p className="text-[10px] text-muted-foreground">Needs restock</p>
            </div>
          </div>
        </div>

        {/* Tabs for Stock Overview, Activity Log, Waste Tracking */}
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-3">
            <TabsTrigger value="stock" className="text-xs sm:text-sm py-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Stock Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs sm:text-sm py-1.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Activity Log ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="waste" className="text-xs sm:text-sm py-1.5 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Waste Tracking ({wasteLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Stock Overview */}
          <TabsContent value="stock" className="mt-3">
            <section className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-border">
              {/* Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                <div className="sm:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items by name, category, or ID..."
                      className="pl-8 text-xs sm:text-sm py-1.5 h-9 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9 text-xs sm:text-sm rounded-lg">
                      <SelectValue placeholder="Category" />
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

              {/* Status Filter Pill indicator if active */}
              {statusFilter !== 'all' && (
                <div className="mb-3 flex items-center justify-between bg-muted/50 p-2 rounded-lg text-xs">
                  <span>
                    Filtering by: <strong className="capitalize">{statusFilter.replace('_', ' ')}</strong>
                  </span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-primary hover:underline font-semibold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Mobile Cards (sm:hidden) */}
              <div className="block md:hidden space-y-2.5">
                {filteredItems.map((item) => {
                  const isOut = item.stock_quantity <= 0;
                  const isLow = !isOut && item.stock_quantity <= item.low_stock_threshold;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-xl space-y-2.5 transition-all ${
                        isOut
                          ? 'bg-red-500/5 border-red-500/30'
                          : isLow
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-card border-border/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover border border-border flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {item.name}
                            </span>
                            <Badge
                              variant={isOut ? 'destructive' : isLow ? 'secondary' : 'outline'}
                              className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                                isLow ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : ''
                              }`}
                            >
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <span>₹{item.price}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Level Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Current Stock:</span>
                          <span className="font-bold text-foreground">
                            {item.stock_quantity} units
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (item.stock_quantity / (item.low_stock_threshold * 3)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickRestock(item, 10)}
                          className="h-7 text-[10px] px-2 flex-1"
                        >
                          <Plus className="w-3 h-3 mr-1" /> +10 Quick
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedItem(item);
                            setRestockQuantity('20');
                            setRestockDialogOpen(true);
                          }}
                          className="h-7 text-[10px] px-2"
                        >
                          Restock
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustQuantity(String(item.stock_quantity));
                            setAdjustDialogOpen(true);
                          }}
                          className="h-7 w-7 p-0"
                          title="Adjust quantity"
                        >
                          <Sliders className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedItem(item);
                            setWasteQuantity('1');
                            setWasteDialogOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Log waste"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No items match the current filters.
                  </div>
                )}
              </div>

              {/* Desktop Table (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const isOut = item.stock_quantity <= 0;
                      const isLow = !isOut && item.stock_quantity <= item.low_stock_threshold;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 rounded-lg object-cover border border-border"
                                loading="lazy"
                              />
                              <div>
                                <div className="font-semibold text-foreground text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground">₹{item.price}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1 w-32">
                              <span className="font-bold text-sm text-foreground">
                                {item.stock_quantity} units
                              </span>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, (item.stock_quantity / (item.low_stock_threshold * 3)) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {item.low_stock_threshold} units
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={isOut ? 'destructive' : isLow ? 'secondary' : 'default'}
                              className={isLow ? 'bg-amber-500 text-white' : ''}
                            >
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickRestock(item, 10)}
                                className="h-8 text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" /> +10
                              </Button>

                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setRestockQuantity('20');
                                  setRestockDialogOpen(true);
                                }}
                                className="h-8 text-xs"
                              >
                                Restock
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setAdjustQuantity(String(item.stock_quantity));
                                  setAdjustDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="Adjust Stock"
                              >
                                <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setWasteQuantity('1');
                                  setWasteDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Report Waste"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredItems.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No items match the current filters.
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          {/* TAB 2: Activity Log */}
          <TabsContent value="logs" className="mt-3">
            <section className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Recent Inventory Adjustments</h3>
                <span className="text-xs text-muted-foreground">{logs.length} entries</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No inventory activity logged yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Before / After</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const isPlus = log.quantity_change > 0;
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {log.item_name || log.menu_item_id}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isPlus ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  isPlus
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-500/10 text-red-600 border border-red-200'
                                }`}
                              >
                                {isPlus ? `+${log.quantity_change}` : log.quantity_change}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {log.previous_quantity} → <strong className="text-foreground">{log.new_quantity}</strong>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-[10px]">
                                {log.reason}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {log.performed_by || 'Staff'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {log.notes || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </TabsContent>

          {/* TAB 3: Waste Tracking */}
          <TabsContent value="waste" className="mt-3">
            <section className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-foreground">Logged Waste & Spoilage</h3>
                </div>
                <span className="text-xs text-muted-foreground">{wasteLogs.length} entries</span>
              </div>

              {wasteLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No waste logged. Great job keeping spoilage at zero!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Wasted Quantity</TableHead>
                        <TableHead>Estimated Loss</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wasteLogs.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {entry.item_name || entry.menu_item_id}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-red-600">
                            {entry.quantity} units
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-foreground">
                            ₹{entry.cost_loss ?? 0}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-[10px]">
                              {entry.reason.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.reported_by || 'Staff'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>

        {/* RESTOCK DIALOG */}
        <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
          <DialogContent className="max-w-sm rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                Restock {selectedItem?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Current stock: <strong className="text-foreground">{selectedItem?.stock_quantity} units</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs sm:text-sm">
              <div className="space-y-1">
                <Label className="text-xs">Units to Add</Label>
                <Input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  placeholder="e.g. 20"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Notes / Supplier (Optional)</Label>
                <Input
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  placeholder="e.g. Morning batch delivery"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setRestockDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveRestock} className="text-xs font-bold">
                Confirm Restock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* LOG WASTE DIALOG */}
        <Dialog open={wasteDialogOpen} onOpenChange={setWasteDialogOpen}>
          <DialogContent className="max-w-sm rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                Log Waste: {selectedItem?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Deducts spoiled or damaged stock from active inventory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs sm:text-sm">
              <div className="space-y-1">
                <Label className="text-xs">Quantity Wasted</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedItem?.stock_quantity}
                  value={wasteQuantity}
                  onChange={(e) => setWasteQuantity(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Reason</Label>
                <Select value={wasteReason} onValueChange={(val: any) => setWasteReason(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expired" className="text-xs">Expired / Passed Date</SelectItem>
                    <SelectItem value="spoiled" className="text-xs">Spoiled / Bad Quality</SelectItem>
                    <SelectItem value="damaged" className="text-xs">Physical Damage</SelectItem>
                    <SelectItem value="cancelled_order" className="text-xs">Cancelled Prep</SelectItem>
                    <SelectItem value="other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Notes (Optional)</Label>
                <Input
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  placeholder="e.g. Leftover at day end"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setWasteDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleSaveWaste} className="text-xs font-bold">
                Log Waste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ADJUST STOCK DIALOG */}
        <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
          <DialogContent className="max-w-sm rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary" />
                Adjust Stock: {selectedItem?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Directly override the stock count (e.g. after physical count).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs sm:text-sm">
              <div className="space-y-1">
                <Label className="text-xs">Exact Current Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Reason for Adjustment</Label>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  placeholder="e.g. Manual audit / correction"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setAdjustDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveAdjust} className="text-xs font-bold">
                Save Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

