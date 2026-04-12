
// Complaint validation constraints - uses custom validation utility
import { ValidationConstraints } from './validation.utils';

export const createComplaintConstraints: ValidationConstraints = {
  // 1. Complaint Title
  title: {
    presence: { allowEmpty: false, message: "is required" },
    length: { maximum: 100, message: "must be under 100 characters" }
  },

  // 2. Description
  description: {
    presence: { allowEmpty: false, message: "is required" },
    length: { minimum: 10, message: "must be at least 10 characters long" }
  },

  // 4. Location (The text input)
  locationText: {
    presence: { allowEmpty: false, message: "is required" }
  },

  // 5. Coordinates (From the Map - Optional)
  "coordinates.lat": { numericality: true },
  "coordinates.lng": { numericality: true },

  // 7. Photos (Optional - type checking)
  attachedImages: {
    type: "array" // Ensures they don't just send a single string instead of an array
  }
};