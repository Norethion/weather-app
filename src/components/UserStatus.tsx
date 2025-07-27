import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFirebaseSettings } from '../hooks/useFirebaseSettings';

const UserStatus: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAnonymous } = useFirebaseSettings();
  const [showStatus, setShowStatus] = React.useState(true);

  React.useEffect(() => {
    if (isAuthenticated) {
      // 5 saniye sonra gizle
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !showStatus) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-40"
    >
      <div className="bg-green-500/90 dark:bg-green-600/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-green-400/30">
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="text-green-200">✓</span>
          <span className="font-medium">
            {isAnonymous 
              ? t('anonymousUser') || 'Anonim Kullanıcı'
              : t('authenticatedUser') || 'Giriş Yapıldı'
            }
          </span>
        </div>
        <p className="text-xs text-green-200/80 mt-1">
          {isAnonymous 
            ? t('anonymousSyncInfo') || 'Ayarlarınız anonim olarak kaydediliyor'
            : t('syncInfo') || 'Ayarlarınız senkronize ediliyor'
          }
        </p>
      </div>
    </motion.div>
  );
};

export default UserStatus; 