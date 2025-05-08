import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getRandomQuestionTemplate, wasRecentlyAsked, trackQuestion, getRandomPositiveFeedback } from '../../utils/questionDiversityUtils';
import getIcon from '../../utils/iconUtils';
import { generateNumberChallenge, getRandomNumber, numberToWord } from '../../utils/mathUtils';

const NumberRecognitionGame = ({ 
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
  const [gameMode, setGameMode] = useState('identify-number'); // or 'match-representation'
  const [recentNumbers, setRecentNumbers] = useState([]);

  // Icons
  const HeartIcon = getIcon('Heart');
  const HashIcon = getIcon('Hash');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const StarIcon = getIcon('Star');
  const RefreshCwIcon = getIcon('RefreshCw');

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

  const generateQuestion = () => {
    // Alternate between game modes with some randomness
    if (questionsAnswered > 0) {
      // Weighted randomness so "identify-number" appears more often
      const rand = Math.random();
      if (rand < 0.65) {
        setGameMode('identify-number');
      } else {
        setGameMode('match-representation');
      }
    }

    if (gameMode === 'identify-number') {
      generateIdentifyNumberQuestion();
    } else {
      generateMatchRepresentationQuestion();
    }
  };

  // Check if a number was recently used
  const wasNumberRecentlyUsed = (num) => {
    return recentNumbers.includes(num);
  };

  // Track a number to avoid repetition
  const trackRecentNumber = (num) => {
    setRecentNumbers(prev => {
      const updated = [...prev, num];
      // Keep only the last 10 numbers
      return updated.length > 10 ? updated.slice(-10) : updated;
    });
  };

  const generateIdentifyNumberQuestion = () => {
    let challenge;
    let attempts = 0;
    
    // Try to avoid repeating numbers
    do {
      challenge = generateNumberChallenge(level);
      attempts++;
    } while (wasNumberRecentlyUsed(challenge.targetNumber) && attempts < 5);
    
    const { questionRep, targetNumber } = challenge;
    trackRecentNumber(targetNumber);
    
    // Set the question
    setQuestion({
      text: `What number is this?`,
      display: questionRep.display,
      type: questionRep.type,
      correctAnswer: targetNumber
    });
    
    // Generate answer options
    const optionNumbers = [targetNumber];
    const range = level === 1 ? 5 : (level === 2 ? 10 : 20);
    
    // Add distinct incorrect options
    while (optionNumbers.length < 4) {
      const randomNumber = getRandomNumber(
        Math.max(0, targetNumber - range), 
        targetNumber + range
      );
      
      if (!optionNumbers.includes(randomNumber)) {
        optionNumbers.push(randomNumber);
      }
    }
    
    // Shuffle options
    const shuffledOptions = shuffleArray(optionNumbers);
    setOptions(shuffledOptions);
    
    // Reset selection state
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const generateMatchRepresentationQuestion = () => {
    // Define number range based on level
    const maxNumber = level === 1 ? 10 : (level === 2 ? 20 : 100);
    const minNumber = level === 3 ? 10 : 1;
    
    // Get a target number that wasn't recently used
    let targetNumber;
    let attempts = 0;
    
    do {
      targetNumber = getRandomNumber(minNumber, maxNumber);
      attempts++;
    } while (wasNumberRecentlyUsed(targetNumber) && attempts < 5);
    
    // Track this number
    trackRecentNumber(targetNumber);
    
    // Question templates for variety
    const questionTemplates = [
      `Find the number ${targetNumber}`,
      `Which option shows the number ${targetNumber}?`,
      `Select the representation of ${targetNumber}`,
      `Where do you see the number ${targetNumber}?`,
      `Identify the representation of ${targetNumber}`
    ];
    
    // Create the question
    setQuestion({
      text: getRandomQuestionTemplate(questionTemplates),
      display: targetNumber.toString(),
      type: 'prompt',
      correctAnswer: targetNumber
    });
    
    // Generate answer options with different representations
    const optionNumbers = [targetNumber];
    const range = level === 1 ? 3 : (level === 2 ? 5 : 10);
    
    // Add distinct incorrect options
    while (optionNumbers.length < 4) {
      const randomNumber = getRandomNumber(
        Math.max(1, targetNumber - range), 
        targetNumber + range
      );

      // Avoid having too similar options (e.g. avoid 7, 7, 7, 7)
      if (optionNumbers.some(n => Math.abs(n - randomNumber) < 2)) continue;
      if (!optionNumbers.includes(randomNumber)) {
        optionNumbers.push(randomNumber);
      }
    }
    
    // Create representations for each option
    const optionReps = optionNumbers.map(num => {
      // Choose a random representation type for each option
      const repTypes = ['digit', 'objects'];
      if (level >= 2 && num <= 20) repTypes.push('word');
      if (level >= 3 && num <= 10) repTypes.push('tally');
      
      const repType = repTypes[getRandomNumber(0, repTypes.length - 1)];
      
      let display;
      switch (repType) {
        case 'word':
          display = numberToWord(num);
          break;
        case 'objects':
          display = '🔵'.repeat(num);
          break;
        case 'tally':
          const fullGroups = Math.floor(num / 5);
          const remainder = num % 5;
          display = '፩፩፩፩፩ '.repeat(fullGroups) + '፩'.repeat(remainder);
          break;
        default: // digit
          display = num.toString();
      }
      
      return {
        value: num,
        display,
        type: repType
      };
    });
    
    // Shuffle option representations
    setOptions(shuffleArray(optionReps));
    
    // Reset selection state
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
    
    const optionValue = typeof option === 'object' ? option.value : option;
    setSelectedOption(option);
    setShowFeedback(true);
    
    const correct = optionValue === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      // Correct answer
      const pointsEarned = 10 * level;
      setScore(prevScore => prevScore + pointsEarned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // More varied success messages based on streak
      let successMessage = `+${pointsEarned} points!`;
      if (newStreak >= 3) {
        successMessage = `${getRandomPositiveFeedback()} +${pointsEarned} points!`;
      }
      
      toast.success(successMessage, { 
        autoClose: 1500,
        hideProgressBar: newStreak < 3,
        icon: newStreak >= 3 ? <StarIcon className="text-yellow-400" /> : undefined
      });
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
    generateQuestion();
    
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
    generateQuestion();
    
    toast.info("Game restarted! Good luck!");
  };

  // Render option content based on type
  const renderOptionContent = (option) => {
    if (typeof option === 'object') {
      return <div className={option.type === 'objects' ? 'text-center text-xl' : ''}>{option.display}</div>;
    }
    return option;
  };

  const renderQuestionDisplay = () => {
    const style = question?.type === 'objects' ? 'text-center text-2xl mb-2' : 'text-center text-3xl font-bold mb-2';
    return <div className={style}>{question?.display}</div>;
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
            {renderOptionContent(option)}
            
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
              {!isCorrect && (
                <div className="mt-2 text-sm">
                  {gameMode === 'identify-number' && question?.type === 'objects' && (
                    <p>
                      Try counting each symbol one by one.
                    </p>
                  )}
                  
                  {gameMode === 'identify-number' && question?.type === 'tally' && (
                    <p>
                      Remember that tally marks are counted in groups of 5.
                    </p>
                  )}
                  
                  {gameMode === 'identify-number' && question?.type === 'word' && (
                    <p>Practice reading number words carefully.</p>
                  )}
                </div>
              )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NumberRecognitionGame;