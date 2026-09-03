import { describe, it, expect } from 'bun:test';
import { WelcomePage } from '../WelcomePage';

describe('WelcomePage Component', () => {
  it('is defined and exports a valid React functional component', () => {
    expect(WelcomePage).toBeDefined();
    expect(typeof WelcomePage).toBe('function');
  });
});
