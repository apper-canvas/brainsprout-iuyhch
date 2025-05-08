// Basic counting utilities for educational games
import { getRandomNumber } from './mathUtils';

/**
 * Generates a basic counting challenge
 * @param {number} level - Difficulty level (1-3)
 * @returns {Object} Challenge with objects to count and correct answer
 */
export const generateCountingChallenge = (level) => {
  // Determine count range based on level
  let min, max;
  
  switch (level) {
    case 1: // Beginner - counting 1-10
      min = 1;
      max = 10;
      break;
    case 2: // Intermediate - counting 1-20
      min = 5;
      max = 20;
      break;
    case 3: // Advanced - counting up to 50
      min = 10;
      max = 50;
      break;
    default:
      min = 1;
      max = 10;
  }
  
  // Generate count
  const targetCount = getRandomNumber(min, max);
  
  // Generate objects to display
  const objectDisplay = generateObjectDisplay(targetCount, level);
  
  return {
    objectDisplay,
    targetCount,
    type: 'basic-counting'
  };
};

/**
 * Generates a skip counting challenge
 * @param {number} level - Difficulty level (1-3)
 * @returns {Object} Challenge with sequence and next number
 */
export const generateSkipCountingChallenge = (level) => {
  // Determine skip counting parameters based on level
  let increment, sequenceLength;
  
  switch (level) {
    case 1: // Basic skip counting (2s, 5s)
      increment = [2, 5][getRandomNumber(0, 1)];
      sequenceLength = 4;
      break;
    case 2: // Intermediate (2s, 3s, 5s, 10s)
      increment = [2, 3, 5, 10][getRandomNumber(0, 3)];
      sequenceLength = 5;
      break;
    case 3: // Advanced (2s, 3s, 5s, 10s, with longer sequences)
      increment = [2, 3, 5, 10][getRandomNumber(0, 3)];
      sequenceLength = 6;
      break;
    default:
      increment = 2;
      sequenceLength = 4;
  }
  
  // Generate starting number based on level
  const start = level === 1 ? 0 : getRandomNumber(0, increment * 2);
  
  // Generate sequence
  const sequence = [];
  for (let i = 0; i < sequenceLength; i++) {
    sequence.push(start + (increment * i));
  }
  
  // The answer is the next number in the sequence
  const answer = start + (increment * sequenceLength);
  
  return {
    sequence,
    answer,
    type: 'skip-counting',
    increment
  };
};

/**
 * Generates a counting backwards challenge
 * @param {number} level - Difficulty level (1-3)
 * @returns {Object} Challenge with sequence and previous number
 */
export const generateCountingBackwardsChallenge = (level) => {
  // Determine counting parameters based on level
  let max, sequenceLength;
  
  switch (level) {
    case 1: // Basic (counting back from 10)
      max = 10;
      sequenceLength = 3;
      break;
    case 2: // Intermediate (counting back from 20)
      max = 20;
      sequenceLength = 4;
      break;
    case 3: // Advanced (counting back from 50)
      max = 50;
      sequenceLength = 5;
      break;
    default:
      max = 10;
      sequenceLength = 3;
  }
  
  // Generate starting number
  const start = getRandomNumber(sequenceLength + 2, max);
  
  // Generate sequence counting backwards
  const sequence = [];
  for (let i = 0; i < sequenceLength; i++) {
    sequence.push(start - i);
  }
  
  // The answer is the previous number in the sequence
  const answer = start - sequenceLength;
  
  return {
    sequence,
    answer,
    type: 'counting-backwards'
  };
};

/**
 * Generates a visual display of objects for counting
 * @param {number} count - Number of objects to display
 * @param {number} level - Difficulty level
 * @returns {Object} Object with display HTML and type
 */
export const generateObjectDisplay = (count, level) => {
  // Different object types based on level
  const objectTypes = [
    '🍎', '🌟', '🎈', '🐶', '🚂', '🍦', 
    '🌼', '🦋', '🐱', '🐢', '🦁', '🐘'
  ];
  
  // Select a random object type
  const objectIndex = getRandomNumber(0, objectTypes.length - 1);
  const objectEmoji = objectTypes[objectIndex];
  
  // For higher levels, organize objects in groups to teach grouping strategy
  if (level >= 3 && count > 20) {
    const groups = Math.floor(count / 10);
    const remainder = count % 10;
    return { display: `${'🔟 '.repeat(groups)}${objectEmoji.repeat(remainder)}`, type: 'grouped' };
  }
  
  return { display: objectEmoji.repeat(count), type: 'standard' };
};