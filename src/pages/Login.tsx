import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (typeof window !== 'undefined' && sessionStorage.getItem('local_admin') === 'true') {
        navigate('/staff/dashboard');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase();
        const adminEmails = [
          'vinod.shukla10jan@gmail.com',
          'avanishshukla345@gmail.com',
          'admin@canteen.com'
        ];
        if (userEmail && adminEmails.includes(userEmail)) {
          navigate('/staff/dashboard');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles' as any)
          .select('role')
          .eq('id', session.user.id)
          .single() as { data: { role: string } | null, error: any };

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/profile');
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Local Admin Bypass
      const lowerEmail = email.toLowerCase().trim();
      if (
        lowerEmail === 'admin@canteen.com' ||
        lowerEmail === 'avanishshukla345@gmail.com' ||
        lowerEmail === 'vinod.shukla10jan@gmail.com'
      ) {
        sessionStorage.setItem('local_admin', 'true');
        toast.success('Admin Login Successful!');
        navigate('/staff/dashboard');
        // Force a page reload to ensure Header and Profile states synchronize
        window.location.href = '/staff/dashboard';
        return;
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check user role
      if (authData.user) {
        toast.success('Logged in successfully!');

        const userEmail = authData.user.email?.toLowerCase();
        const adminEmails = [
          'vinod.shukla10jan@gmail.com',
          'avanishshukla345@gmail.com',
          'admin@canteen.com'
        ];
        if (userEmail && adminEmails.includes(userEmail)) {
          navigate('/staff/dashboard');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles' as any)
          .select('role')
          .eq('id', authData.user.id)
          .single() as { data: { role: string } | null, error: any };
        
        if (profile?.role === 'admin' || profile?.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100-64px)] flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Login to your account to start ordering</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Login Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
