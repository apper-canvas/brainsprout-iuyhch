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
      fraction1 === null ||
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }
  
  if (!fraction2 || typeof fraction2 !== 'object' ||
      fraction2 === null ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction object",
      success: false
    };
  }
  
  // Check for zero denominators
  if (fraction1.denominator === 0 || fraction2.denominator === 0) {
    return {
      fraction: null,
      error: "Cannot add fractions with zero denominators",
      success: false
    };
  }
  
  const { numerator: num1, denominator: den1 } = fraction1;
  const { numerator: num2, denominator: den2 } = fraction2;
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
 * Converts an improper fraction to a mixed number
 * @param {Object} fraction - The improper fraction to convert
 * @returns {Object} Mixed number representation with whole, numerator, denominator
 */
export const toMixedNumber = (fraction) => {
  // Validate fraction object
  if (!fraction || typeof fraction !== 'object' || 
      !('numerator' in fraction) || !('denominator' in fraction)) {
    return {
      mixedNumber: null,
      error: "Invalid fraction object",
      success: false
    };
  }
  
  // Check for division by zero
  if (fraction.denominator === 0) {
    return {
      mixedNumber: null,
      error: "Denominator cannot be zero",
      success: false
    };
  }
  
  // Get absolute values
  const absNum = Math.abs(fraction.numerator);
  const absDen = Math.abs(fraction.denominator);
  const isNegative = (fraction.numerator < 0) !== (fraction.denominator < 0);
  
  // Calculate whole and remainder
  const whole = Math.floor(absNum / absDen);
  const remainder = absNum % absDen;
  
  const mixedNumber = {
    whole: isNegative ? -whole : whole,
    numerator: remainder,
    denominator: absDen,
    isNegative
  };
  
  return {
    mixedNumber,
    success: true
  };
};

/**
 * Converts a mixed number to an improper fraction
 * @param {number} whole - The whole number part
 * @param {number} numerator - The numerator of the fractional part
 * @param {number} denominator - The denominator of the fractional part
 * @returns {Object} Improper fraction with status information
 */
export const toImproperFraction = (whole, numerator, denominator) => {
  // Validate inputs
  if (typeof whole !== 'number' || isNaN(whole) || 
      typeof numerator !== 'number' || isNaN(numerator) ||
      typeof denominator !== 'number' || isNaN(denominator)) {
    return {
      fraction: null,
      error: "Invalid input: All parts must be numbers",
      success: false
    };
  }
  
  // Check for division by zero
  if (denominator === 0) {
    return {
      fraction: null,
      error: "Denominator cannot be zero",
      success: false
    };
  }
  
  // Calculate improper fraction
  const isNegative = whole < 0;
  const absWhole = Math.abs(whole);
  const improperNumerator = (absWhole * denominator) + numerator;
  
  // Create the fraction
  return createFraction(
    isNegative ? -improperNumerator : improperNumerator, 
    denominator
  );
};

/**
 * Subtracts the second fraction from the first
 * @param {Object} fraction1 - The fraction to subtract from
 * @param {Object} fraction2 - The fraction to subtract
 * @returns {Object} Result fraction with status information
 */
export const subtractFractions = (fraction1, fraction2) => {
  // Validate first fraction object
  if (!fraction1 || typeof fraction1 !== 'object' || 
      fraction1 === null ||
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction: Must be a valid fraction object",
      success: false
    };
  }
  
  // Validate second fraction object
  if (!fraction2 || typeof fraction2 !== 'object' ||
      fraction2 === null ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction: Must be a valid fraction object",
      success: false
    };
  }
  
  // Check for zero denominators
  if (fraction1.denominator === 0 || fraction2.denominator === 0) {
    return {
      fraction: null,
      error: "Cannot subtract fractions with zero denominators",
      success: false
    };
  }

  // Handle special case: subtracting zero
  if (fraction2.numerator === 0) {
    return {
      fraction: { ...fraction1 },
      success: true
    };
  }

  // Handle special case: subtracting from zero
  if (fraction1.numerator === 0) {
    return {
      fraction: {
        numerator: -fraction2.numerator,
        denominator: fraction2.denominator,
        isNegative: !fraction2.isNegative
      },
      success: true
    };
  }

  // Find the least common multiple of the denominators
  const commonDenominator = lcm(fraction1.denominator, fraction2.denominator);

  // Scale the numerators to match the common denominator
  const scaledNum1 = fraction1.numerator * (commonDenominator / fraction1.denominator);
  const scaledNum2 = fraction2.numerator * (commonDenominator / fraction2.denominator);

  // Subtract the numerators
  const result = createFraction(scaledNum1 - scaledNum2, commonDenominator);
  return result.success ? simplifyFraction(result.fraction) : result;
};

export const multiplyFractions = (fraction1, fraction2) => {
  // Validate fraction objects
  if (!fraction1 || typeof fraction1 !== 'object' || 
      fraction1 === null ||
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }
  
  if (!fraction2 || typeof fraction2 !== 'object' ||
      fraction2 === null ||
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
  
  // Create the resulting fraction and simplify it
  const result = createFraction(productNumerator, productDenominator);
  if (!result.success) return result;
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
      fraction1 === null ||
      !('numerator' in fraction1) || !('denominator' in fraction1)) {
    return {
      fraction: null,
      error: "Invalid first fraction object",
      success: false
    };
  }

  if (!fraction2 || typeof fraction2 !== 'object' ||
      fraction2 === null ||
      !('numerator' in fraction2) || !('denominator' in fraction2)) {
    return {
      fraction: null,
      error: "Invalid second fraction object",
      success: false
    };
  }
  
  // Check for division by zero (second fraction numerator)
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
  if (!fraction || typeof fraction !== 'object') return "Invalid fraction";
  
  // Handle zero numerator
  if (fraction.numerator === 0) return "0";
  
  // Handle whole numbers
  if (fraction.denominator === 1) return `${fraction.numerator}`;
  
  // Convert to mixed number if improper fraction
  if (Math.abs(fraction.numerator) > fraction.denominator) {
    const { mixedNumber, success } = toMixedNumber(fraction);
    if (success && mixedNumber.numerator > 0) {
      // Format as mixed number
      return `${mixedNumber.whole} ${mixedNumber.numerator}/${mixedNumber.denominator}`;
    } else if (success) {
      // Just return the whole part if remainder is 0
      return `${mixedNumber.whole}`;
    }
  }
  
  // Standard fraction format
  return `${fraction.numerator}/${fraction.denominator}`;
};

/**
 * Finds a common denominator for a list of fractions
 * @param {...Object} fractions - List of fraction objects
 * @returns {number} The least common denominator
 */
export const findCommonDenominator = (...fractions) => {
  if (!fractions || fractions.length === 0) return 1;
  
  let result = fractions[0]?.denominator || 1;
  
  for (let i = 1; i < fractions.length; i++) {
    if (fractions[i] && fractions[i].denominator) {
      result = lcm(result, fractions[i].denominator);
    }
  }
  return result;
};