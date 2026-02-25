import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { STAFF_DELIVERY_CODE, setOrderType } from '@/lib/store';
import { toast } from 'sonner';

export default function StaffCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === STAFF_DELIVERY_CODE) {
      setOrderType('staff-delivery');
      toast.success('Access granted! You can now order for delivery.');
      navigate('/menu');
    } else {
      setError('Invalid code. Delivery option is only for staff.');
      toast.error('Invalid staff delivery code');
    }
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
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">
              Staff Delivery Access
            </h1>
            <p className="text-muted-foreground">
              Enter your staff delivery code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-card-foreground mb-2">
                Delivery Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter staff code"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl font-mono tracking-wider"
              />
              {error && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  ❌ {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Verify & Continue
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            This feature is exclusively for college staff members.
          </p>
        </div>
      </div>
    </div>
  );
}
