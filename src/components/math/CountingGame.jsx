import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getRandomQuestionTemplate, wasRecentlyAsked, trackQuestion, getRandomPositiveFeedback } from '../../utils/questionDiversityUtils';
import getIcon from '../../utils/iconUtils';
import { 
  generateCountingChallenge, 
  generateSkipCountingChallenge,
  generateCountingBackwardsChallenge 
} from '../../utils/countingUtils';

const CountingGame = ({ 
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
  const [challengeType, setChallengeType] = useState('basic-counting');
  const [previousNumbers, setPreviousNumbers] = useState([]);

  // Icons
  const HeartIcon = getIcon('Heart');
  const HashIcon = getIcon('Hash');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const RefreshCwIcon = getIcon('RefreshCw');

  // Generate a new question
  useEffect(() => {
    generateQuestion();
  }, [level]);

  // Report score changes to parent
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score]);

  const generateQuestion = () => {
    // Determine challenge type based on level and question number
    let challenge;
    
    // Mix up challenge types based on level and questions answered
    if (level === 1) {
      // Level 1: Only basic counting challenges
      challenge = generateCountingChallenge(level);
      setChallengeType('basic-counting');
    } else if (level === 2) {
      // Level 2: Mix of basic counting and skip counting
      const challengeTypes = ['basic-counting', 'skip-counting'];
      const selectedType = challengeTypes[questionsAnswered % 2];
      
      // Try to avoid repeating the same number
      while (previousNumbers.includes(challenge.targetCount) && previousNumbers.length < 5) {
        challenge = generateCountingChallenge(level);
      }
      
      setChallengeType(selectedType);
      if (selectedType === 'basic-counting') {
        challenge = generateCountingChallenge(level);
      } else {
        challenge = generateSkipCountingChallenge(level);
      }
    } else {
      // Level 3: Mix of all challenge types
        // Avoid repetition
        while (previousNumbers.includes(challenge.targetCount) && previousNumbers.length < 8) {
          challenge = generateCountingChallenge(level);
        }
      const challengeTypes = ['basic-counting', 'skip-counting', 'counting-backwards'];
      const selectedType = challengeTypes[questionsAnswered % 3];
      
      setChallengeType(selectedType);
      if (selectedType === 'basic-counting') {
        challenge = generateCountingChallenge(level);
      } else if (selectedType === 'skip-counting') {
        challenge = generateSkipCountingChallenge(level);
      } else {
        challenge = generateCountingBackwardsChallenge(level);
      }
    }
        // Avoid repetition
        while (previousNumbers.includes(challenge.targetCount) && previousNumbers.length < 10) {
          challenge = generateCountingChallenge(level);
        }
    
    // Set the question and options based on the challenge type
    if (challenge.type === 'basic-counting') {
      setQuestion({
        text: "How many objects do you see?",
        display: challenge.objectDisplay.display,

    // Update the list of previous numbers
    if (challenge.targetCount) {
      setPreviousNumbers(prev => {
        const updated = [...prev, challenge.targetCount];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
    } else if (challenge.answer) {
      setPreviousNumbers(prev => {
        const updated = [...prev, challenge.answer];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
    }
        displayType: challenge.objectDisplay.type,
        correctAnswer: challenge.targetCount
      });
      // Different question templates for variety
      const questionTemplates = [
        "How many objects do you see?",
        "Count the objects and tell me how many there are.",
        "Count and tell me: how many items are shown?",
        "How many can you count?",
        `How many ${getRandomCountingObjectName(challenge.objectDisplay.display)} are there?`
      ];

      
        text: getRandomQuestionTemplate(questionTemplates),
      generateOptions(challenge.targetCount, level);
    } else if (challenge.type === 'skip-counting') {
        correctAnswer: challenge.targetCount,
        // Track more information for better feedback
        info: {
          groupSize: challenge.objectDisplay.type === 'grouped' ? 10 : 1,
          objectName: getRandomCountingObjectName(challenge.objectDisplay.display)
        }
        text: `What comes next in this sequence? ${challenge.increment === 10 ? '(counting by 10s)' : 
                                                  challenge.increment === 5 ? '(counting by 5s)' :
                                                  challenge.increment === 3 ? '(counting by 3s)' :
                                                  '(counting by 2s)'}`,
        display: challenge.sequence.join(', ') + ", ...",
        displayType: 'sequence',
        correctAnswer: challenge.answer
      });
      
      // Generate answer options
      generateOptions(challenge.answer, level);
    } else if (challenge.type === 'counting-backwards') {
      setQuestion({
        text: "What comes next in this sequence counting backwards?",
        display: challenge.sequence.join(', ') + ", ...",
        displayType: 'sequence',
        correctAnswer: challenge.answer
      });
      
      // Generate answer options
      generateOptions(challenge.answer, level);
    }
  };
  // Helper function to extract the object name from emoji display
  const getRandomCountingObjectName = (display) => {
    if (!display || display.length === 0) return "objects";
    
    // Map common emoji to their names
    const emojiNames = {
      '🍎': 'apples', '🌟': 'stars', '🎈': 'balloons', '🐶': 'puppies', 
      '🚂': 'trains', '🍦': 'ice creams', '🌼': 'flowers', '🦋': 'butterflies',
      '🐱': 'kittens', '🐢': 'turtles', '🦁': 'lions', '🐘': 'elephants'
    };
    
    return emojiNames[display[0]] || "objects";
  };


  const generateOptions = (correctAnswer, level) => {
    // Create array with correct answer
    const optionsList = [correctAnswer];
    
    // Determine range for incorrect options based on level
    const range = level === 1 ? 3 : (level === 2 ? 5 : 10);
    
    // Add incorrect options
    while (optionsList.length < 4) {
      const offset = Math.floor(Math.random() * range) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const newOption = correctAnswer + (offset * sign);
      
      // Ensure no duplicates and no negative numbers
      if (!optionsList.includes(newOption) && newOption >= 0) {
        optionsList.push(newOption);
      }
    }
    
    // Shuffle options
    setOptions(shuffleArray(optionsList));
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

      // More varied success messages
      let successMessage = `+${pointsEarned} points!`;
      const newStreak = streak + 1;
      
      if (newStreak >= 3) {
        successMessage = `${getRandomPositiveFeedback()} +${pointsEarned} points!`;
      }
      
      toast.success(successMessage, { 
        autoClose: 1500,
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
    setChallengeType('basic-counting');
    generateQuestion();
    
    toast.info("Game restarted! Good luck!");
  };

  // Render the question display based on type
  const renderQuestionDisplay = () => {
    if (question?.displayType === 'standard') {
      return (
        <div className="text-center text-3xl mb-4 flex flex-wrap justify-center gap-1">
          {question.display.split('').map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </div>
      );
    } else if (question?.displayType === 'grouped') {
      return (
        <div className="text-center text-3xl mb-4 flex flex-wrap justify-center gap-2">
          {question.display.split(' ').map((group, index) => (
            group && <span key={index} className="border border-surface-300 dark:border-surface-600 rounded p-1">{group}</span>
          ))}
        </div>
      );
    } else if (question?.displayType === 'sequence') {
      return (
        <div className="text-center text-3xl font-bold mb-4">
          {question.display}
        </div>
      );
    }
    
    return <div className="text-center text-3xl mb-4">{question?.display}</div>;
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
            
            {!isCorrect && challengeType === 'basic-counting' && question.info && (
              <p className="mt-2 text-sm">
                {level === 1 ? (
                  "Try counting the objects one by one to get the total."
                ) : question.info.groupSize > 1 ? (
                  `Try counting in groups of ${question.info.groupSize} to make it easier!`
                ) : (
                  "Try counting the objects in groups of 2 or 5 to get the total faster."
                )}
              </p>
            )}
            
            {!isCorrect && challengeType === 'skip-counting' && (
              <p className="mt-2 text-sm">
                {(() => {
                  // Extract the pattern from the sequence if available
                  if (question && question.display) {
                    const numbers = question.display
                      .replace("...", "")
                      .split(", ")
                      .map(n => parseInt(n.trim()))
                      .filter(n => !isNaN(n));
                    
                    if (numbers.length >= 2) {
                      const diff = numbers[1] - numbers[0];
                      
                      if (diff === 2) return "Look at the pattern - each number increases by 2.";
                      if (diff === 3) return "Look at the pattern - each number increases by 3.";
                      if (diff === 5) return "Look at the pattern - each number increases by 5.";
                      if (diff === 10) return "Look at the pattern - each number increases by 10.";
                      
                      return `Look at the pattern - each number increases by ${diff}.`;
                    }
                  }
                  
                  return "Look at the pattern - each number increases by a fixed amount.";
                })()}
              </p>
            )}
            
            {!isCorrect && challengeType === 'counting-backwards' && (
              <p className="mt-2 text-sm">
                Notice that the numbers are decreasing. Try counting backwards from the last number.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountingGame;