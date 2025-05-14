import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, signOut } from '../services/auth';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkSession = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'student',
          name: session.user.user_metadata?.name || session.user.email,
          code: session.user.user_metadata?.code || null,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  checkSession();

  // Escuchar cambios de autenticación
  const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      checkSession();
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  });

  // authListener devuelve una función para cancelar la suscripción
  return () => {
    authListener.subscription?.unsubscribe?.(); // Manejo seguro si subscription existe
  };
}, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkSession, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}