import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getRandomQuestionTemplate, wasRecentlyAsked, trackQuestion, getRandomPositiveFeedback } from '../../utils/questionDiversityUtils';
import getIcon from '../../utils/iconUtils';
import { add, subtract } from '../../utils/arithmeticUtils';

const BasicArithmeticGame = ({ onBackToMenu, onGameComplete, onScoreChange }) => {
  // Game state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [operationType, setOperationType] = useState('addition'); // 'addition' or 'subtraction'
  const [recentProblems, setRecentProblems] = useState([]);

  // Icons
  const HeartIcon = getIcon('Heart');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const StarIcon = getIcon('Star');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');
  const TrophyIcon = getIcon('Trophy');
  const SparkleStar = getIcon('Sparkles');

  // Generate a new question based on current level
  const generateQuestion = () => {
    // Alternate operations to provide variety, but with some randomness
    // Higher levels have more subtraction
    const rand = Math.random();
    if (currentLevel === 1) {
      setOperationType(rand < 0.7 ? 'addition' : 'subtraction');
    } else if (currentLevel === 2) {
      setOperationType(rand < 0.5 ? 'addition' : 'subtraction');
    } else {
      setOperationType(rand < 0.4 ? 'addition' : 'subtraction');
    }

    let num1, num2, correctAnswer, questionText, problemKey;
    let attempts = 0;
    let isDuplicate = false;

    // Try to avoid repeating the exact same problem
    do {
      isDuplicate = false;
      [num1, num2, correctAnswer, questionText, problemKey] = generateProblem();
      
      // Check if this is a duplicate problem
      if (recentProblems.includes(problemKey)) {
        isDuplicate = true;
        attempts++;
      }
    } while (isDuplicate && attempts < 5);

    // Track this problem
    trackRecentProblem(problemKey);
    
    // Set the question and options
    setQuestion({ text: questionText, correctAnswer });
    setOptions(generateOptions(correctAnswer, currentLevel));
    setSelectedOption(null);
    setShowFeedback(false);
  };
  
  // Generate a math problem based on level and operation
  const generateProblem = () => {
    let num1, num2, correctAnswer, questionText;
    
    if (operationType === 'addition') {
      // Addition: increasing number ranges by level
      switch (currentLevel) {
        case 1:
          num1 = Math.floor(Math.random() * 10); // 0-9
          num2 = Math.floor(Math.random() * 10); // 0-9
          break;
        case 2:
          num1 = Math.floor(Math.random() * 20); // 0-19
          num2 = Math.floor(Math.random() * 20); // 0-19
          break;
        case 3:
          num1 = Math.floor(Math.random() * 50); // 0-49
          num2 = Math.floor(Math.random() * 50); // 0-49
          break;
        default:
          num1 = Math.floor(Math.random() * 100); // 0-99
          num2 = Math.floor(Math.random() * 100); // 0-99
      }
      
      // Use the arithmetic utility for addition
      const addResult = add(num1, num2);
      if (addResult.success) {
        correctAnswer = addResult.result;
      } else {
        // Fallback if there's an issue with the utility
        correctAnswer = num1 + num2;
      }
      
      // Question templates for addition
      const questionTemplates = [
        `What is ${num1} + ${num2}?`,
        `Find the sum of ${num1} and ${num2}.`,
        `Calculate ${num1} + ${num2}:`,
        `${num1} plus ${num2} equals?`,
        `Add ${num1} and ${num2}:`
      ];
      
      // For level 3, include some word problems
      if (currentLevel === 3) {
        const objects = ['books', 'apples', 'toys', 'cards', 'points', 'stickers'];
        const object = objects[Math.floor(Math.random() * objects.length)];
        questionTemplates.push(
          `Sam has ${num1} ${object} and gets ${num2} more. How many ${object} does Sam have now?`,
          `If you have ${num1} ${object} and find ${num2} more, how many do you have in total?`
        );
      }
      questionText = getRandomQuestionTemplate(questionTemplates);
    } else {
      // Subtraction: increasing ranges by level
      switch (currentLevel) {
        case 1:
          num1 = Math.floor(Math.random() * 10) + 5; // 5-14
          num2 = Math.floor(Math.random() * num1); // 0 to num1-1
          break;
        case 2:
          num1 = Math.floor(Math.random() * 20) + 10; // 10-29
          num2 = Math.floor(Math.random() * num1); // 0 to num1-1
          break;
        case 3:
          num1 = Math.floor(Math.random() * 50) + 20; // 20-69
          num2 = Math.floor(Math.random() * num1); // 0 to num1-1
          break;
        default:
          num1 = Math.floor(Math.random() * 100) + 50; // 50-149
          num2 = Math.floor(Math.random() * num1); // 0 to num1-1
      }
      
      // Use the arithmetic utility for subtraction
      const subtractResult = subtract(num1, num2);
      if (subtractResult.success) {
        correctAnswer = subtractResult.result;
      } else {
        // Fallback if there's an issue with the utility
        correctAnswer = num1 - num2;
      }
      
      // Question templates for subtraction
      const questionTemplates = [
        `What is ${num1} - ${num2}?`,
        `Find the difference of ${num1} and ${num2}.`,
        `Calculate ${num1} - ${num2}:`,
        `${num1} minus ${num2} equals?`,
        `Subtract ${num2} from ${num1}:`
      ];
      
      // For level 3, include some word problems
      if (currentLevel === 3) {
        const objects = ['books', 'apples', 'toys', 'cards', 'points', 'stickers'];
        const object = objects[Math.floor(Math.random() * objects.length)];
        questionTemplates.push(
          `Sam has ${num1} ${object} and gives away ${num2}. How many ${object} does Sam have left?`,
          `If you have ${num1} ${object} and use ${num2}, how many remain?`
        );
      }
      questionText = getRandomQuestionTemplate(questionTemplates);
    }
    
    // Create a key to identify this problem
    const problemKey = `${operationType}-${num1}-${num2}`;
    
    return [num1, num2, correctAnswer, questionText, problemKey];
  };
  
  // Track a problem to avoid repetition
  const trackRecentProblem = (problemKey) => {
    setRecentProblems(prev => {
      const updated = [...prev, problemKey];
      // Keep only the last 10 problems
      return updated.length > 10 ? updated.slice(-10) : updated;
    });
  };
  // Generate multiple choice options
  const generateOptions = (correctAnswer, level) => {
    const options = [correctAnswer];
    const maxOffset = Math.max(5, Math.min(10, correctAnswer)); // Appropriate range for difficulty
    
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * maxOffset) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const newOption = correctAnswer + (offset * sign);
      
      // Ensure no duplicates and no negative numbers for beginners
      if (!options.includes(newOption) && (level > 1 || newOption >= 0)) {
        options.push(newOption);
      }
    }
    
    return shuffleArray(options);
  };

  // Shuffle array helper function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Start game and generate first question
  useEffect(() => {
    generateQuestion();
  }, [currentLevel]);

  // Update parent component score
  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (showFeedback || gameOver) return;
    
    setSelectedOption(option);
    setShowFeedback(true);
    
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      // Correct answer
      const levelMultiplier = currentLevel;
      const pointsEarned = 10 * levelMultiplier;
      setScore(prevScore => prevScore + pointsEarned);
      setStreak(prevStreak => prevStreak + 1);
      
      toast.success(`+${pointsEarned} points!`, { 
        icon: <StarIcon className="text-yellow-400" />,
        autoClose: 1000
      });
    } else {
      // Incorrect answer
      setLives(prevLives => prevLives - 1);
      setStreak(0);
      
      if (lives <= 1) {
        setGameOver(true);
        toast.error("Game over! You've run out of lives.", {
          autoClose: false,
          closeButton: true
        });
      }
    }
    
    // Track questions answered
    setQuestionsAnswered(prevQuestions => prevQuestions + 1);
    
    // Check if level is complete (5 questions per level)
    if (questionsAnswered + 1 >= 5) {
      setTimeout(() => {
        setLevelComplete(true);
      }, 1500);
    } else {
      // Move to next question after delay
      setTimeout(() => {
        generateQuestion();
      }, 1500);
    }
  };

  // Handle level completion
  const advanceLevel = () => {
    setCurrentLevel(prevLevel => prevLevel + 1);
    setQuestionsAnswered(0);
    setLevelComplete(false);
    
    toast.info(`🚀 Level ${currentLevel + 1} unlocked!`, {
      icon: getIcon('Zap')({ className: "text-purple-500" })
    });
  };

  // Handle game restart
  const restartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setLives(3);
    setQuestionsAnswered(0);
    setStreak(0);
    setGameOver(false);
    setLevelComplete(false);
    generateQuestion();
    
    toast.info("Game restarted! Good luck!");
  };

  // Handle game completion
  const handleGameComplete = () => {
    onGameComplete(score, currentLevel);
    onBackToMenu();
  };

  return (
    <div className="card p-6 md:p-8">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBackToMenu}
          className="flex items-center gap-1 text-surface-600 dark:text-surface-400 hover:text-primary-dark hover:dark:text-primary-light transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Games</span>
        </button>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <HeartIcon 
                  key={i} 
                  className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-surface-300 dark:text-surface-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Content */}
      <AnimatePresence mode="wait">
        {!gameOver && !levelComplete ? (
          <div>
            {/* Level and streak display */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-medium text-primary-dark dark:text-primary-light">Level {currentLevel}</div>
              
              {streak > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                  <SparkleStar className="w-4 h-4" />
                  <span>{streak} in a row!</span>
                </div>
              )}
            </div>
            
            {/* Question */}
            <div className="mb-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-6">{question?.text}</h3>
              
              {/* Progress Bar */}
              <div className="h-1 w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${questionsAnswered * 20}%` }}
                />
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Question {questionsAnswered + 1}/5
              </p>
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showFeedback}
                  className={`p-4 rounded-xl font-medium text-center transition-all ${
                    selectedOption === option
                      ? isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-2 border-red-500'
                      : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-200'
                  }`}
                  whileHover={{ scale: showFeedback ? 1 : 1.03 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                >
                  {option}
                  {showFeedback && selectedOption === option && (
                    <span className="inline-flex ml-2">
                      {isCorrect ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-lg mb-4 ${
                    isCorrect
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Great job! That's correct!</p>
                          <p className="font-medium">{getRandomPositiveFeedback()}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            Not quite! The correct answer is: <span className="font-bold">{question.correctAnswer}</span>
                          </p>
                          {operationType === 'addition' && (
                            <p className="text-sm mt-1">Remember, when adding numbers, the total gets larger.</p>
                          )}
                          {operationType === 'subtraction' && (
                            <p className="text-sm mt-1">When subtracting, the result is smaller than the first number.</p>
                          )}
                        </div>
                      </>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : levelComplete ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <div className="inline-block mb-6 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <TrophyIcon className="h-12 w-12 text-amber-500" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Level {currentLevel} Complete!
            </h2>
            
            <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
              Great job! You've completed level {currentLevel} of Basic Arithmetic. 
              Ready for a bigger challenge?
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={advanceLevel}
                className="btn btn-primary py-3 px-6"
              >
                Next Level
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <div className="inline-block mb-6 p-3 bg-primary/10 dark:bg-primary/20 rounded-full">
              <TrophyIcon className="h-12 w-12 text-primary-dark dark:text-primary-light" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Game Over!
            </h2>
            
            <p className="text-surface-600 dark:text-surface-400 mb-8">
              You earned <span className="font-bold text-amber-500">{score} points</span> and reached level {currentLevel}!
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={restartGame}
                className="btn btn-primary py-3 px-6"
              >
                Play Again
              </button>
              <button
                onClick={handleGameComplete}
                className="btn btn-secondary py-3 px-6"
              >
                Back to Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BasicArithmeticGame;