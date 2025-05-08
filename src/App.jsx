import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import getIcon from './utils/iconUtils';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check for user preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(
      darkMode ? "Switched to light mode! 🌞" : "Switched to dark mode! 🌙", 
      { autoClose: 1500 }
    );
  };

  // Create icon components
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const GithubIcon = getIcon('Github');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-surface-800 dark:to-surface-900 transition-colors duration-300">
      <header className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="https://pixabay.com/get/g7cc08fccb9a4b5e3657aeeed28c51ee00ae3beac3b5a4d9a03ab3cd72a68be4a6aa6b41f46f2e2f0ddc2ffc2e1e1a20a10d4a9b7cf49cdf37eea9064b5b27cd7_640.png" 
            alt="BrainSprout Logo" 
            className="h-10 w-10"
          />
          <h1 className="text-xl md:text-2xl font-bold text-primary-dark dark:text-primary-light">
            BrainSprout
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </motion.button>
        </div>
      </header>

      <main className="container mx-auto py-4 px-4">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="container mx-auto py-6 px-4 mt-8 border-t border-surface-200 dark:border-surface-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 md:mb-0">
            © 2023 BrainSprout. Fun learning for curious minds!
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-surface-500 hover:text-primary transition-colors">
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="text-sm font-medium"
      />
    </div>
  );
}

export default App;