import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/firebase';


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        showError(t('error'), t('passwordsDoNotMatch') || 'Şifreler eşleşmiyor');
        return;
      }

      if (isLogin) {
        await authService.login(email, password);
        showSuccess(t('success'), t('loginSuccess') || 'Başarıyla giriş yapıldı');
      } else {
        await authService.register(email, password);
        showSuccess(t('success'), t('registerSuccess') || 'Hesap başarıyla oluşturuldu');
      }

      onSuccess();
      onClose();
    } catch (error: any) {

      
      let errorMessage = t('generalError') || 'Bir hata oluştu';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = t('userNotFound') || 'Kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = t('wrongPassword') || 'Yanlış şifre';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = t('invalidCredential') || 'E-posta veya şifre yanlış';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('emailAlreadyInUse') || 'Bu e-posta adresi zaten kullanımda';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('weakPassword') || 'Şifre çok zayıf';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('invalidEmail') || 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = t('tooManyRequests') || 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = t('userDisabled') || 'Bu hesap devre dışı bırakılmış';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = t('networkError') || 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin';
      }


      showError(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 