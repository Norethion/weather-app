import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export type Region = 'TR' | 'EU' | 'AF' | 'NA' | 'SA' | 'AS' | 'OC' | 'ALL';

interface RegionSelectorProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onRegionChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const regions = [
    { value: 'TR', label: t('regionTR') || 'Türkiye', icon: '🇹🇷', desc: t('regionTRDesc') || 'Sadece Türkiye' },
    { value: 'EU', label: t('regionEU') || 'Avrupa', icon: '🇪🇺', desc: t('regionEUDesc') || 'Avrupa ülkeleri' },
    { value: 'AF', label: t('regionAF') || 'Afrika', icon: '🌍', desc: t('regionAFDesc') || 'Afrika ülkeleri' },
    { value: 'NA', label: t('regionNA') || 'Kuzey Amerika', icon: '🌎', desc: t('regionNADesc') || 'Kuzey Amerika' },
    { value: 'SA', label: t('regionSA') || 'Güney Amerika', icon: '🌎', desc: t('regionSADesc') || 'Güney Amerika' },
    { value: 'AS', label: t('regionAS') || 'Asya', icon: '🌏', desc: t('regionASDesc') || 'Asya ülkeleri' },
    { value: 'OC', label: t('regionOC') || 'Okyanusya', icon: '🌏', desc: t('regionOCDesc') || 'Okyanusya ülkeleri' },
    { value: 'ALL', label: t('regionALL') || 'Tüm Dünya', icon: '🌍', desc: t('regionALLDesc') || 'Tüm ülkeler' }
  ];

  const getCurrentRegion = () => {
    return regions.find(r => r.value === selectedRegion) || regions[0];
  };

  const handleRegionSelect = (regionValue: Region, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRegionChange(regionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        <span className="text-lg">{getCurrentRegion().icon}</span>
        <span className="hidden sm:inline">{getCurrentRegion().label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {t('selectRegion') || 'Bölge Seç'}
              </h3>
              
              <div className="space-y-2">
                {regions.map((region) => (
                  <motion.div
                    key={region.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleRegionSelect(region.value as Region, e)}
                    className={`relative cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 ${
                      selectedRegion === region.value 
                        ? 'border-purple-500 shadow-lg bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{region.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {region.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {region.desc}
                          </div>
                        </div>
                      </div>
                      
                      {selectedRegion === region.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegionSelector; 