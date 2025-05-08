import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../../utils/iconUtils';
import { 
  createFraction, 
  addFractions, 
  subtractFractions, 
  multiplyFractions, 
  simplifyFraction, 
  formatFraction 
} from '../../utils/fractionUtils';

const FractionGame = ({ 
  onGameComplete, 
  onBackToMenu, 
  onScoreChange, 
  initialLevel = 1, 
  initialLives = 3 
}) => {
  // Game state
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState('identify-fraction'); // 'identify-fraction', 'add-subtract', 'multiply'

  // Icons
  const HeartIcon = getIcon('Heart');
  const DivideIcon = getIcon('Divide');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const RefreshCwIcon = getIcon('RefreshCw');
  const PlusIcon = getIcon('Plus');
  const MinusIcon = getIcon('Minus');
  const XIcon = getIcon('X'); // Multiplication symbol

  // Generate a new question
  useEffect(() => {
    generateQuestion();
  }, [level, gameMode]);

  // Report score changes to parent
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score]);

  // Set game mode based on level
  useEffect(() => {
    if (level === 1) {
      setGameMode('identify-fraction');
    } else if (level === 2) {
      setGameMode('add-subtract');
    } else {
      setGameMode('multiply');
    }
  }, [level]);

  const generateQuestion = () => {
    if (gameMode === 'identify-fraction') {
      generateIdentifyFractionQuestion();
    } else if (gameMode === 'add-subtract') {
      Math.random() > 0.5 ? generateAdditionQuestion() : generateSubtractionQuestion();
    } else {
      generateMultiplicationQuestion();
    }
  };

  const generateIdentifyFractionQuestion = () => {
    // Generate a simple fraction for level 1 (visualization and identification)
    const denominator = Math.floor(Math.random() * 8) + 2; // 2-9
    const numerator = Math.floor(Math.random() * denominator) + 1; // 1 to denominator

    // Create visual representation (e.g., "■■■□□" for 3/5)
    const filled = '■'.repeat(numerator);
    const empty = '□'.repeat(denominator - numerator);
    const visual = filled + empty;

    // Create the fraction
    const fraction = createFraction(numerator, denominator);

    if (fraction.success) {
      // Set the question
      setQuestion({
        text: "What fraction is represented by the filled squares?",
        display: visual,
        type: 'visualization',
        correctAnswer: `${numerator}/${denominator}`,
        correctFraction: fraction.fraction
      });

      // Generate answer options (including the correct answer)
      generateFractionOptions(fraction.fraction);
    } else {
      // Retry if there was an error
      generateIdentifyFractionQuestion();
    }
  };

  const generateAdditionQuestion = () => {
    // Generate two simple fractions to add
    const maxDenominator = level === 2 ? 8 : 12;
    
    // Create first fraction
    const den1 = Math.floor(Math.random() * (maxDenominator - 1)) + 2; // 2 to maxDenominator
    const num1 = Math.floor(Math.random() * (den1 - 1)) + 1; // 1 to den1-1
    const fraction1 = createFraction(num1, den1);
    
    // Create second fraction
    const den2 = Math.floor(Math.random() * (maxDenominator - 1)) + 2; // 2 to maxDenominator
    const num2 = Math.floor(Math.random() * (den2 - 1)) + 1; // 1 to den2-1
    const fraction2 = createFraction(num2, den2);
    
    if (fraction1.success && fraction2.success) {
      // Calculate the correct answer
      const sumResult = addFractions(fraction1.fraction, fraction2.fraction);
      
      if (sumResult.success) {
        // Format question
        const questionText = `What is ${num1}/${den1} + ${num2}/${den2}?`;
        
        // Set the question
        setQuestion({
          text: questionText,
          display: `${num1}/${den1} + ${num2}/${den2}`,
          type: 'addition',
          correctAnswer: `${sumResult.fraction.numerator}/${sumResult.fraction.denominator}`,
          correctFraction: sumResult.fraction
        });
        
        // Generate answer options
        generateFractionOptions(sumResult.fraction);
      } else {
        // Retry if addition failed
        generateAdditionQuestion();
      }
    } else {
      // Retry if fraction creation failed
      generateAdditionQuestion();
    }
  };

  const generateSubtractionQuestion = () => {
    // Generate two simple fractions where the first is greater than the second
    const maxDenominator = level === 2 ? 8 : 12;
    
    // To avoid negative results, we'll create a larger fraction first, then a smaller one
    const den1 = Math.floor(Math.random() * (maxDenominator - 1)) + 2; // 2 to maxDenominator
    const num1 = Math.floor(Math.random() * (den1 - 1)) + 1; // 1 to den1-1
    const fraction1 = createFraction(num1, den1);
    
    // Create second fraction that's smaller than the first
    const den2 = Math.floor(Math.random() * (maxDenominator - 1)) + 2; // 2 to maxDenominator
    // Calculate the equivalent numerator of fraction1 with den2 as denominator
    const equivalentNum1 = (num1 * den2) / den1;
    // Choose a numerator for fraction2 that's smaller than equivalentNum1
    const maxNum2 = Math.floor(equivalentNum1);
    const num2 = maxNum2 > 0 ? Math.floor(Math.random() * maxNum2) + 1 : 1;
    const fraction2 = createFraction(num2, den2);
    
    if (fraction1.success && fraction2.success) {
      // Calculate the correct answer
      const diffResult = subtractFractions(fraction1.fraction, fraction2.fraction);
      
      if (diffResult.success) {
        // Format question
        const questionText = `What is ${num1}/${den1} - ${num2}/${den2}?`;
        
        // Set the question
        setQuestion({
          text: questionText,
          display: `${num1}/${den1} - ${num2}/${den2}`,
          type: 'subtraction',
          correctAnswer: `${diffResult.fraction.numerator}/${diffResult.fraction.denominator}`,
          correctFraction: diffResult.fraction
        });
        
        // Generate answer options
        generateFractionOptions(diffResult.fraction);
      } else {
        // Retry if subtraction failed
        generateSubtractionQuestion();
      }
    } else {
      // Retry if fraction creation failed
      generateSubtractionQuestion();
    }
  };

  const generateMultiplicationQuestion = () => {
    // Generate two simple fractions to multiply
    const maxDenominator = 6;
    
    // Create first fraction
    const den1 = Math.floor(Math.random() * (maxDenominator - 1)) + 2; // 2 to maxDenominator
    const num1 = Math.floor(Math.random() * (den1 * 2 - 1)) + 1; // 1 to den1*2
    const fraction1 = createFraction(num1, den1);
    
    // Create second fraction
    const den2 = Math.floor(Math.random() * (maxDenominator - 1)) + 2; // 2 to maxDenominator
    const num2 = Math.floor(Math.random() * (den2 * 2 - 1)) + 1; // 1 to den2*2
    const fraction2 = createFraction(num2, den2);
    
    if (fraction1.success && fraction2.success) {
      // Calculate the correct answer
      const productResult = multiplyFractions(fraction1.fraction, fraction2.fraction);
      
      if (productResult.success) {
        // Format question
        const questionText = `What is ${num1}/${den1} × ${num2}/${den2}?`;
        
        // Set the question
        setQuestion({
          text: questionText,
          display: `${num1}/${den1} × ${num2}/${den2}`,
          type: 'multiplication',
          correctAnswer: `${productResult.fraction.numerator}/${productResult.fraction.denominator}`,
          correctFraction: productResult.fraction
        });
        
        // Generate answer options
        generateFractionOptions(productResult.fraction);
      } else {
        // Retry if multiplication failed
        generateMultiplicationQuestion();
      }
    } else {
      // Retry if fraction creation failed
      generateMultiplicationQuestion();
    }
  };

  const generateFractionOptions = (correctFraction) => {
    // Start with the correct answer
    const formattedCorrectAnswer = `${correctFraction.numerator}/${correctFraction.denominator}`;
    const options = [formattedCorrectAnswer];
    
    // Generate incorrect options
    while (options.length < 4) {
      let incorrectOption;
      
      if (Math.random() > 0.5) {
        // Modify the numerator
        const offset = Math.floor(Math.random() * 5) + 1;
        const sign = Math.random() > 0.5 ? 1 : -1;
        const newNumerator = correctFraction.numerator + (offset * sign);
        
        if (newNumerator > 0) {
          incorrectOption = `${newNumerator}/${correctFraction.denominator}`;
        }
      } else {
        // Modify the denominator
        const offset = Math.floor(Math.random() * 5) + 1;
        const sign = Math.random() > 0.5 ? 1 : -1;
        const newDenominator = correctFraction.denominator + (offset * sign);
        
        if (newDenominator > 1) {
          incorrectOption = `${correctFraction.numerator}/${newDenominator}`;
        }
      }
      
      // Add the option if it's valid and not a duplicate
      if (incorrectOption && !options.includes(incorrectOption)) {
        options.push(incorrectOption);
      }
    }
    
    // Shuffle options
    setOptions(shuffleArray(options));
    setSelectedOption(null);
    setShowFeedback(false);
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

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (showFeedback || gameOver) return;
    
    setSelectedOption(option);
    setShowFeedback(true);
    
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      // Correct answer
      const pointsEarned = 10 * level;
      setScore(prevScore => prevScore + pointsEarned);
      setStreak(prevStreak => prevStreak + 1);
      
      toast.success(`+${pointsEarned} points!`, { autoClose: 1000 });
    } else {
      // Incorrect answer
      setLives(prevLives => prevLives - 1);
      setStreak(0);
      
      if (lives <= 1) {
        setGameOver(true);
        toast.error("Game over! You've run out of lives.");
        onGameComplete && onGameComplete(score, level);
      }
    }
    
    // Track questions answered
    setQuestionsAnswered(prev => prev + 1);
    
    // Check if level is complete (5 questions per level)
    if ((questionsAnswered + 1) % 5 === 0 && !gameOver) {
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

  // Advance to next level
  const advanceLevel = () => {
    setLevel(prevLevel => prevLevel + 1);
    setLevelComplete(false);
    
    toast.info(`🚀 Level ${level + 1} unlocked!`);
  };

  // Restart game
  const restartGame = () => {
    setLevel(initialLevel);
    setScore(0);
    setLives(initialLives);
    setStreak(0);
    setQuestionsAnswered(0);
    setGameOver(false);
    setLevelComplete(false);
    setGameMode('identify-fraction');
    generateQuestion();
    
    toast.info("Game restarted! Good luck!");
  };

  // Render question display based on type
  const renderQuestionDisplay = () => {
    if (question?.type === 'visualization') {
      return (
        <div className="text-center text-4xl mb-4 font-mono tracking-wider">{question.display}</div>
      );
    } else {
      return (
        <div className="text-center text-3xl font-bold mb-4">{question.display}</div>
      );
    }
  };

  if (gameOver) {
    return (
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Game Over</h2>
        <p className="text-center mb-6">You scored {score} points and reached level {level}!</p>
        <div className="flex justify-center gap-4">
          <button onClick={restartGame} className="btn btn-primary">Play Again</button>
          <button onClick={onBackToMenu} className="btn btn-secondary">Back to Menu</button>
        </div>
      </div>
    );
  }

  if (levelComplete) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Level {level} Complete!</h2>
        <p className="mb-6">Great job! You've completed level {level}. Are you ready for the next challenge?</p>
        <button onClick={advanceLevel} className="btn btn-primary">Go to Level {level + 1}</button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Game header */}
      <div className="flex justify-between mb-6">
        <button 
          onClick={onBackToMenu} 
          className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-6">
          <div className="flex">
            {Array.from({ length: initialLives }).map((_, i) => (
              <HeartIcon 
                key={i} 
                className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-surface-300 dark:text-surface-700'}`}
              />
            ))}
          </div>
          
          <div>
            <span className="text-sm text-surface-500">Level: {level}</span>
          </div>
        </div>
        
        <button 
          onClick={restartGame}
          className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200"
          title="Restart Game"
        >
          <RefreshCwIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl text-center mb-4">{question?.text}</h3>
        {renderQuestionDisplay()}
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(questionsAnswered % 5) * 20}%` }}
          />
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 text-center">
          Question {(questionsAnswered % 5) + 1}/5
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
              (showFeedback && selectedOption === option) 
                ? isCorrect
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-2 border-red-500'
                : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
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
      
      {/* Feedback message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-lg mt-4 ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <p className="font-medium">
                {isCorrect ? 'Great job! That\'s correct!' : `The correct answer is: ${question.correctAnswer}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FractionGame;