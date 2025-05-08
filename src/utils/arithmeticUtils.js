/**
 * Arithmetic utility functions with error handling for educational math games
 * Handles input validation and overflow conditions for basic arithmetic operations
 */

// Maximum safe integer in JavaScript
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

/**
 * Validates if inputs are valid numbers
 * @param {Array} nums - Array of values to validate
 * @returns {Object} - Result with validation status and error message if applicable
 */
const validateNumbers = (nums) => {
  for (let i = 0; i < nums.length; i++) {
    if (typeof nums[i] !== 'number' || isNaN(nums[i])) {
      return {
        valid: false,
        error: `Invalid input: "${nums[i]}" is not a number`
      };
    }
  }
  return { valid: true };
};

/**
 * Adds two or more numbers with error handling
 * @param {...number} nums - Numbers to add
 * @returns {Object} - Result with sum and status information
 */
export const add = (...nums) => {
  // Validate inputs
  const validation = validateNumbers(nums);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }

  // Check for empty input
  if (nums.length === 0) {
    return {
      result: 0,
      success: true
    };
  }

  let sum = 0;
  for (const num of nums) {
    // Check for potential overflow
    if (sum > 0 && num > MAX_SAFE_INTEGER - sum) {
      return {
        result: null,
        error: "Overflow: Result would be too large",
        success: false
      };
    }
    // Check for potential underflow
    if (sum < 0 && num < MIN_SAFE_INTEGER - sum) {
      return {
        result: null,
        error: "Overflow: Result would be too small",
        success: false
      };
    }
    sum += num;
  }

  return {
    result: sum,
    success: true
  };
};

/**
 * Subtracts numbers from the first number with error handling
 * @param {...number} nums - First number followed by numbers to subtract
 * @returns {Object} - Result with difference and status information
 */
export const subtract = (...nums) => {
  // Validate inputs
  // Validate that all inputs are numbers
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }

  // Check for missing inputs
  if (nums.length === 0) {
    return {
      result: null,
      error: "Subtraction requires at least one number",
      success: false
    };
  }

  // If only one number is provided, return negative of that number
  if (nums.length === 1) {
    return {
      result: nums[0],
      success: true
    };
  }

  let result = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const currentNum = nums[i];
    
    // Check for underflow: if we're subtracting a positive number and result would go below MIN_SAFE_INTEGER
    if (currentNum > 0 && result < MIN_SAFE_INTEGER + currentNum) {
      return {
        result: null,
        error: `Underflow: Result would be below minimum safe integer (${MIN_SAFE_INTEGER})`,
        success: false
      };
    }
    
    // Check for overflow: if we're subtracting a negative number and result would exceed MAX_SAFE_INTEGER
    if (currentNum < 0 && result > MAX_SAFE_INTEGER + currentNum) {
      return {
        result: null,
        result: null,
        error: "Overflow: Result would be outside safe integer range",
        success: false
      };
    }
    result -= nums[i];
  }

  // Additional validation for the final result
  if (result > MAX_SAFE_INTEGER || result < MIN_SAFE_INTEGER) {
    return {
      result: null,
      error: "Result exceeds safe integer range",
      success: false
    };
  }

  return {
    result: result,
    success: true
  };
};