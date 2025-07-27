import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/firebase';
import ConfirmModal from './ConfirmModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, showError, showSuccess }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnonymousConfirm, setShowAnonymousConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
        showSuccess(t('success'), t('loginSuccess') || 'Giriş başarılı');
      } else {
        if (password !== confirmPassword) {
          showError(t('error'), t('passwordMismatch') || 'Şifreler eşleşmiyor');
          return;
        }
        await authService.register(email, password);
        showSuccess(t('success'), t('registerSuccess') || 'Kayıt başarılı');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showError(t('error'), error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setShowAnonymousConfirm(true);
  };

  const confirmAnonymousLogin = async () => {
    setShowAnonymousConfirm(false);
    setLoading(true);
    try {
      await authService.loginAnonymously();
      showSuccess(t('success'), t('anonymousLoginSuccess') || 'Anonim olarak giriş yapıldı');
      onSuccess();
      onClose();
    } catch (error: any) {
      showError(t('error'), t('anonymousLoginError') || 'Anonim giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const cancelAnonymousLogin = () => {
    setShowAnonymousConfirm(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isLogin ? t('login') : t('register')}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </motion.button>
            </div>

            {/* Anonim Giriş Butonu */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnonymousLogin}
              disabled={loading}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? t('loading') : (t('anonymousLogin') || 'Anonim Olarak Giriş Yap')}
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  {t('or') || 'veya'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('loading') : (isLogin ? t('login') : t('register'))}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                {isLogin ? t('noAccount') : t('haveAccount')}
              </button>
            </div>

            {/* Anonim giriş bilgilendirmesi */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                {t('anonymousLoginInfo') || 'Anonim giriş ile ayarlarınızı kaydedebilir ve favori şehirlerinizi senkronize edebilirsiniz.'}
              </p>
            </div>

            {/* Anonim Giriş Onay Modalı */}
            <ConfirmModal
              open={showAnonymousConfirm}
              title="Anonim Giriş Uyarısı"
              message={`⚠️ Önemli: Anonim kullanıcı olarak giriş yaptığınızda:

• Favorileriniz, ayarlarınız ve arama geçmişiniz sadece bu oturum için kaydedilir
• Çıkış yaptığınızda tüm verileriniz kalıcı olarak silinir
• Verilerinizi kalıcı olarak kaydetmek için normal hesap oluşturmanız önerilir

Devam etmek istiyor musunuz?`}
              confirmText="Evet, Devam Et"
              cancelText="Vazgeç"
              onConfirm={confirmAnonymousLogin}
              onCancel={cancelAnonymousLogin}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 