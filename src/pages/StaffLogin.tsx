import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { STAFF_CREDENTIALS } from '@/lib/store';
import { hasAdminPin, isAdminAuthed, setAdminPin, verifyAdminPin } from '@/lib/admin-pin';

type Role = 'staff' | 'admin';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('staff');

  // staff
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');

  // admin
  const [adminPin, setAdminPinInput] = useState('');
  const [newPin, setNewPin] = useState('');

  const [error, setError] = useState('');

  const adminNeedsPinSetup = useMemo(() => !hasAdminPin(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'staff') {
      if (staffId === STAFF_CREDENTIALS.id && password === STAFF_CREDENTIALS.password) {
        sessionStorage.setItem('staff_logged_in', 'true');
        toast.success('Staff login successful');
        navigate('/staff/dashboard');
        return;
      }
      setError('Invalid staff credentials. Please try again.');
      toast.error('Invalid credentials');
      return;
    }

    // admin
    if (isAdminAuthed()) {
      navigate('/admin/menu');
      return;
    }

    if (adminNeedsPinSetup) {
      const pin = newPin.trim();
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits/characters.');
        toast.error('Invalid PIN');
        return;
      }
      setAdminPin(pin);
      verifyAdminPin(pin);
      toast.success('Admin PIN set');
      navigate('/admin/menu');
      return;
    }

    const ok = verifyAdminPin(adminPin.trim());
    if (!ok) {
      setError('Invalid admin PIN.');
      toast.error('Invalid admin PIN');
      return;
    }

    toast.success('Admin login successful');
    navigate('/admin/menu');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-card rounded-3xl shadow-xl p-8 border border-border">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {role === 'staff' ? (
                <User className="w-10 h-10 text-primary" />
              ) : (
                <KeyRound className="w-10 h-10 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">Login</h1>
            <p className="text-muted-foreground">Choose Staff or Admin</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('staff');
                setError('');
              }}
              className={
                role === 'staff'
                  ? 'rounded-xl border border-border bg-primary text-primary-foreground py-3 font-semibold'
                  : 'rounded-xl border border-border bg-background text-foreground py-3 font-semibold hover:bg-accent hover:text-accent-foreground'
              }
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setError('');
              }}
              className={
                role === 'admin'
                  ? 'rounded-xl border border-border bg-primary text-primary-foreground py-3 font-semibold'
                  : 'rounded-xl border border-border bg-background text-foreground py-3 font-semibold hover:bg-accent hover:text-accent-foreground'
              }
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {role === 'staff' ? (
              <>
                <div>
                  <label htmlFor="staffId" className="block text-sm font-medium text-card-foreground mb-2">
                    Staff ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="staffId"
                      value={staffId}
                      onChange={(e) => {
                        setStaffId(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter staff ID"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter password"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {adminNeedsPinSetup ? (
                  <div>
                    <label htmlFor="newPin" className="block text-sm font-medium text-card-foreground mb-2">
                      Set Admin PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="newPin"
                        value={newPin}
                        onChange={(e) => {
                          setNewPin(e.target.value);
                          setError('');
                        }}
                        placeholder="Create a new PIN"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      First time admin access: create a PIN (min 4 characters).
                    </p>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="adminPin" className="block text-sm font-medium text-card-foreground mb-2">
                      Admin PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="adminPin"
                        value={adminPin}
                        onChange={(e) => {
                          setAdminPinInput(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter admin PIN"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <p className="text-sm text-destructive">❌ {error}</p>}

            <button type="submit" className="w-full btn-hero !py-4">
              Continue
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
            <p>Staff Demo: ID = canteen, Password = 1234</p>
            <p>Admin: First time set PIN, then use it to open Admin Menu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
