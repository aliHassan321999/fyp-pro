// Login validation constraints - uses custom validation utility
import { ValidationConstraints } from './validation.utils';

export const loginConstraints: ValidationConstraints = {
  // We name this to match what your Next.js state should send
  emailOrUsername: {
    presence: { allowEmpty: false, message: "is required" },
    // Notice we REMOVED `email: true` so they can type a username!
  },

  password: {
    presence: { allowEmpty: false, message: "is required" }
  },

  // The "Keep me signed in" checkbox
  rememberMe: {
    type: "boolean" // It is optional, but if they send it, it must be true/false
  }
};