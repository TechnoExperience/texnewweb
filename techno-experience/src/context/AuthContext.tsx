import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Perfil } from '../types/database';

interface AuthContextType {
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, tipoPerfil: string) => Promise<any>;
  signOut: () => Promise<void>;
  updatePerfil: (data: Partial<Perfil>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario al montar
    loadUser();

    // Listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          loadPerfil(session.user.id);
        } else {
          setPerfil(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUser() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadPerfil(user.id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadPerfil(userId: string) {
    const { data, error } = await supabase
      .from('perfiles_usuario')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setPerfil(data);
    }
  }

  async function signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email: string, password: string, tipoPerfil: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Crear perfil
    if (data.user) {
      const { error: perfilError } = await supabase
        .from('perfiles_usuario')
        .insert({
          user_id: data.user.id,
          tipo_perfil: tipoPerfil,
          verificado: false,
        });

      if (perfilError) throw perfilError;
    }

    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  }

  async function updatePerfil(data: Partial<Perfil>) {
    if (!user) throw new Error('No hay usuario autenticado');

    const { error } = await supabase
      .from('perfiles_usuario')
      .update(data)
      .eq('user_id', user.id);

    if (error) throw error;

    // Recargar perfil
    await loadPerfil(user.id);
  }

  const value = {
    user,
    perfil,
    loading,
    signIn,
    signUp,
    signOut,
    updatePerfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
