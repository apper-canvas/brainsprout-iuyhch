import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const Home = ({ darkMode }) => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  
  // Icon components
  const BookOpenIcon = getIcon('BookOpen');
  const CalculatorIcon = getIcon('Calculator');
  const TrophyIcon = getIcon('Trophy');
  const RocketIcon = getIcon('Rocket');
  const BrainIcon = getIcon('Brain');
  const StarIcon = getIcon('Star');
  
  const handleStartGame = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name to start playing!");
      return;
    }
    
    setGameStarted(true);
    toast.success(`Welcome, ${playerName}! Let's learn and have fun!`);
  };
  
  // Handle subject change
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    toast.info(`Switched to ${subject.charAt(0).toUpperCase() + subject.slice(1)} games!`);
  };

  if (gameStarted) {
    return (
      <MainFeature 
        playerName={playerName}
        subject={selectedSubject}
        darkMode={darkMode}
      />
    );
  }

  return (
    <motion.div 
      className="py-8 md:py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-5xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="inline-block mb-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full">
            <BrainIcon className="h-10 w-10 text-primary-dark dark:text-primary-light" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Learn & Play with BrainSprout!
          </h1>
          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
            An interactive learning adventure for curious minds. Explore math and reading through fun games!
          </p>
        </motion.div>

        {/* Player Setup */}
        <motion.div 
          className="max-w-md mx-auto mb-12"
          variants={itemVariants}
        >
          <div className="card p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
              Ready to Start Your Adventure?
            </h2>
            
            <div className="mb-6">
              <label htmlFor="playerName" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                What's your name, explorer?
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
                maxLength={20}
              />
            </div>
            
            <div className="mb-6">
              <p className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Choose your subject:
              </p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => handleSubjectChange('math')}
                  className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                    selectedSubject === 'math'
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  <CalculatorIcon className="h-6 w-6 mb-1" />
                  <span className="text-sm font-medium">Math</span>
                </button>
                <button
                  onClick={() => handleSubjectChange('reading')}
                  className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                    selectedSubject === 'reading'
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  <BookOpenIcon className="h-6 w-6 mb-1" />
                  <span className="text-sm font-medium">Reading</span>
                </button>
              </div>
            </div>
            
            <button
              onClick={handleStartGame}
              className="btn btn-accent w-full py-3 text-base font-semibold flex items-center justify-center space-x-2 shadow-lg"
            >
              <RocketIcon className="h-5 w-5" />
              <span>Start Learning Adventure!</span>
            </button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="bg-primary-light/10 dark:bg-primary-light/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <StarIcon className="h-6 w-6 text-primary-dark dark:text-primary-light" />
            </div>
            <h3 className="text-lg font-bold mb-2">Engaging Games</h3>
            <p className="text-surface-600 dark:text-surface-400">Interactive games that make learning math and reading fun!</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="bg-secondary/10 dark:bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <RocketIcon className="h-6 w-6 text-secondary dark:text-secondary-light" />
            </div>
            <h3 className="text-lg font-bold mb-2">Skill Building</h3>
            <p className="text-surface-600 dark:text-surface-400">Progressive challenges that grow with your child's abilities.</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="bg-accent/10 dark:bg-accent/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold mb-2">Rewards System</h3>
            <p className="text-surface-600 dark:text-surface-400">Earn points, badges, and unlock new characters as you learn!</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;