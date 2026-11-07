import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Gift,
} from 'lucide-react';
import AdminSubNav from '@/components/AdminSubNav';
import {
  fetchAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon,
} from '@/lib/coupons';
import { useProfile } from '@/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

export default function AdminCoupons() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New coupon form draft
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrder, setMinOrder] = useState('100');
  const [maxDiscount, setMaxDiscount] = useState('50');
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllCoupons();
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.is_active).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
    return { total, active, totalRedemptions };
  }, [coupons]);

  const generateRandomCode = () => {
    const prefix = discountType === 'flat' ? 'FLAT' : 'SAVE';
    const rand = Math.floor(10 + Math.random() * 90);
    setCode(`${prefix}${discountValue || rand}`);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const updatedStatus = !coupon.is_active;
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: updatedStatus } : c))
    );
    const ok = await updateCoupon(coupon.id, { is_active: updatedStatus });
    if (ok) {
      toast.success(`Coupon ${coupon.code} ${updatedStatus ? 'activated' : 'deactivated'}`);
    } else {
      toast.error('Failed to update status');
      loadCoupons();
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Delete coupon "${couponCode}"?`)) return;
    const ok = await deleteCoupon(id);
    if (ok) {
      toast.success(`Coupon ${couponCode} deleted`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error('Failed to delete coupon');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Coupon code is required');
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Valid discount value is required');
      return;
    }

    const minAmount = parseFloat(minOrder) || 0;
    const maxCap = maxDiscount ? parseFloat(maxDiscount) : undefined;
    const uses = maxUses ? parseInt(maxUses, 10) : undefined;

    const res = await createCoupon({
      code: cleanCode,
      description: description.trim() || `${val}${discountType === 'percentage' ? '%' : '₹'} off on orders above ₹${minAmount}`,
      discount_type: discountType,
      discount_value: val,
      min_order_amount: minAmount,
      max_discount_amount: maxCap,
      max_uses: uses,
      valid_until: validUntil || undefined,
      is_active: true,
    });

    if (res) {
      toast.success(`Coupon ${cleanCode} created successfully!`);
      setIsDialogOpen(false);
      resetForm();
      loadCoupons();
    } else {
      toast.error('Failed to create coupon');
    }
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinOrder('100');
    setMaxDiscount('50');
    setMaxUses('');
    setValidUntil('');
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Coupons...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <AdminSubNav
        title="Coupon & Discount Engine"
        icon={<Tag className="w-4 h-4" />}
      >
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs hover:brightness-110"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Coupon</span>
        </Button>
      </AdminSubNav>

      <main className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Coupons</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Active Now</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Redemptions</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.totalRedemptions}</p>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <section className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-foreground">Configured Promo Codes</h3>
              <p className="text-xs text-muted-foreground">Customers can apply these at checkout</p>
            </div>
            <Button size="sm" variant="ghost" onClick={loadCoupons} className="h-8 w-8 p-0">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Mobile view */}
          <div className="block md:hidden space-y-2.5">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-3 border rounded-xl space-y-2 ${
                  coupon.is_active ? 'bg-card border-border/70' : 'bg-muted/30 border-dashed border-border opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono font-bold text-xs tracking-wider bg-primary/10 text-primary border-primary/30">
                    {coupon.code}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={() => handleToggleActive(coupon)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{coupon.description}</p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                  <span className="font-semibold text-foreground">
                    {coupon.discount_type === 'flat'
                      ? `Flat ₹${coupon.discount_value} OFF`
                      : `${coupon.discount_value}% OFF (Max ₹${coupon.max_discount_amount || '∞'})`}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Min spend: ₹{coupon.min_order_amount}
                  </span>
                </div>
              </div>
            ))}

            {coupons.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No coupons found. Create your first coupon above!
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-bold text-xs tracking-wider bg-primary/10 text-primary border-primary/30">
                        {coupon.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {coupon.description}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {coupon.discount_type === 'flat'
                        ? `₹${coupon.discount_value} Flat`
                        : `${coupon.discount_value}% (Up to ₹${coupon.max_discount_amount || '∞'})`}
                    </TableCell>
                    <TableCell className="text-xs">₹{coupon.min_order_amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {coupon.used_count || 0} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => handleToggleActive(coupon)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {coupon.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {coupons.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No coupons yet. Click "New Coupon" to launch your first promotion!
              </div>
            )}
          </div>
        </section>

        {/* CREATE COUPON DIALOG */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" />
                Create New Coupon
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure promotional discounts for your students and staff.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCoupon} className="space-y-3 py-2 text-xs sm:text-sm">
              {/* Code input with auto-generate button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Coupon Code</Label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-primary flex items-center gap-0.5 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-suggest
                  </button>
                </div>
                <Input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GRAB50"
                  className="font-mono uppercase tracking-wider h-9 text-xs sm:text-sm font-bold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label className="text-xs">Description (Optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Special exam week discount"
                  className="h-9 text-xs sm:text-sm"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Discount Type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(val: any) => setDiscountType(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage" className="text-xs">Percentage (%)</SelectItem>
                      <SelectItem value="flat" className="text-xs">Flat Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                  </Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Min Order (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Max Cap (₹, optional)</Label>
                  <Input
                    type="number"
                    disabled={discountType === 'flat'}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder={discountType === 'flat' ? 'N/A' : 'e.g. 50'}
                    className="h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Max Uses */}
              <div className="space-y-1">
                <Label className="text-xs">Total Usage Limit (Blank for unlimited)</Label>
                <Input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  className="h-9 text-xs sm:text-sm"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold">
                  Create Coupon
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

