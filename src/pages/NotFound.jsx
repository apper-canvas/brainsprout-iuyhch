import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const NotFound = () => {
  // Icon components
  const HomeIcon = getIcon('Home');
  const FrownIcon = getIcon('Frown');

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 p-6 bg-surface-100 dark:bg-surface-800 rounded-full">
        <FrownIcon className="w-16 h-16 text-primary" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Oops! Page Not Found</h1>
      
      <p className="text-lg mb-8 text-surface-600 dark:text-surface-400 max-w-md">
        It looks like we can't find the page you're looking for. Let's get you back to the learning adventure!
      </p>
      
      <Link 
        to="/" 
        className="btn btn-primary text-base px-6 py-3 inline-flex items-center space-x-2"
      >
        <HomeIcon className="w-5 h-5" />
        <span>Return to Home</span>
      </Link>
    </motion.div>
  );
};

export default NotFound;