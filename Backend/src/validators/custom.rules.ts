import * as validate from 'validate.js';
import validator from 'validator'

/**
 * 1. Rule for MongoDB ObjectIDsnpm install -D @types/validate.js @types/validator
 * Ensures the string is exactly 
 * 24 hex characters so the database doesn't crash.
 */
validate.validators.isMongoId = function (value: any) {
  // If the value is empty, we return null and let the 'presence' rule handle it.
  if (!value) return null;

  if (!validator.isMongoId(value.toString())) {
    return "is not a valid database identifier";
  }

  return null; // Passes validation!
};

/**
 * 2. Rule for Mobile Phone Numbers
 * Uses the 'validator' library to check if it's a real, formatted phone number.
 */
validate.validators.isPhone = function (value: any) {
  if (!value) return null;

  if (!validator.isMobilePhone(value, 'any')) {
    return "is not a valid phone number format";
  }

  return null;
};

/**
 * 3. Rule for Pakistani CNICs
 * Ensures the value is exactly 13 numeric digits with no dashes or letters.
 */
validate.validators.isCNIC = function (value: any) {
  if (!value) return null;

  // Regular expression: ^ means start, \d means digit, {13} means exactly 13 times, $ means end.
  const cnicRegex = /^\d{13}$/;

  if (!cnicRegex.test(value.toString())) {
    return "must be exactly 13 digits without dashes";
  }

  return null;
};

// Export the modified validate object so the rest of your app can use these new rules
export default validate;