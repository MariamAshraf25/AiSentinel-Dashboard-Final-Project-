import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button 
    onClick={() => setDarkMode(!darkMode)} 
    className="fixed bottom-8 right-8 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all duration-300 z-[9999] group"
  >
    {darkMode ? (
      <Sun size={24} className="text-yellow-400 group-hover:rotate-45 transition-transform" />
    ) : (
      <Moon size={24} className="text-blue-600 group-hover:-rotate-12 transition-transform" />
    )}
  </button>
);

export default ThemeToggle;