// Generate a random number within a range
export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Convert a number to its word representation
export const numberToWord = (num) => {
  const words = [
    'zero', 'one', 'two', 'three', 'four', 
    'five', 'six', 'seven', 'eight', 'nine', 
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 
    'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
  ];
  
  if (num >= 0 && num <= 20) {
    return words[num];
  }
  
  return num.toString();
};

// Generate number representation options
export const generateNumberRepresentations = (number, level = 1) => {
  // Different ways to represent a number
  const representations = [];
  
  // Add digit representation
  representations.push({
    type: 'digit',
    display: number.toString(),
    value: number
  });
  
  // Add word representation for levels 2 and up
  if (level >= 2 && number <= 20) {
    representations.push({
      type: 'word',
      display: numberToWord(number),
      value: number
    });
  }
  
  // Add object counting representation
  representations.push({
    type: 'objects',
    display: '🔵'.repeat(number),
    value: number
  });
  
  // Add tally marks for levels 3 and up
  if (level >= 3 && number <= 10) {
    const generateTallyMarks = (n) => {
      let tally = '';
      const fullGroups = Math.floor(n / 5);
      const remainder = n % 5;
      
      for (let i = 0; i < fullGroups; i++) {
        tally += '፩፩፩፩፩ ';
      }
      
      tally += '፩'.repeat(remainder);
      return tally;
    };
    
    representations.push({
      type: 'tally',
      display: generateTallyMarks(number),
      value: number
    });
  }
  
  return representations;
};

// Generate number recognition challenge
export const generateNumberChallenge = (level) => {
  // Determine number range based on level
  const maxNumber = level === 1 ? 10 : (level === 2 ? 20 : 100);
  const minNumber = level === 3 ? 10 : 0;
  
  // Generate target number and its representations
  const targetNumber = getRandomNumber(minNumber, maxNumber);
  const representations = generateNumberRepresentations(targetNumber, level);
  
  // Select a random representation as the question
  const questionRepIndex = getRandomNumber(0, representations.length - 1);
  const questionRep = representations[questionRepIndex];
  
  return { questionRep, targetNumber };
};