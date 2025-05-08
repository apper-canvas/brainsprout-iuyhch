/**
 * Geometry utilities for calculating properties of 2D and 3D shapes
 */

// Helper function to validate numeric inputs
const validateNumericInputs = (values) => {
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== 'number' || isNaN(values[i])) {
      return {
        valid: false,
        error: `Invalid input: "${values[i]}" is not a number`
      };
    }
  }
  return { valid: true };
};

// Helper function to validate positive inputs
const validatePositiveInputs = (values) => {
  const numericValidation = validateNumericInputs(values);
  if (!numericValidation.valid) {
    return numericValidation;
  }
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] <= 0) {
      return {
        valid: false,
        error: `Invalid input: ${values[i]} must be positive`
      };
    }
  }
  return { valid: true };
};

// ===== 2D SHAPES =====

/**
 * Calculate the area of a circle
 * @param {number} radius - The radius of the circle
 * @returns {Object} - Result with area and status information
 */
export const circleArea = (radius) => {
  const validation = validatePositiveInputs([radius]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const area = Math.PI * radius * radius;
  return {
    result: area,
    success: true
  };
};

/**
 * Calculate the circumference of a circle
 * @param {number} radius - The radius of the circle
 * @returns {Object} - Result with circumference and status information
 */
export const circleCircumference = (radius) => {
  const validation = validatePositiveInputs([radius]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const circumference = 2 * Math.PI * radius;
  return {
    result: circumference,
    success: true
  };
};

/**
 * Calculate the area of a square
 * @param {number} side - The length of a side
 * @returns {Object} - Result with area and status information
 */
export const squareArea = (side) => {
  const validation = validatePositiveInputs([side]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const area = side * side;
  return {
    result: area,
    success: true
  };
};

/**
 * Calculate the perimeter of a square
 * @param {number} side - The length of a side
 * @returns {Object} - Result with perimeter and status information
 */
export const squarePerimeter = (side) => {
  const validation = validatePositiveInputs([side]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const perimeter = 4 * side;
  return {
    result: perimeter,
    success: true
  };
};

/**
 * Calculate the area of a rectangle
 * @param {number} length - The length of the rectangle
 * @param {number} width - The width of the rectangle
 * @returns {Object} - Result with area and status information
 */
export const rectangleArea = (length, width) => {
  const validation = validatePositiveInputs([length, width]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const area = length * width;
  return {
    result: area,
    success: true
  };
};

/**
 * Calculate the perimeter of a rectangle
 * @param {number} length - The length of the rectangle
 * @param {number} width - The width of the rectangle
 * @returns {Object} - Result with perimeter and status information
 */
export const rectanglePerimeter = (length, width) => {
  const validation = validatePositiveInputs([length, width]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const perimeter = 2 * (length + width);
  return {
    result: perimeter,
    success: true
  };
};

/**
 * Calculate the area of a triangle using base and height
 * @param {number} base - The base of the triangle
 * @param {number} height - The height of the triangle
 * @returns {Object} - Result with area and status information
 */
export const triangleArea = (base, height) => {
  const validation = validatePositiveInputs([base, height]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const area = 0.5 * base * height;
  return {
    result: area,
    success: true
  };
};

/**
 * Calculate the area of a triangle using Heron's formula
 * @param {number} a - The first side length
 * @param {number} b - The second side length
 * @param {number} c - The third side length
 * @returns {Object} - Result with area and status information
 */
export const triangleAreaHeron = (a, b, c) => {
  const validation = validatePositiveInputs([a, b, c]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  // Check if the triangle is valid using the triangle inequality theorem
  if (a + b <= c || a + c <= b || b + c <= a) {
    return {
      result: null,
      error: "Invalid triangle: the sum of the lengths of any two sides must be greater than the length of the remaining side",
      success: false
    };
  }
  
  // Calculate semi-perimeter
  const s = (a + b + c) / 2;
  
  // Heron's formula
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return {
    result: area,
    success: true
  };
};

/**
 * Calculate the perimeter of a triangle
 * @param {number} a - The first side length
 * @param {number} b - The second side length
 * @param {number} c - The third side length
 * @returns {Object} - Result with perimeter and status information
 */
export const trianglePerimeter = (a, b, c) => {
  const validation = validatePositiveInputs([a, b, c]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  // Check if the triangle is valid using the triangle inequality theorem
  if (a + b <= c || a + c <= b || b + c <= a) {
    return {
      result: null,
      error: "Invalid triangle: the sum of the lengths of any two sides must be greater than the length of the remaining side",
      success: false
    };
  }
  
  const perimeter = a + b + c;
  return {
    result: perimeter,
    success: true
  };
};

// ===== 3D SHAPES =====

/**
 * Calculate the volume of a sphere
 * @param {number} radius - The radius of the sphere
 * @returns {Object} - Result with volume and status information
 */
export const sphereVolume = (radius) => {
  const validation = validatePositiveInputs([radius]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const volume = (4/3) * Math.PI * Math.pow(radius, 3);
  return {
    result: volume,
    success: true
  };
};

/**
 * Calculate the surface area of a sphere
 * @param {number} radius - The radius of the sphere
 * @returns {Object} - Result with surface area and status information
 */
export const sphereSurfaceArea = (radius) => {
  const validation = validatePositiveInputs([radius]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const surfaceArea = 4 * Math.PI * radius * radius;
  return {
    result: surfaceArea,
    success: true
  };
};

/**
 * Calculate the volume of a cube
 * @param {number} side - The length of a side
 * @returns {Object} - Result with volume and status information
 */
export const cubeVolume = (side) => {
  const validation = validatePositiveInputs([side]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const volume = Math.pow(side, 3);
  return {
    result: volume,
    success: true
  };
};

/**
 * Calculate the surface area of a cube
 * @param {number} side - The length of a side
 * @returns {Object} - Result with surface area and status information
 */
export const cubeSurfaceArea = (side) => {
  const validation = validatePositiveInputs([side]);
  if (!validation.valid) {
    return {
      result: null,
      error: validation.error,
      success: false
    };
  }
  
  const surfaceArea = 6 * side * side;
  return {
    result: surfaceArea,
    success: true
  };
};