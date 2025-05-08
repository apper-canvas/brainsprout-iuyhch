import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import GameSelector from './GameSelector';
import NumberRecognitionGame from './math/NumberRecognitionGame';
import CountingGame from './math/CountingGame';
import BasicArithmeticGame from './math/BasicArithmeticGame';

const MainFeature = ({ playerName, subject, darkMode }) => {
  // State for game mechanics
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [showGameSelector, setShowGameSelector] = useState(true);

  // Icon components
  const HeartIcon = getIcon('Heart');
  const TrophyIcon = getIcon('Trophy');
  const StarIcon = getIcon('Star');
  const HomeIcon = getIcon('Home');
  const RefreshCwIcon = getIcon('RefreshCw');
  const AwardIcon = getIcon('Award');
  const SparkleStar = getIcon('Sparkles');
  const ZapIcon = getIcon('Zap');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');

  // Generate question based on subject and level
  useEffect(() => {
    if (!showGameSelector && !activeGame) {
      generateQuestion();
    }
  }, [subject, currentLevel]);

  // Check for badge achievements
  useEffect(() => {
    // First 5 correct answers badge
    if (score === 5 && !badges.includes('beginner')) {
      earnBadge('beginner', 'Beginner', 'Answered 5 questions correctly!');
    }
    
    // 3 questions in a row badge
    if (streak === 3 && !badges.includes('streak')) {
      earnBadge('streak', 'On Fire!', 'Answered 3 questions in a row correctly!');
    }
    
    // Level complete badge
    if (levelComplete && !badges.includes(`level${currentLevel}`)) {
      earnBadge(`level${currentLevel}`, `Level ${currentLevel} Master`, `Completed level ${currentLevel}!`);
    }
  }, [score, streak, levelComplete, badges]);

  const earnBadge = (id, title, description) => {
    setBadges([...badges, id]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    toast.success(`🏆 New Badge: ${title} - ${description}`, {
      autoClose: 5000,
      icon: <AwardIcon className="text-amber-400" />
    });
  };

  // Handle game selection from the game selector
  const handleGameSelect = (gameId) => {
    setActiveGame(gameId);
    setShowGameSelector(false);
    
    toast.info(`Starting ${gameId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} game!`);
  };
  
  // Handle back to game selection
  const handleBackToGameSelection = () => {
    setActiveGame(null);
    setShowGameSelector(true);
  };
  
  // Handle score updates from games
  const handleGameScoreChange = (newScore) => {
    setScore(newScore);
  };

  const generateQuestion = () => {
    let newQuestion, newOptions, correctAnswer;

    if (subject === 'math') {
      // Generate math question based on level
      switch (currentLevel) {
        case 1: // Simple addition
          const num1 = Math.floor(Math.random() * 10);
          const num2 = Math.floor(Math.random() * 10);
          newQuestion = `What is ${num1} + ${num2}?`;
          correctAnswer = num1 + num2;
          break;
        case 2: // Simple subtraction
          const minuend = Math.floor(Math.random() * 15) + 5;
          const subtrahend = Math.floor(Math.random() * minuend);
          newQuestion = `What is ${minuend} - ${subtrahend}?`;
          correctAnswer = minuend - subtrahend;
          break;
        case 3: // Multiplication
          const factor1 = Math.floor(Math.random() * 10);
          const factor2 = Math.floor(Math.random() * 10);
          newQuestion = `What is ${factor1} × ${factor2}?`;
          correctAnswer = factor1 * factor2;
          break;
        default:
          newQuestion = "What is 2 + 2?";
          correctAnswer = 4;
      }
      
      // Generate options (including the correct answer)
      newOptions = generateMathOptions(correctAnswer, currentLevel);
      
    } else {
      // Reading questions (vocabulary matching)
      const wordPairs = [
        { word: "happy", definition: "feeling joy or pleasure" },
        { word: "big", definition: "large in size" },
        { word: "fast", definition: "moving quickly" },
        { word: "cold", definition: "having a low temperature" },
        { word: "quiet", definition: "making little or no noise" },
        { word: "brave", definition: "having courage" },
        { word: "shiny", definition: "reflecting light" },
        { word: "tiny", definition: "very small" }
      ];
      
      // Select a random word pair
      const randomIndex = Math.floor(Math.random() * wordPairs.length);
      const selectedPair = wordPairs[randomIndex];
      
      if (currentLevel === 1) {
        // Level 1: Match word to definition
        newQuestion = `What does "${selectedPair.word}" mean?`;
        correctAnswer = selectedPair.definition;
        
        // Generate incorrect options
        newOptions = [selectedPair.definition];
        while (newOptions.length < 4) {
          const randomDefIndex = Math.floor(Math.random() * wordPairs.length);
          if (randomDefIndex !== randomIndex && !newOptions.includes(wordPairs[randomDefIndex].definition)) {
            newOptions.push(wordPairs[randomDefIndex].definition);
          }
        }
      } else {
        // Level 2-3: Match definition to word
        newQuestion = `Which word means "${selectedPair.definition}"?`;
        correctAnswer = selectedPair.word;
        
        // Generate incorrect options
        newOptions = [selectedPair.word];
        while (newOptions.length < 4) {
          const randomWordIndex = Math.floor(Math.random() * wordPairs.length);
          if (randomWordIndex !== randomIndex && !newOptions.includes(wordPairs[randomWordIndex].word)) {
            newOptions.push(wordPairs[randomWordIndex].word);
          }
        }
      }
      
      // Shuffle options
      newOptions = shuffleArray(newOptions);
    }

    setQuestion({ text: newQuestion, correctAnswer });
    setOptions(newOptions);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  // Generate math options based on the correct answer
  const generateMathOptions = (correctAnswer, level) => {
    const options = [correctAnswer];
    const range = level === 1 ? 3 : (level === 2 ? 5 : 10);
    
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * range) + 1;
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
      setScore(score + pointsEarned);
      setStreak(streak + 1);
      
      toast.success(`+${pointsEarned} points!`, { 
        icon: <StarIcon className="text-yellow-400" />,
        autoClose: 1000
      });
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
    setQuestionsAnswered(questionsAnswered + 1);
    
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

  // Handle advancing to next level
  const advanceLevel = () => {
    setCurrentLevel(currentLevel + 1);
    setQuestionsAnswered(0);
    setLevelComplete(false);
    generateQuestion();
    
    toast.info(`🚀 Level ${currentLevel + 1} unlocked!`, {
      icon: <ZapIcon className="text-purple-500" />
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

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  // Confetti element for badge achievements
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.5;
        
        return (
          <div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: size + 'px',
              height: size + 'px',
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              animation: `fall ${animationDuration}s linear ${delay}s forwards`
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Game Header - always shown regardless of game state */}
      <motion.div 
        className={`flex flex-col md:flex-row justify-between items-center ${activeGame ? 'mb-4' : 'mb-8'} gap-4`}
        variants={itemVariants} 
      >
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="text-primary">
              {subject === 'math' ? 'Math' : 'Reading'} Adventure
            </span>
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            Hello, <span className="font-semibold">{playerName}!</span> {!activeGame && `Level: ${currentLevel}`}
          </p>
        </div>
        
        <div className="flex items-center gap-6">          
          <div className="flex items-center gap-1">
            <StarIcon className="w-5 h-5 text-amber-400" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Secondary header for word-matching game */}
      {!showGameSelector && !activeGame && (
      <motion.div 
        className="flex justify-between items-center mb-8"
      >
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="text-primary">
              {subject === 'math' ? 'Math' : 'Reading'} Adventure
            </span>
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            Hello, <span className="font-semibold">{playerName}!</span> Level: {currentLevel}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <div className="flex">
              {Array.from({ length: 3 }).map((_, i) => (
                <HeartIcon 
                  key={i} 
                  className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-surface-300 dark:text-surface-700'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <StarIcon className="w-5 h-5 text-amber-400" />
            <span className="font-bold">{score}</span>
          </div>
          
          <button 
            onClick={restartGame}
            className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
            title="Restart Game"
          >
            <RefreshCwIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>)}

      {/* Game Content */}
      {showGameSelector && (
        <GameSelector 
          subject={subject}
          onGameSelect={handleGameSelect}
          playerName={playerName}
        />
      )}

      {activeGame === 'number-recognition' && (
        <NumberRecognitionGame 
          onBackToMenu={handleBackToGameSelection}
          onGameComplete={(finalScore, finalLevel) => {
            setBadges(prev => [...prev, `number-master-${finalLevel}`]);
          }}
          onScoreChange={handleGameScoreChange}
        />
      )}
      
      {activeGame === 'counting' && (
        <CountingGame 
          onBackToMenu={handleBackToGameSelection}
          onGameComplete={(finalScore, finalLevel) => {
            setBadges(prev => [...prev, `counting-master-${finalLevel}`]);
          }}
          onScoreChange={handleGameScoreChange}
        />
      )}
      
      {activeGame === 'basic-arithmetic' && (
        <BasicArithmeticGame 
          onBackToMenu={handleBackToGameSelection}
          onGameComplete={(finalScore, finalLevel) => {
            setBadges(prev => [...prev, `arithmetic-master-${finalLevel}`]);
          }}
          onScoreChange={handleGameScoreChange}
        />
      )}
      
      <AnimatePresence mode="wait">
        {!gameOver && !levelComplete ? (
          <motion.div
            key="game"
            className="card p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Streak indicator */}
            {streak > 0 && (
              <div className="flex items-center justify-center mb-4">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  streak >= 3 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 
                                'bg-surface-100 dark:bg-surface-700/50 text-surface-600 dark:text-surface-300'
                }`}>
                  <SparkleStar className="w-4 h-4" />
                  <span>{streak} in a row!</span>
                </div>
              </div>
            )}
            
            {/* Question */}
            <div className="mb-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2">{question?.text}</h3>
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
                        <p className="font-medium">Great job! That's correct!</p>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="font-medium">
                          Not quite! The correct answer is: <span className="font-bold">{question.correctAnswer}</span>
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : levelComplete ? (
          <motion.div
            key="level-complete"
            className="card p-8 text-center"
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
              Great job! You've completed level {currentLevel} of the {subject} adventure. 
              Ready to take on a new challenge?
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
            key="game-over"
            className="card p-8 text-center"
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
            
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              You earned <span className="font-bold text-amber-500">{score} points</span> and reached level {currentLevel}!
            </p>
            
            {badges.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-2">Badges Earned:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {badges.map((badge) => {
                    let badgeInfo = { title: 'Badge', color: 'bg-surface-200' };
                    
                    if (badge === 'beginner') {
                      badgeInfo = { title: 'Beginner', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' };
                    } else if (badge === 'streak') {
                      badgeInfo = { title: 'On Fire!', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' };
                    } else if (badge.startsWith('level')) {
                      const level = badge.replace('level', '');
                      badgeInfo = { title: `Level ${level} Master`, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' };
                    }
                    
                    return (
                      <div key={badge} className={`px-3 py-1 rounded-full text-sm font-medium ${badgeInfo.color}`}>
                        <AwardIcon className="w-4 h-4 inline-block mr-1" />
                        {badgeInfo.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={restartGame}
                className="btn btn-primary py-3 px-6"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Badges Section */}
      {badges.length > 0 && !gameOver && (
        <motion.div 
          variants={itemVariants}
          className="mt-8"
        >
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <AwardIcon className="w-5 h-5 text-amber-500" />
              Your Badges ({badges.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => {
                let badgeInfo = { title: 'Badge', color: 'bg-surface-200' };
                
                if (badge === 'beginner') {
                  badgeInfo = { title: 'Beginner', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' };
                } else if (badge === 'streak') {
                  badgeInfo = { title: 'On Fire!', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' };
                } else if (badge.startsWith('level')) {
                  const level = badge.replace('level', '');
                  badgeInfo = { title: `Level ${level} Master`, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' };
                }
                
                return (
                  <div key={badge} className={`px-3 py-1 rounded-full text-sm font-medium ${badgeInfo.color}`}>
                    <AwardIcon className="w-4 h-4 inline-block mr-1" />
                    {badgeInfo.title}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      
      {showConfetti && <Confetti />}
    </motion.div>
  );
};

export default MainFeature;