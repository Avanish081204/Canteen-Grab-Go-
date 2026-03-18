import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return <div className="min-h-screen bg-background flex items-center justify-center">Redirecting...</div>;
}
