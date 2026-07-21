import usersData from './data/users.json';

export interface SauceUser {
  username: string;
  password: string;
}

export const users = usersData as Record<
  'standard' | 'lockedOut' | 'problem' | 'performanceGlitch' | 'error',
  SauceUser
>;
