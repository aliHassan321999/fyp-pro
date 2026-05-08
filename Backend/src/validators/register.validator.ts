import './custom.rules';

export const registerConstraints = {
  // --- TOP HALF OF FORM ---

  "profile.fullName": {
    presence: { allowEmpty: false, message: "is required" },
    length: { minimum: 3, message: "must be at least 3 characters" }
  },
  "profile.cnic": {
    presence: { allowEmpty: false, message: "is required" },
    isCNIC: true
  },
  "profile.phoneNumber": {
    presence: { allowEmpty: false, message: "is required" },
    isPhone: true
  },

  // --- BOTTOM HALF OF FORM ---

  email: {
    presence: { allowEmpty: false, message: "is required" },
    email: { message: "is not a valid email format" }
  },
  password: {
    presence: { allowEmpty: false, message: "is required" },
    length: { minimum: 6, message: "must be at least 6 characters" }
  },
  "profile.address.block": {
    presence: { allowEmpty: false, message: "is required" }
  },
  "profile.address.houseNumber": {
    presence: { allowEmpty: false, message: "is required" }
  },
  "profile.address.street": {
    presence: { allowEmpty: false, message: "is required" }
  }
};