
import { User, UserRole } from './types';

// Demo users with credentials for mock authentication
export const demoUsers: User[] = [
  {
    id: '1',
    email: 'runner@example.com',
    name: 'Demo Runner',
    role: 'runner' as UserRole
  },
  {
    id: '2',
    email: 'business@example.com',
    name: 'Demo Business',
    role: 'business' as UserRole
  }
];

// In a real app, this would be replaced with actual API calls
export const findUserByEmail = (email: string, password: string): User | null => {
  // This is just for demo purposes, in a real app you'd verify credentials on the server
  if (email === 'runner@example.com' && password === 'password') {
    return demoUsers[0];
  } else if (email === 'business@example.com' && password === 'password') {
    return demoUsers[1];
  }
  return null;
};
