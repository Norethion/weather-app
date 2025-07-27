import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs, where, Timestamp, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db, userDataService } from '../services/firebase';
import { useToast } from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';

interface UserLog {
  id: string;
  action: string;
  userId: string;
  userEmail?: string;
  isAnonymous: boolean;
  details?: any;
  timestamp: Timestamp;
  userAgent: string;
}

interface User {
  id: string;
  email?: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  isActive: boolean;
  displayName: string;
  favorites: string[];
  recentSearches: string[];
  role?: string;
  permissions?: string[];
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, currentUser }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'logs'>('dashboard');
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    anonymousUsers: 0,
    registeredUsers: 0,
    todayLogins: 0,
    totalLogins: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [isDeletingLogs, setIsDeletingLogs] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'selected' | 'all' | 'anonymous' | null;
  }>({ open: false, type: null });

  // Admin kontrolü - Firebase'den kontrol et
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  const { success: showSuccess, error: showError, toasts } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          const isUserAdmin = await userDataService.isAdmin(currentUser.uid);
          setIsAdmin(isUserAdmin);
          setAdminCheckError(null);
          
          if (!isUserAdmin) {
            console.log('User is not an admin. Current user UID:', currentUser.uid);
            console.log('To make this user an admin, manually update their document in Firebase Console with role: "admin"');
            console.log('Firebase Console > Firestore Database > users >', currentUser.uid, '> Add fields: role="admin", permissions=["admin"]');
          }
        } catch (error: any) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminCheckError('Admin durumu kontrol edilirken hata oluştu. Firebase güvenlik kurallarını kontrol edin.');
        }
      } else {
        setIsAdmin(false);
        setAdminCheckError(null);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadData();
    }
  }, [isOpen, activeTab, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        await loadStats();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'logs') {
        await loadUserLogs();
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Kullanıcı istatistikleri
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter(user => user.isActive).length,
        anonymousUsers: usersData.filter(user => user.isAnonymous).length,
        registeredUsers: usersData.filter(user => !user.isAnonymous).length,
        todayLogins: 0, // Bu veriyi loglardan hesaplayabiliriz
        totalLogins: 0
      };

      // Login loglarını say - Index gerektirmeyen basit query
      const loginLogsQuery = query(
        collection(db, 'user_logs'),
        where('action', '==', 'login')
      );
      const loginLogsSnapshot = await getDocs(loginLogsQuery);
      stats.totalLogins = loginLogsSnapshot.size;

      // Bugünkü girişleri say
      const todayLogs = loginLogsSnapshot.docs.filter(doc => {
        const logData = doc.data();
        return logData.timestamp.toDate() >= today;
      });
      stats.todayLogins = todayLogs.length;

      setStats(stats);
    } catch (err) {
      console.error('Error loading stats:', err);
      
      // Permission error handling
      if ((err as { code?: string }).code === 'permission-denied') {
        console.error('Admin permissions required. Please check Firebase security rules and ensure user has admin role.');
        showError('Hata', 'Admin yetkisi gerekli. Firebase güvenlik kurallarını kontrol edin ve kullanıcının admin rolüne sahip olduğundan emin olun.');
      }
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      
      // Permission error handling
      if ((err as { code?: string }).code === 'permission-denied') {
        console.error('Admin permissions required. Please check Firebase security rules and ensure user has admin role.');
        showError('Hata', 'Admin yetkisi gerekli. Firebase güvenlik kurallarını kontrol edin ve kullanıcının admin rolüne sahip olduğundan emin olun.');
      }
    }
  };

  const loadUserLogs = async () => {
    try {
      const logsQuery = query(
        collection(db, 'user_logs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserLog[];
      setUserLogs(logsData);
    } catch (err) {
      console.error('Error loading user logs:', err);
      
      // Permission error handling
      if ((err as { code?: string }).code === 'permission-denied') {
        console.error('Admin permissions required. Please check Firebase security rules and ensure user has admin role.');
        showError('Hata', 'Admin yetkisi gerekli. Firebase güvenlik kurallarını kontrol edin ve kullanıcının admin rolüne sahip olduğundan emin olun.');
      }
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'login': return t('actionLogin');
      case 'logout': return t('actionLogout');
      case 'register': return t('actionRegister');
      case 'settings_change': return t('actionSettingsChange');
      case 'favorite_add': return t('actionFavoriteAdd');
      case 'favorite_remove': return t('actionFavoriteRemove');
      case 'search': return t('actionSearch');
      default: return action;
    }
  };

  // Log detaylarını okunabilir hale getir
  const getReadableDetails = (details: any, action: string) => {
    if (!details) return null;

    switch (action) {
      case 'login':
        return `Giriş yapıldı`;
      case 'logout':
        return `Çıkış yapıldı`;
      case 'register':
        return `Yeni hesap oluşturuldu`;
      case 'settings_change':
        const changes = [];
        if (details.theme) changes.push(`Tema: ${details.theme}`);
        if (details.language) changes.push(`Dil: ${details.language}`);
        if (details.region) changes.push(`Bölge: ${details.region}`);
        if (details.units) changes.push(`Birim: ${details.units}`);
        if (details.notifications !== undefined) changes.push(`Bildirimler: ${details.notifications ? 'Açık' : 'Kapalı'}`);
        return changes.length > 0 ? changes.join(', ') : 'Ayar değişikliği';
      case 'favorite_add':
        return details.city ? `Favorilere eklendi: ${details.city}` : 'Favori eklendi';
      case 'favorite_remove':
        return details.city ? `Favorilerden çıkarıldı: ${details.city}` : 'Favori çıkarıldı';
      case 'search':
        return details.city ? `Arama yapıldı: ${details.city}` : 'Arama yapıldı';
      default:
        return JSON.stringify(details);
    }
  };

  // Log için renk belirle
  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'register':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'settings_change':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'favorite_add':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200';
      case 'favorite_remove':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'search':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Filtrelenmiş logları hesapla
  const filteredLogs = userLogs.filter(log => {
    // Filtre kontrolü
    if (logFilter !== 'all' && log.action !== logFilter) {
      return false;
    }
    
    // Arama kontrolü
    if (logSearch) {
      const searchLower = logSearch.toLowerCase();
      const emailMatch = log.userEmail?.toLowerCase().includes(searchLower);
      const detailsMatch = JSON.stringify(log.details).toLowerCase().includes(searchLower);
      const actionMatch = getActionText(log.action).toLowerCase().includes(searchLower);
      
      if (!emailMatch && !detailsMatch && !actionMatch) {
        return false;
      }
    }
    
    return true;
  });

  // Log seçme/seçim kaldırma
  const toggleLogSelection = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  // Tüm logları seç/seçimi kaldır
  const toggleAllLogsSelection = () => {
    if (selectedLogs.size === filteredLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredLogs.map(log => log.id)));
    }
  };

  // Seçili logları sil
  const deleteSelectedLogs = async () => {
    if (selectedLogs.size === 0) return;
    
    const selectedCount = selectedLogs.size; // Silme işleminden önce sayıyı sakla
    console.log('Deleting selected logs:', selectedCount);
    
    setIsDeletingLogs(true);
    try {
      const deletePromises = Array.from(selectedLogs).map((logId: string) => 
        deleteDoc(doc(db, 'user_logs', logId))
      );
      await Promise.all(deletePromises);
      await loadUserLogs();
      setSelectedLogs(new Set());
      console.log('Successfully deleted logs, showing toast...');
      showSuccess('Başarılı', `${selectedCount} log kaydı başarıyla silindi.`);
    } catch (err) {
      console.error('Error deleting logs:', err);
      showError('Hata', 'Loglar silinirken hata oluştu: ' + (err as { message?: string }).message);
    } finally {
      setIsDeletingLogs(false);
      setConfirmModal({ open: false, type: null });
    }
  };

  // Tüm logları sil
  const deleteAllLogs = async () => {
    if (userLogs.length === 0) return;
    
    const totalCount = userLogs.length; // Silme işleminden önce sayıyı sakla
    console.log('Deleting all logs:', totalCount);
    
    setIsDeletingLogs(true);
    try {
      const deletePromises = userLogs.map(log => 
        deleteDoc(doc(db, 'user_logs', log.id))
      );
      await Promise.all(deletePromises);
      await loadUserLogs();
      setSelectedLogs(new Set());
      console.log('Successfully deleted all logs, showing toast...');
      showSuccess('Başarılı', `${totalCount} log kaydı başarıyla silindi.`);
    } catch (err) {
      console.error('Error deleting all logs:', err);
      showError('Hata', 'Loglar silinirken hata oluştu: ' + (err as { message?: string }).message);
    } finally {
      setIsDeletingLogs(false);
      setConfirmModal({ open: false, type: null });
    }
  };

  // Anonim kullanıcıları temizle
  const deleteAnonymousUsers = async () => {
    setIsDeletingLogs(true);
    try {
      const anonymousUsers = users.filter(user => user.isAnonymous);
      
      // Batch işlemi kullanarak daha güvenli silme
      const batch = writeBatch(db);
      
      anonymousUsers.forEach(user => {
        const userRef = doc(db, 'users', user.id);
        batch.delete(userRef);
        
        // Kullanıcının loglarını da sil
        const userLogsQuery = query(
          collection(db, 'user_logs'),
          where('userId', '==', user.id)
        );
        // Logları da batch'e ekle (silme işlemi için)
        getDocs(userLogsQuery).then(snapshot => {
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
        });
      });
      
      await batch.commit();
      await loadUsers();
      showSuccess('Başarılı', `${anonymousUsers.length} anonim kullanıcı ve ilgili verileri başarıyla silindi.`);
    } catch (err) {
      console.error('Error deleting anonymous users:', err);
      showError('Hata', 'Anonim kullanıcılar silinirken hata oluştu: ' + (err as { message?: string }).message);
    } finally {
      setIsDeletingLogs(false);
      setConfirmModal({ open: false, type: null });
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString('tr-TR');
  };

  // Kullanıcı rolünü değiştir
  const updateUserRole = async (userId: string, newRole: string) => {
    if (!currentUser) return;
    
    try {
      await userDataService.updateUserRole(userId, {
        role: newRole,
        permissions: newRole === 'admin' ? ['admin'] : []
      }, currentUser.uid);
      
      // Kullanıcı listesini yenile
      await loadUsers();
      
      // Başarı mesajı göster
      showSuccess('Başarılı', `Kullanıcı rolü ${newRole} olarak güncellendi`);
    } catch (err) {
      console.error('Error updating user role:', err);
      showError('Hata', 'Rol güncellenirken hata oluştu: ' + (err as { message?: string }).message);
    }
  };

  if (!isAdmin) {
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Admin Yetkisi Gerekli
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Bu panele erişmek için admin yetkisine sahip olmanız gerekiyor.
                </p>
                {adminCheckError && (
                  <p className="text-red-500 text-sm mb-4">
                    {adminCheckError}
                  </p>
                )}
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 mb-4">
                  <p className="font-semibold mb-2">Admin hesabı oluşturmak için:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Firebase Console'a gidin</li>
                    <li>2. Firestore Database &gt; users koleksiyonunu açın</li>
                    <li>3. Kullanıcınızın dokümanını bulun</li>
                    <li>4. Aşağıdaki alanları ekleyin:</li>
                  </ol>
                  <pre className="bg-gray-200 dark:bg-gray-600 p-2 rounded mt-2 text-xs">
{`{
  "role": "admin",
  "permissions": ["admin"],
  "grantedBy": "manual",
  "grantedAt": "2024-01-01T00:00:00.000Z"
}`}
                  </pre>
                </div>
                <button
                  onClick={onClose}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('adminPanel')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {t('adminDashboard')}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {t('userManagement')}
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {t('userLogs')}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loadingData')}</span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t('systemStats')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {t('totalUsers')}
                          </h4>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                            {stats.totalUsers}
                          </p>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                            {t('activeUsers')}
                          </h4>
                          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                            {stats.activeUsers}
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            {t('anonymousUsers')}
                          </h4>
                          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                            {stats.anonymousUsers}
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {t('registeredUsers')}
                          </h4>
                          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                            {stats.registeredUsers}
                          </p>
                        </div>
                        
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {t('todayLogins')}
                          </h4>
                          <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                            {stats.todayLogins}
                          </p>
                        </div>
                        
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                            {t('totalLogins')}
                          </h4>
                          <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                            {stats.totalLogins}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'users' && (
                    <motion.div
                      key="users"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {t('userManagement')}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmModal({ open: true, type: 'anonymous' })}
                            disabled={isDeletingLogs || users.filter(u => u.isAnonymous).length === 0}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeletingLogs ? 'Siliniyor...' : `Anonim Kullanıcıları Temizle (${users.filter(u => u.isAnonymous).length})`}
                          </button>
                          <button
                            onClick={loadUsers}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            {t('refreshData')}
                          </button>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                          <thead className="bg-gray-50 dark:bg-gray-600">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('userEmail')}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('isAnonymous')}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('lastLogin')}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('isActive')}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('role')}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t('actions')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {users.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {user.email || t('anonymousUser')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {user.isAnonymous ? '✓' : '✗'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {formatDate(user.lastLogin)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {user.isActive ? '✓' : '✗'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                  }`}>
                                    {user.role || 'user'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm space-x-2">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                  >
                                    {t('viewDetails')}
                                  </button>
                                  {user.role !== 'admin' && (
                                    <button
                                      onClick={() => updateUserRole(user.id, 'admin')}
                                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                                    >
                                      {t('makeAdmin')}
                                    </button>
                                  )}
                                  {user.role === 'admin' && (
                                    <button
                                      onClick={() => updateUserRole(user.id, 'user')}
                                      className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                                    >
                                      {t('removeAdmin')}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'logs' && (
                    <motion.div
                      key="logs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {t('userLogs')}
                        </h3>
                        <div className="flex gap-2">
                          {selectedLogs.size > 0 && (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: 'selected' })}
                              disabled={isDeletingLogs}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeletingLogs ? 'Siliniyor...' : `${selectedLogs.size} Seçiliyi Sil`}
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmModal({ open: true, type: 'all' })}
                            disabled={isDeletingLogs || userLogs.length === 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeletingLogs ? 'Siliniyor...' : 'Tümünü Sil'}
                          </button>
                          <button
                            onClick={loadUserLogs}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            {t('refreshData')}
                          </button>
                        </div>
                      </div>

                      {/* Filtreleme ve Arama */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder={t('searchLogs')}
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <select
                            value={logFilter}
                            onChange={(e) => setLogFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all">{t('allActions')}</option>
                            <option value="login">{t('actionLogin')}</option>
                            <option value="logout">{t('actionLogout')}</option>
                            <option value="register">{t('actionRegister')}</option>
                            <option value="settings_change">{t('actionSettingsChange')}</option>
                            <option value="favorite_add">{t('actionFavoriteAdd')}</option>
                            <option value="favorite_remove">{t('actionFavoriteRemove')}</option>
                            <option value="search">{t('actionSearch')}</option>
                          </select>
                        </div>
                      </div>

                      {/* Log Sayısı ve Seçim Bilgisi */}
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {filteredLogs.length} {t('logsShowing')} ({t('totalLogs')} {userLogs.length})
                        </span>
                        {filteredLogs.length > 0 && (
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedLogs.size === filteredLogs.length}
                                onChange={toggleAllLogsSelection}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>Tümünü Seç</span>
                            </label>
                            {selectedLogs.size > 0 && (
                              <span className="text-blue-600 font-medium">
                                {selectedLogs.size} seçili
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredLogs.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {userLogs.length === 0 ? t('noLogsFound') : t('noMatchingLogs')}
                          </div>
                        ) : (
                          filteredLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`bg-white dark:bg-gray-700 border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                selectedLogs.has(log.id) 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                                                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedLogs.has(log.id)}
                                    onChange={() => toggleLogSelection(log.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionColor(log.action)}`}>
                                      {getActionText(log.action)}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      log.isAnonymous 
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                    }`}>
                                      {log.isAnonymous ? 'Anonim' : 'Kayıtlı'}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(log.timestamp)}
                                </span>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {log.userEmail || 'Anonim Kullanıcı'}
                                </p>
                                
                                {getReadableDetails(log.details, log.action) && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {getReadableDetails(log.details, log.action)}
                                  </p>
                                )}
                                
                                {log.details && Object.keys(log.details).length > 0 && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                      {t('showDetails')}
                                    </summary>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded overflow-x-auto">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
              {selectedUser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setSelectedUser(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      {t('userProfile')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('userEmail')}:
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedUser.email || t('anonymousUser')}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('createdAt')}:
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedUser.createdAt)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('lastLogin')}:
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedUser.lastLogin)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('userFavorites')}:
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedUser.favorites?.length || 0} {t('favorites')}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('userSearches')}:
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedUser.recentSearches?.length || 0} {t('recentSearches')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <ConfirmModal
              open={confirmModal.open}
              title="Onay"
              message={
                confirmModal.type === 'all' ? `${userLogs.length} log kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` :
                confirmModal.type === 'selected' ? `${selectedLogs.size} log kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` :
                confirmModal.type === 'anonymous' ? `${users.filter(u => u.isAnonymous).length} anonim kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` :
                ''
              }
              confirmText="Evet, Sil"
              cancelText="Vazgeç"
              onConfirm={
                confirmModal.type === 'all' ? deleteAllLogs :
                confirmModal.type === 'selected' ? deleteSelectedLogs :
                confirmModal.type === 'anonymous' ? deleteAnonymousUsers :
                () => {}
              }
              onCancel={() => setConfirmModal({ open: false, type: null })}
            />

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className={`bg-white dark:bg-gray-800 border-l-4 p-4 rounded-lg shadow-lg max-w-sm ${
                    toast.type === 'success' ? 'border-green-500' :
                    toast.type === 'error' ? 'border-red-500' :
                    toast.type === 'warning' ? 'border-yellow-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-semibold ${
                        toast.type === 'success' ? 'text-green-800 dark:text-green-400' :
                        toast.type === 'error' ? 'text-red-800 dark:text-red-400' :
                        toast.type === 'warning' ? 'text-yellow-800 dark:text-yellow-400' :
                        'text-blue-800 dark:text-blue-400'
                      }`}>
                        {toast.title}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {toast.message}
                      </p>
                    </div>
                    <button
                      onClick={() => toast.onClose(toast.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPanel; 