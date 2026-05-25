import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { isAdminAuthenticated, setAdminAuthenticated } from '../utils/adminAuth';

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export default function RequireAdminAuth({ children }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAllowed(isAdminAuthenticated());
      setReady(true);
      return;
    }
    if (!supabase) {
      setAllowed(false);
      setReady(true);
      return;
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAllowed(!!session);
      if (session) setAdminAuthenticated(true);
    });
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setAllowed(!!session);
      if (session) setAdminAuthenticated(true);
      setReady(true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ opacity: 0.6 }}>Checking your session…</p>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
