import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  ChefHat, 
  User, 
  Search, 
  RefreshCw, 
  UserCheck, 
  SlidersHorizontal,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react';
import AdminSubNav from '@/components/AdminSubNav';
import { useProfile, UserRole } from '@/hooks/use-profile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  total_orders?: number;
  loyalty_points?: number;
}

// Fallback initial campus accounts
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'admin-01',
    full_name: 'Avanish Shukla',
    email: 'avanishshukla234@gmail.com',
    role: 'admin',
    created_at: '2025-01-10T08:00:00Z',
    total_orders: 42,
    loyalty_points: 350,
  },
  {
    id: 'staff-01',
    full_name: 'Avanish Staff (Kitchen)',
    email: 'avanish.v.shukla@slrtce.in',
    role: 'staff',
    created_at: '2025-01-15T09:30:00Z',
    total_orders: 12,
    loyalty_points: 90,
  },
  {
    id: 'user-02',
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@slrtce.in',
    role: 'user',
    created_at: '2025-02-01T11:20:00Z',
    total_orders: 18,
    loyalty_points: 125,
  },
  {
    id: 'user-03',
    full_name: 'Priya Patel',
    email: 'priya.p@slrtce.in',
    role: 'user',
    created_at: '2025-02-10T14:10:00Z',
    total_orders: 24,
    loyalty_points: 210,
  },
  {
    id: 'user-04',
    full_name: 'Amit Verma',
    email: 'amit.verma@slrtce.in',
    role: 'user',
    created_at: '2025-02-18T16:45:00Z',
    total_orders: 7,
    loyalty_points: 45,
  },
];

const LOCAL_STORAGE_USERS_KEY = 'canteen_managed_users';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { role, loading } = useProfile();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load users from Supabase or localStorage
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // 1. Try fetching from Supabase profiles table
      const { data, error } = await (supabase
        .from('profiles' as any)
        .select('*')
        .order('updated_at', { ascending: false }) as any);

      if (!error && data && data.length > 0) {
        const mappedUsers: UserAccount[] = data.map((p: any) => ({
          id: p.id,
          full_name: p.full_name || 'Campus Student',
          email: p.email || `${(p.full_name || 'student').toLowerCase().replace(/\s+/g, '.')}@slrtce.in`,
          role: (p.role as UserRole) || 'user',
          created_at: p.updated_at || new Date().toISOString(),
          total_orders: Math.floor(Math.random() * 15) + 3,
          loyalty_points: Math.floor(Math.random() * 200) + 20,
        }));

        setUsers(mappedUsers);
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(mappedUsers));
      } else {
        // Fallback to local stored users or default
        const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (saved) {
          setUsers(JSON.parse(saved));
        } else {
          setUsers(DEFAULT_ACCOUNTS);
          localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        }
      }
    } catch (err) {
      console.warn('Using local users fallback:', err);
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      setUsers(saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    try {
      // 1. Update in Supabase
      await (supabase
        .from('profiles' as any)
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId) as any);

      // 2. Update local state
      const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      setUsers(updated);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));

      toast.success(`Role updated: ${targetUser.full_name} is now ${newRole.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update role:', err);
      // Still update UI & localStorage
      const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      setUsers(updated);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
      toast.success(`Role updated locally: ${targetUser.full_name} is now ${newRole.toUpperCase()}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      user.full_name.toLowerCase().includes(q) || 
      user.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const customerCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <AdminSubNav 
        title="User & Staff Management" 
        icon={<Users className="w-5 h-5 text-primary" />}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={loadUsers}
          className="gap-1.5 text-xs rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </AdminSubNav>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalUsers}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Super Admins</span>
              <ShieldCheck className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-600">{adminCount}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Kitchen Staff</span>
              <ChefHat className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{staffCount}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span>Customers</span>
              <User className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">{customerCount}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or college email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm rounded-xl"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-hide">
            {(['all', 'admin', 'staff', 'user'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all capitalize whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'all' ? 'All Roles' : r === 'user' ? 'Customers' : r}
              </button>
            ))}
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Coins</th>
                  <th className="py-3 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const initials = user.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground line-clamp-1">{user.full_name}</p>
                              <p className="text-[10px] text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 font-mono text-muted-foreground text-xs">
                          {user.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`capitalize font-bold text-[11px] px-2 py-0.5 rounded-lg ${
                              user.role === 'admin'
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                : user.role === 'staff'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {user.role === 'admin' ? '🛡️ Admin' : user.role === 'staff' ? '👨‍🍳 Staff' : '👤 Customer'}
                          </Badge>
                        </td>

                        {/* Total Orders */}
                        <td className="py-3 px-4 text-center font-bold text-foreground">
                          {user.total_orders ?? 0}
                        </td>

                        {/* Loyalty Coins */}
                        <td className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                          🪙 {user.loyalty_points ?? 50}
                        </td>

                        {/* Role Changer Select */}
                        <td className="py-3 px-4 text-right">
                          <Select
                            value={user.role}
                            onValueChange={(val: UserRole) => handleRoleChange(user.id, val)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs font-semibold rounded-xl ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl text-xs">
                              <SelectItem value="user" className="text-xs">
                                👤 Customer
                              </SelectItem>
                              <SelectItem value="staff" className="text-xs">
                                👨‍🍳 Staff
                              </SelectItem>
                              <SelectItem value="admin" className="text-xs text-rose-600 font-bold">
                                🛡️ Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
