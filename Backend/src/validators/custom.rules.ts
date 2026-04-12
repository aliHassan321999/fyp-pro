// Custom validation rules - now uses validation.utils instead of validate.js
// This removes the ReDoS vulnerability from validate.js

// Re-export the validation utilities for backward compatibility
export { validateData, formatValidationErrors, type ValidationConstraints, type ValidationRule } from './validation.utils';