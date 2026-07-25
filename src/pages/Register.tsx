import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('local_admin') === 'true') {
      navigate('/');
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate('/');
    });
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // The database trigger will automatically create the profile row
      // using the full_name from the options.data metadata.

      // Try auto-login immediately
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        // If auto-login fails (email confirmation required), redirect to login
        toast.success('Account created! Please check your email for verification, then login.');
        navigate('/login');
      } else {
        toast.success('Account created & logged in! Welcome!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to Register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-3 sm:p-4 pb-24 md:pb-4 bg-muted/30">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Create Account</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Join us to enjoy quick canteen service</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground ml-0.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground ml-0.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground ml-0.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Register Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
