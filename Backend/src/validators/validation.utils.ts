import validator from 'validator';

/**
 * Custom Validation Utilities - Replaces validate.js to remove ReDoS vulnerability
 * Provides secure validation for all custom rules
 */

export interface ValidationRule {
  presence?: { allowEmpty: boolean; message: string };
  length?: { minimum?: number; maximum?: number; message: string };
  email?: { message: string };
  numericality?: boolean;
  type?: string;
  isMongoId?: boolean;
  isPhone?: boolean;
  isCNIC?: boolean;
}

export interface ValidationConstraints {
  [key: string]: ValidationRule;
}

/**
 * Validates if a value is a valid MongoDB ObjectID
 */
function isValidMongoId(value: any): boolean {
  if (!value) return false;
  return validator.isMongoId(value.toString());
}

/**
 * Validates if a value is a valid phone number
 */
function isValidPhone(value: any): boolean {
  if (!value) return false;
  return validator.isMobilePhone(value, 'any');
}

/**
 * Validates if a value is a valid Pakistani CNIC (13 digits)
 */
function isValidCNIC(value: any): boolean {
  if (!value) return false;
  const cnicRegex = /^\d{13}$/;
  return cnicRegex.test(value.toString());
}

/**
 * Main validation function - validates an object against constraints
 */
export function validateData(data: any, constraints: ValidationConstraints): { [key: string]: string[] } {
  const errors: { [key: string]: string[] } = {};

  for (const [fieldPath, rules] of Object.entries(constraints)) {
    const value = getNestedValue(data, fieldPath);
    const fieldErrors: string[] = [];

    // Presence check
    if (rules.presence) {
      if (value === undefined || value === null || value === '') {
        if (!rules.presence.allowEmpty) {
          fieldErrors.push(rules.presence.message);
        }
      }
    }

    // Skip further validation if value is empty and presence is not required
    if (value === undefined || value === null || value === '') {
      if (fieldErrors.length > 0) {
        errors[fieldPath] = fieldErrors;
      }
      continue;
    }

    // Length validation
    if (rules.length) {
      const stringValue = value.toString();
      if (rules.length.minimum && stringValue.length < rules.length.minimum) {
        fieldErrors.push(rules.length.message);
      }
      if (rules.length.maximum && stringValue.length > rules.length.maximum) {
        fieldErrors.push(rules.length.message);
      }
    }

    // Email validation
    if (rules.email) {
      if (!validator.isEmail(value.toString())) {
        fieldErrors.push(rules.email.message);
      }
    }

    // Numericality validation
    if (rules.numericality) {
      if (!validator.isNumeric(value.toString())) {
        fieldErrors.push('must be a number');
      }
    }

    // Type validation
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        fieldErrors.push(`must be of type ${rules.type}`);
      }
    }

    // MongoDB ID validation
    if (rules.isMongoId) {
      if (!isValidMongoId(value)) {
        fieldErrors.push('is not a valid database identifier');
      }
    }

    // Phone validation
    if (rules.isPhone) {
      if (!isValidPhone(value)) {
        fieldErrors.push('is not a valid phone number format');
      }
    }

    // CNIC validation
    if (rules.isCNIC) {
      if (!isValidCNIC(value)) {
        fieldErrors.push('must be exactly 13 digits without dashes');
      }
    }

    if (fieldErrors.length > 0) {
      errors[fieldPath] = fieldErrors;
    }
  }

  return errors;
}

/**
 * Helper function to get nested object values using dot notation
 * Example: getNestedValue({user: {name: 'John'}}, 'user.name') => 'John'
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Helper to format validation errors for API response
 */
export function formatValidationErrors(errors: { [key: string]: string[] }): string {
  const messages = Object.entries(errors)
    .map(([field, msgs]) => `${field} ${msgs.join('; ')}`)
    .join(', ');
  return messages;
}
