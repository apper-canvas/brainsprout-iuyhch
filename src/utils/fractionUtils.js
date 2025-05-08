/**
 * Utilities for working with fractions
 */

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The GCD of a and b
 */
export const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  
  // Euclidean algorithm
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

/**
 * Calculates the Least Common Multiple (LCM) of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The LCM of a and b
 */
export const lcm = (a, b) => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
};

/**
 * Creates a fraction object from numerator and denominator
 * @param {number} numerator - The numerator of the fraction
 * @param {number} denominator - The denominator of the fraction
 * @returns {Object} Fraction object with validation results
 */
export const createFraction = (numerator, denominator) => {
  // Validate inputs are numbers
  if (typeof numerator !== 'number' || isNaN(numerator)) {
    return {
      fraction: null,
      error: `Invalid numerator: "${numerator}" is not a number`,
      success: false
    };
  }
  
  if (typeof denominator !== 'number' || isNaN(denominator)) {
    return {
      fraction: null,
      error: `Invalid denominator: "${denominator}" is not a number`,
      success: false
    };
  }
  
  // Check for division by zero
  if (denominator === 0) {
    return {
      fraction: null,
      error: "Invalid fraction: Denominator cannot be zero",
      success: false
    };
  }
  
  // Create the fraction object
  const fraction = {
    numerator,
    denominator,
    isNegative: (numerator < 0) !== (denominator < 0)
  };
  
  // Ensure the denominator is positive
  if (denominator < 0) {
    fraction.numerator = -numerator;
    fraction.denominator = Math.abs(denominator);
  }
  
  return {
    fraction,
    success: true
  };
};

/**
 * Simplifies a fraction to its lowest terms
 * @param {Object} fraction - The fraction object to simplify
 * @returns {Object} Simplified fraction with status information
 */
export const simplifyFraction = (fraction) => {
  // Validate fraction object
  if (!fraction || typeof fraction !== 'object' || 
      !('numerator' in fraction) || !('denominator' in fraction)) {
    return {
      fraction: null,
      error: "Invalid fraction object",
      success: false
    };
  }
  
  const { numerator, denominator } = fraction;
  
  // Handle special cases
  if (numerator === 0) {
    return {
      fraction: { numerator: 0, denominator: 1, isNegative: false },
      success: true
    };
  }
  
  // Calculate GCD to reduce the fraction
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  
  // Create the simplified fraction
  const simplifiedFraction = {
    numerator: Math.abs(Math.trunc(numerator / divisor)),
    denominator: Math.abs(Math.trunc(denominator / divisor)),
    isNegative: (numerator < 0) !== (denominator < 0)
  };
  
  // Apply the sign to the numerator
  if (simplifiedFraction.isNegative) {
    simplifiedFraction.numerator = -simplifiedFraction.numerator;
  }
  
  return {
    fraction: simplifiedFraction,
    success: true
  };
};

/**
 * Adds two fractions
 * @param {Object} fraction1 - The first fraction
 * @param {Object} fraction2 - The second fraction
 * @returns {Object} Result fraction with status information
 */
export const addFractions = (fraction1, fraction2) => {
  // Validate fraction objects
  if (!fraction1 || typeof fraction1 !== 'object' || 
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }
  
  if (!fraction2 || typeof fraction2 !== 'object' ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction object",
      success: false
    };
  }
  
  // Find the least common multiple of the denominators
  const commonDenominator = lcm(fraction1.denominator, fraction2.denominator);
  
  // Scale the numerators
  const scaledNum1 = fraction1.numerator * (commonDenominator / fraction1.denominator);
  const scaledNum2 = fraction2.numerator * (commonDenominator / fraction2.denominator);
  
  // Add the numerators
  const sumNumerator = scaledNum1 + scaledNum2;
  
  // Create the resulting fraction
  const result = createFraction(sumNumerator, commonDenominator);
  if (!result.success) return result;
  
  // Simplify the result
  return simplifyFraction(result.fraction);
};

/**
 * Subtracts the second fraction from the first
 * @param {Object} fraction1 - The fraction to subtract from
 * @param {Object} fraction2 - The fraction to subtract
 * @returns {Object} Result fraction with status information
 */
export const subtractFractions = (fraction1, fraction2) => {
  // Validate fraction objects
  if (!fraction1 || typeof fraction1 !== 'object' || 
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }
  
  if (!fraction2 || typeof fraction2 !== 'object' ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction object",
      success: false
    };
  }
  
  // Create the negative of the second fraction
  const negatedFraction2 = {
    numerator: -fraction2.numerator,
    denominator: fraction2.denominator
  };
  
  // Subtract by adding the negated second fraction
  return addFractions(fraction1, negatedFraction2);
};

/**
 * Multiplies two fractions
 * @param {Object} fraction1 - The first fraction
 * @param {Object} fraction2 - The second fraction
 * @returns {Object} Result fraction with status information
 */
export const multiplyFractions = (fraction1, fraction2) => {
  // Validate fraction objects
  if (!fraction1 || typeof fraction1 !== 'object' || 
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }
  
  if (!fraction2 || typeof fraction2 !== 'object' ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction object",
      success: false
    };
  }
  
  // Multiply numerators and denominators
  const productNumerator = fraction1.numerator * fraction2.numerator;
  const productDenominator = fraction1.denominator * fraction2.denominator;
  
  // Create the resulting fraction
  const result = createFraction(productNumerator, productDenominator);
  if (!result.success) return result;
  
  // Simplify the result
  return simplifyFraction(result.fraction);
};

/**
 * Divides the first fraction by the second
 * @param {Object} fraction1 - The dividend fraction
 * @param {Object} fraction2 - The divisor fraction
 * @returns {Object} Result fraction with status information
 */
export const divideFractions = (fraction1, fraction2) => {
  // Validate fraction objects
  if (!fraction1 || typeof fraction1 !== 'object' || 
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }
  
  if (!fraction2 || typeof fraction2 !== 'object' ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction object",
      success: false
    };
  }
  
  // Check for division by zero
  if (fraction2.numerator === 0) {
    return {
      fraction: null,
      error: "Cannot divide by zero",
      success: false
    };
  }
  
  // Create the reciprocal of the second fraction
  const reciprocalFraction2 = {
    numerator: fraction2.denominator,
    denominator: fraction2.numerator
  };
  
  // Division is multiplication by the reciprocal
  return multiplyFractions(fraction1, reciprocalFraction2);
};

/**
 * Formats a fraction as a string
 * @param {Object} fraction - The fraction to format
 * @returns {string} Formatted fraction string
 */
export const formatFraction = (fraction) => {
  if (!fraction) return "Invalid fraction";
  return `${fraction.numerator}/${fraction.denominator}`;
};