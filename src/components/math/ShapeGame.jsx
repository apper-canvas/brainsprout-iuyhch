import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../../utils/iconUtils';
import { getRandomQuestionTemplate, wasRecentlyAsked, trackQuestion, getRandomPositiveFeedback } from '../../utils/questionDiversityUtils';

const ShapeGame = ({ onBackToMenu, onGameComplete, onScoreChange }) => {
  // Game state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [askedShapes, setAskedShapes] = useState([]);
  const [streak, setStreak] = useState(0);

  // Icons
  const HeartIcon = getIcon('Heart');
  const HomeIcon = getIcon('Home');
  const StarIcon = getIcon('Star');
  const TrophyIcon = getIcon('Trophy');
  const CheckCircleIcon = getIcon('CheckCircle');
  const XCircleIcon = getIcon('XCircle');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const RefreshCwIcon = getIcon('RefreshCw');
  const ZapIcon = getIcon('Zap');

  // Shape data
  const shapes = {
    1: [ // Level 1: Basic 2D shapes
      { 
        name: "Circle", 
        description: "A perfectly round shape with all points at equal distance from the center",
        svg: <circle cx="50" cy="50" r="40" fill="currentColor" />
      },
      { 
        name: "Square", 
        description: "A four-sided shape with equal sides and four right angles",
        svg: <rect x="10" y="10" width="80" height="80" fill="currentColor" />
      },
      { 
        name: "Triangle", 
        description: "A three-sided polygon with three angles",
        svg: <polygon points="50,10 90,90 10,90" fill="currentColor" />
      },
      { 
        name: "Rectangle", 
        description: "A four-sided shape with opposite sides of equal length and four right angles",
        svg: <rect x="10" y="20" width="80" height="60" fill="currentColor" />
      },
      { 
        name: "Oval", 
        description: "An elongated circle, shaped like an egg",
        svg: <ellipse cx="50" cy="50" rx="40" ry="25" fill="currentColor" />
      },
    ],
    2: [ // Level 2: More complex 2D shapes
      { 
        name: "Pentagon", 
        description: "A five-sided polygon with five angles",
        svg: <polygon points="50,10 90,40 75,90 25,90 10,40" fill="currentColor" />
      },
      { 
        name: "Hexagon", 
        description: "A six-sided polygon with six angles",
        svg: <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="currentColor" />
      },
      { 
        name: "Octagon", 
        description: "An eight-sided polygon with eight angles",
        svg: <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="currentColor" />
      },
      { 
        name: "Rhombus", 
        description: "A four-sided shape with all sides of equal length, but angles are not right angles",
        svg: <polygon points="50,10 90,50 50,90 10,50" fill="currentColor" />
      },
      { 
        name: "Trapezoid", 
        description: "A four-sided shape with one pair of parallel sides",
        svg: <polygon points="20,20 80,20 70,80 30,80" fill="currentColor" />
      },
    ],
    3: [ // Level 3: 3D shapes (represented in 2D)
      { 
        name: "Cube", 
        description: "A 3D shape with six equal square faces",
        svg: (
          <g>
            <polygon points="30,30 70,30 70,70 30,70" fill="currentColor" />
            <polygon points="40,20 80,20 80,60 40,60" fill="currentColor" fillOpacity="0.8" />
            <polygon points="70,30 80,20 80,60 70,70" fill="currentColor" fillOpacity="0.6" />
          </g>
        )
      },
      { 
        name: "Sphere", 
        description: "A perfectly round 3D shape like a ball",
        svg: (
          <g>
            <circle cx="50" cy="50" r="40" fill="currentColor" />
            <ellipse cx="50" cy="50" rx="40" ry="15" fill="currentColor" fillOpacity="0.3" />
          </g>
        )
      },
      { 
        name: "Cylinder", 
        description: "A 3D shape with circular bases and a curved surface",
        svg: (
          <g>
            <rect x="20" y="30" width="60" height="40" fill="currentColor" />
            <ellipse cx="50" cy="30" rx="30" ry="10" fill="currentColor" />
            <ellipse cx="50" cy="70" rx="30" ry="10" fill="currentColor" fillOpacity="0.7" />
          </g>
        )
      },
      { 
        name: "Cone", 
        description: "A 3D shape with a circular base and a point at the top",
        svg: (
          <g>
            <polygon points="50,10 80,80 20,80" fill="currentColor" />
            <ellipse cx="50" cy="80" rx="30" ry="10" fill="currentColor" fillOpacity="0.7" />
          </g>
        )
      },
      { 
        name: "Pyramid", 
        description: "A 3D shape with a square base and triangular faces that meet at a point",
        svg: (
          <g>
            <polygon points="50,10 80,70 20,70" fill="currentColor" fillOpacity="0.8" />
            <polygon points="20,70 50,10 50,70" fill="currentColor" fillOpacity="0.6" />
            <polygon points="20,70 80,70 50,70" fill="currentColor" />
          </g>
        )
      },
    ]
  };

  // Initialize game
  useEffect(() => {
    generateQuestion();
  }, [currentLevel]);

  // Generate a question based on the current level
  const generateQuestion = () => {
    const currentShapes = shapes[currentLevel];
    
    // Find a shape that hasn't been asked recently
    let selectedShape;
    let attempts = 0;
    do {
      const randomIndex = Math.floor(Math.random() * currentShapes.length);
      selectedShape = currentShapes[randomIndex];
      attempts++;
    } while (
      askedShapes.includes(selectedShape.name) && 
      attempts < currentShapes.length && 
      askedShapes.length < currentShapes.length
    );
    
    // Track this shape to avoid immediate repetition
    setAskedShapes(prev => {
      const updated = [...prev, selectedShape.name];
      // Keep only the last few shapes in history
      return updated.length > 3 ? updated.slice(updated.length - 3) : updated;
    });
    
    // Set question based on level
    const questionTemplates = {
      1: ["What shape is this?", "Can you identify this shape?", "Name this shape:", "Which shape do you see?"],
      2: ["Identify this geometric shape:", "What do we call this shape?", "Name this geometric figure:", "Which polygon is shown here?"],
      3: ["What 3D shape is represented here?", "Identify this three-dimensional shape:", "Name this 3D geometric form:", "Which 3D geometric solid is shown?"]
    };
    
    let questionText;
    if (currentLevel < 3) {
      questionText = `Identify this geometric shape:`;
    } else {
      questionText = `What 3D shape is represented here?`;
    }
    
    setQuestion({
      text: questionTemplates[currentLevel][Math.floor(Math.random() * questionTemplates[currentLevel].length)],
      shape: selectedShape,
      correctAnswer: selectedShape.name
    });
    
    // Generate options (one correct, three incorrect)
    const incorrectOptions = currentShapes
      .filter(shape => shape.name !== selectedShape.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(shape => shape.name);
    
    setOptions(shuffleArray([selectedShape.name, ...incorrectOptions]));
    setSelectedOption(null);
    setShowFeedback(false);
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
      const newScore = score + pointsEarned;
      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreak(streak + 1);
      
      // Update parent component with new score
      onScoreChange(newScore);
      // Use more varied success messages for longer streaks
      const message = newStreak >= 3 ? `${getRandomPositiveFeedback()} +${pointsEarned} points!` : `+${pointsEarned} points!`;
      const icon = newStreak >= 3 ? <StarIcon className="text-yellow-400" /> : null;
      
      
      toast.success(`+${pointsEarned} points!`, { 
        autoClose: 1500
      });
    } else {
      // Incorrect answer
      setLives(lives - 1);
      setStreak(0);
      
      if (lives <= 1) {
        setGameOver(true);
        onGameComplete(score, currentLevel);
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

  // Advance to next level
  const advanceLevel = () => {
    const newLevel = Math.min(currentLevel + 1, 3);
    setCurrentLevel(newLevel);
    setQuestionsAnswered(0);
    setLevelComplete(false);
    generateQuestion();
    
    toast.info(`🚀 Level ${newLevel} unlocked!`, {
      icon: <ZapIcon className="text-purple-500" />
    });
  };

  // Restart game
  const restartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setLives(3);
    setQuestionsAnswered(0);
    setStreak(0);
    setGameOver(false);
    setLevelComplete(false);
    generateQuestion();
    
    // Update parent component with reset score
    onScoreChange(0);
    
    toast.info("Game restarted! Good luck!");
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="card p-6 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary-light transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Games
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <HeartIcon 
                key={i} 
                className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-surface-300 dark:text-surface-700'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={restartGame}
            className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
            title="Restart Game"
          >
            <RefreshCwIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Title and Level Display */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Shape Explorer</h2>
        <p className="text-surface-600 dark:text-surface-400">
          Level {currentLevel}: {currentLevel === 1 ? 'Basic Shapes' : currentLevel === 2 ? 'Advanced Shapes' : '3D Shapes'}
        </p>
      </div>
      
      {/* Game Content */}
      <AnimatePresence mode="wait">
        {!gameOver && !levelComplete ? (
          <motion.div
            key="game-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Question */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold mb-3">{question?.text}</h3>
              
              {/* Shape Display */}
              <div className="flex justify-center mb-6">
                <div className={`w-40 h-40 ${
                  currentLevel === 1 ? 'text-blue-500' : 
                  currentLevel === 2 ? 'text-purple-500' : 'text-teal-500'
                }`}>
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    {question?.shape.svg}
                  </svg>
                </div>
              </div>
              
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => !showFeedback && handleOptionSelect(option)}
                  disabled={showFeedback || gameOver}
                  className={`p-4 rounded-xl font-medium text-center transition-all ${
                    selectedOption === option 
                      ? isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-2 border-red-500'
                      : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-900 dark:text-surface-100 border border-surface-300 dark:border-surface-600'
                  } relative overflow-hidden`}
                  whileHover={{ scale: showFeedback ? 1 : 1.03 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                  variants={itemVariants}
                >
                  <span className="text-black dark:text-white font-medium">{option}</span>
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
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Correct!</p>
                          <p className="text-sm mt-1">A {question.shape.name.toLowerCase()} is {question.shape.description}.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            Not quite! This is a <span className="font-bold">{question.correctAnswer}</span>.
                          </p>
                          <p className="text-sm mt-1">
                            A {question.shape.name.toLowerCase()} is {question.shape.description}
                          </p>
                          {/* Add a hint about the shape properties to help learning */}
                          {currentLevel === 1 && (
                            <p className="text-sm mt-1 italic">
                              Try to look at the number of sides and angles to identify basic shapes.
                            </p>
                          )}
                        </div>
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
            className="text-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <div className="inline-block mb-6 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <TrophyIcon className="h-12 w-12 text-amber-500" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              Level {currentLevel} Complete!
            </h3>
            
            <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
              {currentLevel === 1 
                ? "Great job identifying basic shapes! Ready for more complex ones?" 
                : currentLevel === 2 
                  ? "You've mastered advanced 2D shapes! Ready to explore 3D shapes?" 
                  : "Congratulations! You've completed all Shape Explorer levels!"}
            </p>
            
            <div className="flex justify-center">
              {currentLevel < 3 ? (
                <button
                  onClick={advanceLevel}
                  className="btn btn-primary py-3 px-6"
                >
                  Continue to Level {currentLevel + 1}
                </button>
              ) : (
                <button
                  onClick={restartGame}
                  className="btn btn-primary py-3 px-6"
                >
                  Play Again
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game-over"
            className="text-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <div className="inline-block mb-6 p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <XCircleIcon className="h-12 w-12 text-red-500" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              Game Over!
            </h3>
            
            <p className="text-surface-600 dark:text-surface-400 mb-8">
              You earned <span className="font-bold text-amber-500">{score} points</span> and reached level {currentLevel}!
            </p>
            
            <div className="flex justify-center">
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
    </motion.div>
  );
};

export default ShapeGame;