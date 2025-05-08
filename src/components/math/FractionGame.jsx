import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getRandomQuestionTemplate, wasRecentlyAsked, trackQuestion, getRandomPositiveFeedback } from '../../utils/questionDiversityUtils';
import getIcon from '../../utils/iconUtils';
import {
  createFraction,
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
  simplifyFraction,
  formatFraction
} from '../../utils/fractionUtils';

const FractionGame = ({ onBackToMenu, onGameComplete, onScoreChange }) => {
  // Game state
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [recentFractionProblems, setRecentFractionProblems] = useState([]);

  // Icons
  const HeartIcon = getIcon('Heart');
  const HomeIcon = getIcon('Home');
  const StarIcon = getIcon('Star');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');
  const RefreshCwIcon = getIcon('RefreshCw');
  const ZapIcon = getIcon('Zap');
  const TrophyIcon = getIcon('Trophy');

  // Initialize the game
  useEffect(() => {
    generateQuestion();
  }, [level]);

  // Generate a fraction question based on current level
  const generateQuestion = () => {
    let questionType, fraction1, fraction2, operation, correctResult, correctAnswer, questionText, problemKey;
    let isDuplicate = false;
    let attempts = 0;
    
    do {
    
    // Different question types based on level
    const questionTypes = level === 1 
      ? ['identify', 'addition'] 
      : level === 2 
        ? ['addition', 'subtraction'] 
        : ['addition', 'subtraction', 'multiplication'];
    
    questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    // Generate two simple fractions based on level
    const max = level === 1 ? 6 : level === 2 ? 10 : 12;
    
    // Generate first fraction with nonzero values
    let num1, den1;
    do {
      num1 = Math.floor(Math.random() * max) + 1;
      den1 = Math.floor(Math.random() * max) + 2; // Ensure denominator > 1
    } while (num1 > den1); // Keep proper fractions for simplicity
    
    // Generate second fraction with nonzero values
    let num2, den2;
    do {
      num2 = Math.floor(Math.random() * max) + 1;
      den2 = Math.floor(Math.random() * max) + 2; // Ensure denominator > 1
    } while (num2 > den2); // Keep proper fractions for simplicity
    
    fraction1 = createFraction(num1, den1).fraction;
    fraction2 = createFraction(num2, den2).fraction;
    
    // Create the question based on type
    let questionTemplates = [];
    
    switch (questionType) {
      case 'identify':
        // Simply identify the equivalent fraction
        const simplifiedFrac = simplifyFraction(fraction1).fraction;
        
        questionTemplates = [
          `Which fraction is equivalent to ${formatFraction(fraction1)}?`,
          `Select the fraction equal to ${formatFraction(fraction1)}:`,
          `Which of these equals ${formatFraction(fraction1)}?`,
          `Find the equivalent fraction for ${formatFraction(fraction1)}:`
        ];
        
        questionText = getRandomQuestionTemplate(questionTemplates);
        correctAnswer = formatFraction(simplifiedFrac);
        problemKey = `identify-${fraction1.numerator}-${fraction1.denominator}`;
        break;
      
      case 'addition':
        operation = addFractions;
        
        questionTemplates = [
          `What is ${formatFraction(fraction1)} + ${formatFraction(fraction2)}?`,
          `Find the sum: ${formatFraction(fraction1)} + ${formatFraction(fraction2)}`,
          `Add these fractions: ${formatFraction(fraction1)} + ${formatFraction(fraction2)}`,
          `Calculate ${formatFraction(fraction1)} + ${formatFraction(fraction2)}:`
        ];
        
        // Add word problems for higher levels
        if (level >= 2) {
          const contexts = ['pizza', 'chocolate bar', 'cake', 'hour'];
          const context = contexts[Math.floor(Math.random() * contexts.length)];
          
          questionTemplates.push(
            `Sam ate ${formatFraction(fraction1)} of a ${context} and then another ${formatFraction(fraction2)}. How much ${context} did Sam eat in total?`,
            `If you use ${formatFraction(fraction1)} of a ${context} and then another ${formatFraction(fraction2)}, how much have you used altogether?`
          );
        }
        
        questionText = getRandomQuestionTemplate(questionTemplates);
        correctResult = operation(fraction1, fraction2);
        correctAnswer = formatFraction(correctResult.fraction);
        break;
      
      case 'subtraction':
        // Ensure the result is positive by making the first fraction larger if needed
        if (fraction1.numerator * fraction2.denominator < fraction2.numerator * fraction1.denominator) {
          [fraction1, fraction2] = [fraction2, fraction1];
        }
        
        questionTemplates = [
          `What is ${formatFraction(fraction1)} - ${formatFraction(fraction2)}?`,
          `Find the difference: ${formatFraction(fraction1)} - ${formatFraction(fraction2)}`,
          `Subtract: ${formatFraction(fraction1)} - ${formatFraction(fraction2)}`,
          `Calculate ${formatFraction(fraction1)} - ${formatFraction(fraction2)}:`
        ];
        
        questionText = `What is ${formatFraction(fraction1)} - ${formatFraction(fraction2)}?`;
        correctResult = operation(fraction1, fraction2);
        correctAnswer = formatFraction(correctResult.fraction);
        break;
      
      case 'multiplication':
        
        questionTemplates = [
          `What is ${formatFraction(fraction1)} × ${formatFraction(fraction2)}?`,
          `Find the product: ${formatFraction(fraction1)} × ${formatFraction(fraction2)}`,
          `Multiply: ${formatFraction(fraction1)} × ${formatFraction(fraction2)}`,
          `Calculate ${formatFraction(fraction1)} × ${formatFraction(fraction2)}:`
        ];
        
        questionText = getRandomQuestionTemplate(questionTemplates);
        questionText = `What is ${formatFraction(fraction1)} × ${formatFraction(fraction2)}?`;
        correctResult = operation(fraction1, fraction2);
        correctAnswer = formatFraction(correctResult.fraction);
        break;
    }
    
    // Generate options (including the correct answer)
    const optionsArray = generateOptions(correctAnswer, questionType, fraction1, fraction2);

    // Create a unique key for this problem
    problemKey = `${questionType}-${fraction1.numerator}-${fraction1.denominator}-${fraction2.numerator}-${fraction2.denominator}`;
    
    // Check if this exact problem was recently seen
    isDuplicate = recentFractionProblems.includes(problemKey);
    attempts++;
  } while (isDuplicate && attempts < 5);
    
    // Add to recent problems list
    setRecentFractionProblems(prev => 
      [...prev.slice(Math.max(0, prev.length - 9)), problemKey]);
    
    setQuestion({
      text: questionText,
      correctAnswer,
      type: questionType,
      fractions: [fraction1, fraction2]
    });
    setOptions(optionsArray);
    setSelectedOption(null);
    setShowFeedback(false);
  };
  
  // Generate answer options
  const generateOptions = (correctAnswer, questionType, fraction1, fraction2) => {
    const options = [correctAnswer];
    
    // Generate distractors based on question type
    while (options.length < 4) {
      let distractorOption;
      
      switch (questionType) {
        case 'identify':
          // Common mistakes when simplifying
          const num = fraction1.numerator;
          const den = fraction1.denominator;
          
          // Generates potential distractors:
          // 1. Wrong simplification - subtracting instead of dividing
          // 2. Not simplifying at all
          // 3. Inverting the fraction
          const distractors = [
            `${num}/${den}`, // Original unsimplified
            `${den - num}/${den}`, // Wrong subtraction
            `${den}/${num}`, // Inverted
            `${num + 1}/${den - 1}`, // Modified values
          ];
          
          distractorOption = distractors[Math.floor(Math.random() * distractors.length)];
          break;
        
        case 'addition':
        case 'subtraction':
        case 'multiplication':
          // Common mistakes in operations:
          // 1. Operating only on numerators
          // 2. Operating only on denominators
          // 3. Using wrong operation
          
          const num1 = fraction1.numerator;
          const den1 = fraction1.denominator;
          const num2 = fraction2.numerator;
          const den2 = fraction2.denominator;
          
          let wrongAnswers = [];
          
          if (questionType === 'addition') {
            wrongAnswers = [
              `${num1 + num2}/${den1}`, // Add only numerators
              `${num1}/${den1 + den2}`, // Add only denominators
              `${num1 - num2}/${den1 - den2}`, // Wrong operation (subtraction)
              `${num1 * num2}/${den1 * den2}`, // Wrong operation (multiplication)
            ];
          } else if (questionType === 'subtraction') {
            wrongAnswers = [
              `${num1 - num2}/${den1}`, // Subtract only numerators
              `${num1}/${den1 - den2}`, // Subtract only denominators
              `${num1 + num2}/${den1 + den2}`, // Wrong operation (addition)
              `${num1 * num2}/${den1 * den2}`, // Wrong operation (multiplication)
            ];
          } else if (questionType === 'multiplication') {
            wrongAnswers = [
              `${num1 + num2}/${den1 + den2}`, // Wrong operation (addition)
              `${num1 - num2}/${den1 - den2}`, // Wrong operation (subtraction)
              `${num1 * num2}/${Math.max(den1, den2)}`, // Wrong denominator
              `${Math.min(num1, num2)}/${den1 * den2}`, // Wrong numerator
            ];
          }
          
          distractorOption = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
          break;
      }
      
      // Only add if not already in options and not equal to correct answer
      if (distractorOption && !options.includes(distractorOption) && distractorOption !== correctAnswer) {
        options.push(distractorOption);
      }
    }
    
    // Shuffle options
    return shuffleArray(options);
  };
  
  // Helper to shuffle an array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle option selection
  const handleOptionSelect = (option) => {
    if (showFeedback || gameOver) return;
    
    setSelectedOption(option);
    setShowFeedback(true);
    
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      // Correct answer
      const levelMultiplier = level;
      const pointsEarned = 10 * levelMultiplier;
      const newScore = score + pointsEarned;
      setScore(newScore);
      setStreak(streak + 1);
      
      // Notify parent component of score change
      onScoreChange(newScore);
      
      toast.success(`+${pointsEarned} points!`, { 
      });
      
      // Additional motivational message for higher streaks
      if (streak + 1 >= 3) {
        setTimeout(() => {
          toast.info(`${getRandomPositiveFeedback()} You're on fire with ${streak + 1} correct answers in a row!`, {
            icon: <StarIcon className="text-yellow-400" />,
            autoClose: 1000
          });
        }, 1200);
      }
    } else {
      // Incorrect answer
      setLives(lives - 1);
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
    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    
    // Check if level is complete (5 questions per level)
    if (newQuestionsAnswered >= 5) {
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
  
  // Handle advancing to next level
  const advanceLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setQuestionsAnswered(0);
    setLevelComplete(false);
    
    toast.info(`🚀 Level ${newLevel} unlocked!`, {
      icon: <ZapIcon className="text-purple-500" />
    });
  };
  
  // Handle game restart
  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setQuestionsAnswered(0);
    setStreak(0);
    setGameOver(false);
    setLevelComplete(false);
    generateQuestion();
    
    // Notify parent of score reset
    onScoreChange(0);
    
    toast.info("Game restarted! Good luck!");
  };
  
  return (
    <div className="card p-6 md:p-8">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Fraction Fun</h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">Level: {level}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Lives */}
          <div className="flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <HeartIcon 
                key={i} 
                className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-surface-300 dark:text-surface-700'}`}
              />
            ))}
          </div>
          
          {/* Controls */}
          <button 
            onClick={restartGame}
            className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
            title="Restart Game"
          >
            <RefreshCwIcon className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onBackToMenu}
            className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
            title="Back to Menu"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Rest of game implementation similar to other math games */}
      {/* Question display */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold mb-4">{question?.text}</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <p className="font-medium">{getRandomPositiveFeedback()}</p>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="font-medium">
                    Not quite! The correct answer is: <span className="font-bold">{question.correctAnswer}</span>
                  </p>
                  
                  {/* Add specific fraction-related hints based on question type */}
                  {question.type === 'identify' && (
                    <p className="text-sm mt-1">
                      Remember to simplify fractions by finding the GCD (greatest common divisor) of the numerator and denominator.
                    </p>
                  )}
                  
                  {question.type === 'addition' && (
                    <p className="text-sm mt-1">
                      When adding fractions, make sure the denominators are the same first by finding a common denominator.
                    </p>
                  )}
                  
                  {question.type === 'subtraction' && (
                    <p className="text-sm mt-1">
                      When subtracting fractions, the denominators must be the same. Try finding a common denominator first.
                    </p>
                  )}
                  
                  {question.type === 'multiplication' && <p className="text-sm mt-1">When multiplying fractions, multiply numerators together and denominators together.</p>}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level Complete */}
      {levelComplete && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-block mb-4 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <TrophyIcon className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Level {level} Complete!</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            You've mastered the fraction challenges at this level.
          </p>
          <button
            onClick={advanceLevel}
            className="btn btn-primary py-2 px-6"
          >
            Next Level
          </button>
        </motion.div>
      )}
      
      {/* Game Over */}
      {gameOver && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-xl font-bold mb-2">Game Over!</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            You earned <span className="font-bold text-amber-500">{score} points</span> and reached level {level}!
          </p>
          <button
            onClick={restartGame}
            className="btn btn-primary py-2 px-6"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default FractionGame;