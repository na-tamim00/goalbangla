import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User;
  setCurrentRole: (role: UserRole) => void;
  canPublish: boolean;
  canEditData: boolean;
  canManageUsers: boolean;
  canTranslate: boolean;
  canUploadMedia: boolean;
  can: (action: string) => boolean;
}

const mockUsers: Record<UserRole, User> = {
  'Super Admin': {
    id: 'usr-1',
    name: 'Tanvir Ahmed',
    email: 'admin@goalbangla.com',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: 'Just now'
  },
  'Admin': {
    id: 'usr-1b',
    name: 'Rafiqul Islam',
    email: 'rafiq@goalbangla.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: '5m ago'
  },
  'Editor': {
    id: 'usr-2',
    name: 'Sadequr Rahman',
    email: 'editor@goalbangla.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: '10m ago'
  },
  'Writer': {
    id: 'usr-3',
    name: 'Anika Tabassum',
    email: 'writer@goalbangla.com',
    role: 'Writer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: '1h ago'
  },
  'Translator': {
    id: 'usr-4',
    name: 'Kazi Farhan',
    email: 'translator@goalbangla.com',
    role: 'Translator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: '2h ago'
  },
  'Media Manager': {
    id: 'usr-5',
    name: 'Shakil Anwar',
    email: 'media@goalbangla.com',
    role: 'Media Manager',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: 'Just now'
  },
  'Data Operator': {
    id: 'usr-6',
    name: 'Mehedi Hasan',
    email: 'data@goalbangla.com',
    role: 'Data Operator',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: 'Just now'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers['Super Admin']);

  const setCurrentRole = (role: UserRole) => {
    setCurrentUser(mockUsers[role] || mockUsers['Super Admin']);
  };

  const isSuperAdmin = currentUser.role === 'Super Admin';
  const isAdmin = currentUser.role === 'Admin' || isSuperAdmin;
  const isEditor = currentUser.role === 'Editor' || isAdmin;

  const canPublish = isEditor;
  const canEditData = currentUser.role === 'Data Operator' || isEditor;
  const canManageUsers = isSuperAdmin;
  const canTranslate = currentUser.role === 'Translator' || isEditor;
  const canUploadMedia = currentUser.role === 'Media Manager' || isEditor || currentUser.role === 'Writer';

  const can = (action?: string): boolean => {
    if (!action || typeof action !== 'string') return true;
    if (isSuperAdmin) return true;
    if (action.startsWith('article:create') || action.startsWith('article:edit')) {
      return currentUser.role === 'Writer' || isEditor;
    }
    if (action.startsWith('article:delete') || action.startsWith('breaking:manage')) {
      return isEditor;
    }
    if (action.startsWith('match:edit')) {
      return currentUser.role === 'Data Operator' || isEditor;
    }
    if (action.startsWith('translation:edit')) {
      return currentUser.role === 'Translator' || isEditor;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentRole,
      canPublish,
      canEditData,
      canManageUsers,
      canTranslate,
      canUploadMedia,
      can
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
