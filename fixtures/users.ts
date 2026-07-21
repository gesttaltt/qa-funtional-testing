export interface SauceUser {
  username: string;
  password: string;
}

export const PASSWORD = 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  problem: { username: 'problem_user', password: PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: PASSWORD },
  error: { username: 'error_user', password: PASSWORD },
} as const satisfies Record<string, SauceUser>;
