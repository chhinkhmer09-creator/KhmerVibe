import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchAccount: (role: UserRole, email?: string) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const ADMIN_EMAIL = 'chhnchhin94@gmail.com';

const DEFAULT_ADMIN: User = {
  uid: 'admin_chhnchhin94',
  displayName: 'Chhin (Admin)',
  email: ADMIN_EMAIL,
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'អ្នកគ្រប់គ្រង KhmerVibe Platform Official Administrator',
  role: 'admin',
  subscribersCount: 0,
  createdAt: '2025-01-01T00:00:00.000Z'
};

const DEMO_CREATOR: User = {
  uid: 'creator_sovann',
  displayName: 'សុវណ្ណ កម្សាន្ត (Sovann Vibe)',
  email: 'sovann.khmer@example.com',
  photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  bio: 'ផលិតករវីដេអូវប្បធម៌ និងទេសចរណ៍ស្រុកខ្មែរ 🇰🇭',
  role: 'creator',
  subscribersCount: 0,
  createdAt: '2025-02-10T00:00:00.000Z'
};

const DEMO_USER: User = {
  uid: 'user_bopha',
  displayName: 'បុប្ផា រ័ត្ន (Bopha Rath)',
  email: 'bopha.user@example.com',
  photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  bio: 'អ្នកគាំទ្រវីដេអូខ្មែរ',
  role: 'user',
  subscribersCount: 0,
  createdAt: '2025-03-01T00:00:00.000Z'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored user or set default admin
    const stored = localStorage.getItem('khmervibe_current_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        setCurrentUser(DEFAULT_ADMIN);
      }
    } else {
      // Default to the user's authorized admin profile on launch
      setCurrentUser(DEFAULT_ADMIN);
      localStorage.setItem('khmervibe_current_user', JSON.stringify(DEFAULT_ADMIN));
    }
    setIsLoading(false);
  }, []);

  const isAdmin = Boolean(
    currentUser && (currentUser.email === ADMIN_EMAIL || currentUser.role === 'admin')
  );

  const signInWithGoogle = async () => {
    setIsLoading(true);
    // Simulating OAuth popup resolution for the current developer email
    await new Promise((res) => setTimeout(res, 400));
    setCurrentUser(DEFAULT_ADMIN);
    localStorage.setItem('khmervibe_current_user', JSON.stringify(DEFAULT_ADMIN));
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    setCurrentUser(null);
    localStorage.removeItem('khmervibe_current_user');
    setIsLoading(false);
  };

  const switchAccount = (role: UserRole, customEmail?: string) => {
    let userToSet: User;
    if (role === 'admin') {
      userToSet = { ...DEFAULT_ADMIN, email: customEmail || ADMIN_EMAIL };
    } else if (role === 'creator') {
      userToSet = DEMO_CREATOR;
    } else {
      userToSet = DEMO_USER;
    }
    setCurrentUser(userToSet);
    localStorage.setItem('khmervibe_current_user', JSON.stringify(userToSet));
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('khmervibe_current_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        signInWithGoogle,
        signOut,
        switchAccount,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
