import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cityService, CitySuggestion } from '../services/cityService';

type SearchBarProps = {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  loading?: boolean;
  showLocationButton?: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocationSearch, loading = false, showLocationButton = true }) => {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced şehir önerilerini getir
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const results = await cityService.getCitySuggestions(city);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
  
        const fallbackResults = cityService.getFallbackCitySuggestions(city);
        setSuggestions(fallbackResults);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    };

    // 300ms debounce
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    setCity(suggestion.name);
    onSearch(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Input'u temizle
    setTimeout(() => {
      setCity('');
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Enter' && city.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mb-6" 
      ref={searchRef}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative flex-1"
        >
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={city}
            onChange={e => {
              setCity(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Şehir, kasaba ya da ülke adı..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto backdrop-blur-sm overflow-x-hidden focus:outline-none"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-2 cursor-pointer transition-colors focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/30 ${
                      index === selectedIndex ? 'bg-blue-100 dark:bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{suggestion.name}</div>
                    <div className={`text-sm ${index === selectedIndex ? 'text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}>
                      {suggestion.region}, {suggestion.country}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-2 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? t('loading') : t('search')}
          </motion.button>
          
          {showLocationButton && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onLocationSearch}
              disabled={loading}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50"
              title={t('currentLocation')}
            >
              📍
            </motion.button>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default SearchBar; 