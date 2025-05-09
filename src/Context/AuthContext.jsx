import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../Configration/firebaseAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuth) {
          setUser(authData);
        }
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('auth');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          userID: firebaseUser.uid,
          name: firebaseUser.displayName,
          profilephoto: firebaseUser.photoURL,
          email: firebaseUser.email,
          isAuth: true,
        };
        setUser(userData);
        localStorage.setItem('auth', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('auth');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};