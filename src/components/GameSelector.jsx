import { motion, AnimatePresence } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const GameSelector = ({ subject, onGameSelect, playerName }) => {
  // Icon components
  const CalculatorIcon = getIcon('Calculator');
  const BookOpenIcon = getIcon('BookOpen');
  const HashIcon = getIcon('Hash');
  const PlusIcon = getIcon('Plus');
  const CircleIcon = getIcon('Circle');
  const ArrowLeftIcon = getIcon('ArrowLeft');

  // Games available for each subject
  const games = {
    math: [
      {
        id: 'number-recognition',
        title: 'Number Recognition',
        description: 'Learn to identify numbers in different forms',
        icon: HashIcon,
        color: 'bg-blue-100 dark:bg-blue-900/30',
      },
      {
        id: 'counting',
        title: 'Counting Adventure',
        description: 'Count objects and match with correct numbers',
        icon: getIcon('Hash'),
        color: 'bg-green-100 dark:bg-green-900/30',
      },
      {
        id: 'basic-arithmetic',
        title: 'Basic Arithmetic',
        description: 'Practice addition and subtraction',
        icon: PlusIcon,
        color: 'bg-purple-100 dark:bg-purple-900/30',
      },
      {
        id: 'fractions',
        title: 'Fraction Fun',
        description: 'Learn to identify and work with fractions',
        icon: DivideIcon,
        color: 'bg-amber-100 dark:bg-amber-900/30',
      },
      {
        id: 'geometry',
        title: 'Shape Explorer',
        description: 'Discover geometric shapes and their properties',
        icon: CircleIcon,
        color: 'bg-pink-100 dark:bg-pink-900/30',
      }
    ],
    reading: [
      {
        id: 'word-matching',
        title: 'Word Matching',
        description: 'Match words with their meanings',
      // Reading game data would go here but is not needed for this fix
      // since the issue is with the animation rendering, not the game data

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  // Stable content variants - no motion for stable text elements
  const stableContentVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  };

  return (
    <motion.div className="card p-6 md:p-8 transition-all duration-300" variants={containerVariants} initial="hidden" animate="visible">
      <h2 className="text-2xl font-bold mb-6 text-center transition-none">
        <span>Choose a {subject.charAt(0).toUpperCase() + subject.slice(1)} Game, </span><span className="transition-none">{playerName}!</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games[subject].map((game) => (
          <motion.div key={game.id} 
            className={`card p-4 cursor-pointer hover:shadow-soft transition-all ${game.comingSoon ? 'opacity-70' : ''}`}
            onClick={() => game.comingSoon ? toast.info("Coming soon! This game is under development.") : onGameSelect(game.id)}
  // Welcome message with static player name (no animation)
  const WelcomeMessage = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-1">
        Welcome, <span className="text-primary">{playerName}</span>!
      </h2>
      <p className="text-surface-600 dark:text-surface-400">
        Choose a {subject} game to start learning
      </p>
    </div>
  );
  
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
      {/* Static welcome message that won't blink/re-render */}
      <WelcomeMessage />
      
      {/* Game filters - static rendering */}
      {subject === 'math' && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {renderFilters()}
        </div>
      )}
                <p className="text-sm text-surface-600 dark:text-surface-400">{game.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GameSelector;
            whileHover={{ scale: 1.03 }}
              <h3 className="text-lg font-bold">{game.title}</h3>