import { motion, AnimatePresence } from 'framer-motion';

// Game card component to improve readability
const GameCard = ({ game, onSelect }) => {
  const Icon = game.icon;
  
  return (
    <motion.div
      className={`card p-4 cursor-pointer hover:shadow-soft transition-all ${game.comingSoon ? 'opacity-70' : ''}`}
      onClick={() => game.comingSoon ? toast.info("Coming soon! This game is under development.") : onSelect(game.id)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-lg mr-4 ${game.color || 'bg-primary-light/20'}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-bold">{game.title}</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">{game.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Welcome message component
const WelcomeMessage = ({ playerName, subject }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold mb-1">
      Welcome, <span className="text-primary">{playerName}</span>!
    </h2>
    <p className="text-surface-600 dark:text-surface-400">
      Choose a {subject} game to start learning
    </p>
  </div>
);

const GameSelector = ({ subject, onGameSelect, playerName }) => {
  // Icon components
  const CalculatorIcon = getIcon('Calculator');
  const BookOpenIcon = getIcon('BookOpen');
  const HashIcon = getIcon('Hash');
  const PlusIcon = getIcon('Plus');
  const CircleIcon = getIcon('Circle');
  const DivideIcon = getIcon('Divide');
  const ArrowLeftIcon = getIcon('ArrowLeft');

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

  // Render filter buttons function
  const renderFilters = () => {
    return (
      <>
        <button className="btn bg-surface-100 dark:bg-surface-800 hover:bg-surface-200">All</button>
        <button className="btn bg-surface-100 dark:bg-surface-800 hover:bg-surface-200">Numbers</button>
        <button className="btn bg-surface-100 dark:bg-surface-800 hover:bg-surface-200">Arithmetic</button>
        <button className="btn bg-surface-100 dark:bg-surface-800 hover:bg-surface-200">Shapes</button>
      </>
    );
  };

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
        icon: BookOpenIcon,
        color: 'bg-blue-100 dark:bg-blue-900/30',
      }
    ]
  };

  return (
    <motion.div 
      className="container px-4 py-8 mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="grid gap-6">
        {/* Static welcome message that won't blink/re-render */}
        <WelcomeMessage playerName={playerName} subject={subject} />
        
        {/* Game filters - static rendering */}
        {subject === 'math' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {renderFilters()}
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games[subject]?.map(game => (
            <GameCard key={game.id} game={game} onSelect={onGameSelect} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GameSelector;