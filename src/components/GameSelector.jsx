import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

const GameSelector = ({ subject, onGameSelect, playerName }) => {
  // Icon components
  const CalculatorIcon = getIcon('Calculator');
  const BookOpenIcon = getIcon('BookOpen');
  const HashIcon = getIcon('Hash');
  const PlusIcon = getIcon('Plus');
  const DivideIcon = getIcon('Divide');
  const PercentIcon = getIcon('Percent');
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
        iconColor: 'text-blue-600 dark:text-blue-400'
      },
      {
        id: 'counting',
        title: 'Counting Adventure',
        description: 'Count objects and match with correct numbers',
        icon: getIcon('Hash'),
        color: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400'
      },
      {
        id: 'basic-arithmetic',
        title: 'Basic Arithmetic',
        description: 'Practice addition and subtraction',
        icon: PlusIcon,
        color: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
      },
      {
        id: 'fractions',
        title: 'Fraction Fun',
        description: 'Learn to identify and work with fractions',
        icon: DivideIcon,
        color: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        id: 'geometry',
        title: 'Shape Explorer',
        description: 'Discover geometric shapes and their properties',
        icon: CircleIcon,
        color: 'bg-pink-100 dark:bg-pink-900/30',
        iconColor: 'text-pink-600 dark:text-pink-400',
      }
    ],
    reading: [
      {
        id: 'word-matching',
        title: 'Word Matching',
        description: 'Match words with their meanings',
        icon: BookOpenIcon,
        color: 'bg-teal-100 dark:bg-teal-900/30',
        iconColor: 'text-teal-600 dark:text-teal-400'
      }
    ]
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div className="card p-6 md:p-8" variants={containerVariants} initial="hidden" animate="visible">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Choose a {subject.charAt(0).toUpperCase() + subject.slice(1)} Game, {playerName}!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games[subject].map((game) => (
          <motion.div key={game.id} 
            className={`card p-4 cursor-pointer hover:shadow-soft transition-all ${game.comingSoon ? 'opacity-70' : ''}`}
            onClick={() => game.comingSoon ? toast.info("Coming soon! This game is under development.") : onGameSelect(game.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              <div className={`${game.color} p-3 rounded-lg`}>
                <game.icon className={`w-6 h-6 ${game.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  {game.title}
                  {game.comingSoon && (
                    <span className="text-xs font-normal px-2 py-0.5 bg-surface-200 dark:bg-surface-700 rounded-full">Coming Soon</span>
                  )}
                </h3>
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