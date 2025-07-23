import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'redactor';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Si el perfil no existe, crear uno nuevo con rol por defecto
        if (error.code === 'PGRST116') {
          const newProfile = {
            id: supabaseUser.id,
            username: supabaseUser.email?.split('@')[0] || 'usuario',
            email: supabaseUser.email || '',
            role: 'redactor',
            bio: '',
            website: '',
            location: '',
            avatar_url: ''
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            return;
          }

          setUser({
            id: createdProfile.id,
            email: createdProfile.email,
            name: createdProfile.username,
            role: createdProfile.role as 'admin' | 'editor' | 'redactor',
            avatar: createdProfile.avatar_url
          });
        }
        return;
      }

      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.username,
        role: profile.role as 'admin' | 'editor' | 'redactor',
        avatar: profile.avatar_url
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { 
          success: false, 
          error: getAuthErrorMessage(error.message) 
        };
      }

      // El perfil se cargará automáticamente por el listener onAuthStateChange
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Error inesperado al iniciar sesión' 
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: name,
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { 
          success: false, 
          error: getAuthErrorMessage(error.message) 
        };
      }

      // Si el registro es exitoso pero requiere confirmación
      if (data.user && !data.session) {
        setIsLoading(false);
        return { 
          success: true, 
          error: 'Verifica tu email para confirmar tu cuenta' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Error inesperado al registrarse' 
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { 
          success: false, 
          error: getAuthErrorMessage(error.message) 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: 'Error inesperado al enviar email de recuperación' 
      };
    }
  };

  const getAuthErrorMessage = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Credenciales de acceso inválidas',
      'Email not confirmed': 'Email no confirmado',
      'User already registered': 'El usuario ya está registrado',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'Signup is disabled': 'El registro está deshabilitado',
      'Email rate limit exceeded': 'Límite de emails excedido, intenta más tarde',
    };

    return errorMap[errorMessage] || errorMessage;
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session?.user,
    isLoading,
    login,
    logout,
    register,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
