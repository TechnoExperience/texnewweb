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
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        // Timeout más largo para evitar carga infinita
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 15000)
        );

        let sessionResult;
        try {
          sessionResult = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
        } catch (timeoutError) {
          console.warn('Session initialization timeout, continuing with auth listener:', timeoutError);
          // En caso de timeout, seguir con el loading false pero mantener el listener activo
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (!mounted) return;

        const { data: { session }, error } = sessionResult;

        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user ? 'User logged in' : 'No user');
        setSession(session);
        
        if (session?.user) {
          try {
            await fetchUserProfile(session.user);
          } catch (error) {
            console.error('Error fetching profile in auth state change:', error);
                                      // En caso de error, crear un usuario básico
             setUser({
               id: session.user.id,
               name: session.user.email?.split('@')[0] || 'usuario',
               email: session.user.email || '',
               role: 'editor'
             });
          }
        } else {
          setUser(null);
        }
        
        // Asegurar que loading se desactive
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
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
            // Crear usuario básico si falla la creación del perfil
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.email?.split('@')[0] || 'usuario',
              role: 'redactor'
            });
            return;
          }

          setUser({
            id: createdProfile.id,
            email: createdProfile.email,
            name: createdProfile.username,
            role: createdProfile.role as 'admin' | 'editor' | 'redactor',
            avatar: createdProfile.avatar_url
          });
        } else {
          // Si hay otro error, crear usuario básico
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.email?.split('@')[0] || 'usuario',
            role: 'redactor'
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
      // En caso de error, crear usuario básico para no bloquear la app
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'usuario',
        role: 'redactor'
      });
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

  const resetAuthState = () => {
    setUser(null);
    setSession(null);
    setIsLoading(false);
    // Limpiar cualquier sesión almacenada
    supabase.auth.signOut();
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
    resetPassword,
    resetAuthState
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
