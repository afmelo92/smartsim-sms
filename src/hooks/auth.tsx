import React, { createContext, useCallback, useState, useContext } from 'react';
import SSApi from '../services/api/smartsim.api';

interface User {
  id: string;
  name: string;
  avatar_url: string;
  email: string;
  sms_key: string;
  admin?: boolean;
}

interface AuthState {
  token: string;
  user: User;
  admin?: boolean;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@smartsim:token');
    const user = localStorage.getItem('@smartsim:user');
    const admin = localStorage.getItem('@smartsim:admin');

    if (token && user) {
      SSApi.defaults.headers.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user) };
    }

    if (token && user && admin) {
      SSApi.defaults.headers.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user), admin: true };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await SSApi.post('sessions', {
      email,
      password,
    });

    const { token, user, admin } = response.data;

    localStorage.setItem('@smartsim:token', token);
    localStorage.setItem('@smartsim:user', JSON.stringify(user));

    SSApi.defaults.headers.authorization = `Bearer ${token}`;

    if (admin) {
      localStorage.setItem('@smartsim:admin', admin);
      setData({ token, user, admin });
      return;
    }

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@smartsim:token');
    localStorage.removeItem('@smartsim:user');

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('@smartsim:user', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token],
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
