/**
 * Utility functions for maintaining question diversity and preventing repetition
 * in educational math games.
 */

// Store for tracking previously asked questions in each game category
const recentQuestionsMap = {
  shapes: [],
  counting: [],
  numbers: [],
  arithmetic: [],
  fractions: []
};

// Maximum number of recent questions to track (per category)
const MAX_RECENT_QUESTIONS = 10;

/**
 * Tracks a question to avoid repeating it soon
 * @param {string} category - Game category (shapes, counting, etc.)
 * @param {*} questionKey - Unique identifier for the question
 */
export const trackQuestion = (category, questionKey) => {
  if (!recentQuestionsMap[category]) {
    recentQuestionsMap[category] = [];
  }
  
  // Add to recent questions
  recentQuestionsMap[category].push(questionKey);
  
  // Trim if exceeds max size
  if (recentQuestionsMap[category].length > MAX_RECENT_QUESTIONS) {
    recentQuestionsMap[category].shift();
  }
};

/**
 * Checks if a question has been recently asked
 * @param {string} category - Game category
 * @param {*} questionKey - Unique identifier for the question
 * @returns {boolean} True if question was recently asked
 */
export const wasRecentlyAsked = (category, questionKey) => {
  if (!recentQuestionsMap[category]) return false;
  return recentQuestionsMap[category].includes(questionKey);
};

/**
 * Gets a random item from an array that wasn't recently used
 * @param {Array} items - Array of items to choose from
 * @param {string} category - Game category
 * @param {function} keyExtractor - Function to extract a unique key from an item
 * @returns {*} A randomly selected item
 */
export const getRandomNonRepeatingItem = (items, category, keyExtractor) => {
  if (!items || items.length === 0) return null;
  
  // Filter out recently used items
  const availableItems = items.filter(item => {
    const key = keyExtractor ? keyExtractor(item) : item;
    return !wasRecentlyAsked(category, key);
  });
  
  // If all items were recently used, just pick randomly from all
  const sourceArray = availableItems.length > 0 ? availableItems : items;
  const selectedItem = sourceArray[Math.floor(Math.random() * sourceArray.length)];
  
  // Track this item
  const key = keyExtractor ? keyExtractor(selectedItem) : selectedItem;
  trackQuestion(category, key);
  
  return selectedItem;
};

/**
 * Gets a random item from a weighted array of items
 * @param {Array} items - Array of items with weights
 * @returns {*} Randomly selected item based on weights
 */
export const getRandomWeightedItem = (items) => {
  if (!items || items.length === 0) return null;
  
  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  
  // Generate random value between 0 and total weight
  let random = Math.random() * totalWeight;
  
  // Find the item based on weight
  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) {
      return item.value;
    }
  }
  
  // Fallback
  return items[0].value;
};

/**
 * Returns a random question template from a list
 * @param {Array} templates - Array of question template strings
 * @returns {string} A randomly selected template
 */
export const getRandomQuestionTemplate = (templates) => {
  if (!templates || templates.length === 0) {
    return "What is the answer?";
  }
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Returns a random positive feedback message
 */
export const getRandomPositiveFeedback = () => {
  const messages = [
    "Excellent work!", "Great job!", "Perfect!", "That's correct!", 
    "Wonderful!", "Outstanding!", "You got it right!", "Well done!",
    "Amazing work!", "Spot on!", "Fantastic!", "Brilliant!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};