import { User } from '../types';

const MOCK_USERS = [
  { id: '1', email: 'user@example.com', password: '123456', role: 'user' as const },
  { id: '2', email: 'admin@example.com', password: '123456', role: 'admin' as const },
];

export const mockLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid credentials');
  
  return {
    user: { id: user.id, email: user.email, role: user.role },
    token: 'mock-token-' + user.id
  };
};

export const mockRegister = async (email: string, password: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Mock registration logic
};

export const mockResetPassword = async (email: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Mock reset password logic
};