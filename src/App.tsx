import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Sidebar, NotificationSystem } from './components/common';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppRouter } from './components/routing';
import { 
  Shield, 
  BarChart3, 
  Settings,
  Sun,
  Moon,
  LogOut,
  Microscope,
  Package,
  Droplets,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  HardHat,
  GraduationCap,
  FlaskConical
} from 'lucide-react';

// Composant principal de l'application avec authentification
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, getFullName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme management - DOIT être appelé avant tout return conditionnel
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Si en cours de chargement, afficher un loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher le routage (page de connexion)
  if (!isAuthenticated) {
    return <AppRouter />;
  }

    // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
    },
    {
      id: 'laboratoire',
      label: 'Laboratoire',
      icon: Microscope,
      badge: 12,
      children: [
        {
          id: 'laboratoire-echantillons',
          label: 'Échantillons',
          icon: Microscope,
        },
        {
          id: 'laboratoire-analyses',
          label: 'Analyses',
          icon: FlaskConical,
        },
        {
          id: 'laboratoire-plans-controle',
          label: 'Plans de Contrôle',
          icon: FileText,
        },
        {
          id: 'laboratoire-tracabilite',
          label: 'Traçabilité',
          icon: FileText,
        },
        {
          id: 'laboratoire-statistiques',
          label: 'Statistiques',
          icon: BarChart3,
        }
      ]
    },
    {
      id: 'qualite',
      label: 'Qualité',
      icon: Package,
      badge: 8,
      children: [
        {
          id: 'qualite-matieres-premieres',
          label: 'Matières Premières',
          icon: Package,
        },
        {
          id: 'qualite-controles-qualite',
          label: 'Contrôles Qualité',
          icon: CheckCircle,
        },
        {
          id: 'qualite-non-conformites',
          label: 'Non-Conformités',
          icon: AlertTriangle,
        },
        {
          id: 'qualite-decisions-qualite',
          label: 'Décisions Qualité',
          icon: CheckCircle,
        },
        {
          id: 'qualite-plans-controle',
          label: 'Plans de Contrôle',
          icon: FileText,
        },
        {
          id: 'qualite-tracabilite',
          label: 'Traçabilité',
          icon: Shield,
        },
        {
          id: 'qualite-audits',
          label: 'Audits',
          icon: FileText,
        },
        {
          id: 'qualite-conformite',
          label: 'Conformité',
          icon: Shield,
        },
        {
          id: 'qualite-statistiques',
          label: 'Statistiques',
          icon: BarChart3,
        }
      ]
    },
    {
      id: 'hse',
      label: 'HSE',
      icon: Droplets,
      badge: 15,
      children: [
        {
          id: 'hse-hygiene',
          label: 'Hygiène',
          icon: Droplets,
        },
        {
          id: 'hse-epi',
          label: 'EPI',
          icon: HardHat,
        },
        {
          id: 'hse-produits-chimiques',
          label: 'Produits Chimiques',
          icon: AlertTriangle,
        },
        {
          id: 'hse-incidents',
          label: 'Incidents',
          icon: AlertCircle,
        },
        {
          id: 'hse-risques',
          label: 'Gestion des Risques',
          icon: AlertTriangle,
        },
        {
          id: 'hse-formations',
          label: 'Formations QHSE',
          icon: GraduationCap,
        },
        {
          id: 'hse-statistiques',
          label: 'Statistiques',
          icon: BarChart3,
        }
      ]
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings,
    }
  ];



  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction de navigation utilisant React Router
  const handleNavigation = (pageId: string) => {
    const routeMap: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'configuration': '/configuration',
      'laboratoire': '/laboratoire',
      'laboratoire-echantillons': '/laboratoire/echantillons',
      'laboratoire-analyses': '/laboratoire/analyses',
      'laboratoire-plans-controle': '/laboratoire/plans-controle',
      'laboratoire-tracabilite': '/laboratoire/tracabilite',
      'laboratoire-statistiques': '/laboratoire/statistiques',
      'qualite': '/qualite',
      'qualite-matieres-premieres': '/qualite/matieres-premieres',
      'qualite-controles-qualite': '/qualite/controles-qualite',
      'qualite-non-conformites': '/qualite/non-conformites',
      'qualite-decisions-qualite': '/qualite/decisions-qualite',
      'qualite-plans-controle': '/qualite/plans-controle',
      'qualite-tracabilite': '/qualite/tracabilite',
      'qualite-audits': '/qualite/audits',
      'qualite-conformite': '/qualite/conformite',
      'qualite-statistiques': '/qualite/statistiques',
      'hse': '/hse',
      'hse-hygiene': '/hse/hygiene',
      'hse-epi': '/hse/epi',
      'hse-produits-chimiques': '/hse/produits-chimiques',
      'hse-incidents': '/hse/incidents',
      'hse-risques': '/hse/risques',
      'hse-formations': '/hse/formations',
      'hse-statistiques': '/hse/statistiques'
    };
    
    const route = routeMap[pageId];
    if (route) {
      navigate(route);
    }
  };

  // Déterminer la page actuelle basée sur l'URL
  const getCurrentPageFromPath = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/configuration') return 'configuration';
    if (path.startsWith('/laboratoire')) {
      const subPath = path.replace('/laboratoire', '');
      if (subPath === '' || subPath === '/') return 'laboratoire';
      return `laboratoire${subPath.replace('/', '-')}`;
    }
    if (path.startsWith('/qualite')) {
      const subPath = path.replace('/qualite', '');
      if (subPath === '' || subPath === '/') return 'qualite';
      // Gérer les cas spéciaux pour les routes qualité
      const routeMap: { [key: string]: string } = {
        '/matieres-premieres': 'qualite-matieres-premieres',
        '/controles-qualite': 'qualite-controles-qualite',
        '/non-conformites': 'qualite-non-conformites',
        '/decisions-qualite': 'qualite-decisions-qualite',
        '/plans-controle': 'qualite-plans-controle',
        '/tracabilite': 'qualite-tracabilite',
        '/audits': 'qualite-audits',
        '/conformite': 'qualite-conformite',
        '/statistiques': 'qualite-statistiques'
      };
      return routeMap[subPath] || `qualite${subPath.replace('/', '-')}`;
    }
    if (path.startsWith('/hse')) {
      const subPath = path.replace('/hse', '');
      if (subPath === '' || subPath === '/') return 'hse';
      // Gérer les cas spéciaux pour les routes HSE
      const routeMap: { [key: string]: string } = {
        '/hygiene': 'hse-hygiene',
        '/epi': 'hse-epi',
        '/produits-chimiques': 'hse-produits-chimiques',
        '/incidents': 'hse-incidents',
        '/risques': 'hse-risques',
        '/formations': 'hse-formations',
        '/statistiques': 'hse-statistiques'
      };
      return routeMap[subPath] || `hse${subPath.replace('/', '-')}`;
    }
    return 'dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        items={navigationItems}
        currentPage={getCurrentPageFromPath()}
        onPageChange={handleNavigation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={{
          name: getFullName(),
          email: user?.email || '',
          avatar: undefined
        }}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Module QHSE
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Système de notifications */}
              <NotificationSystem onNavigate={handleNavigation} />

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getFullName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {user?.prenom?.charAt(0) || '?'}
                  </span>
                </div>
                
                {/* Bouton de déconnexion */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <AppRouter />
        </main>
      </div>
    </div>
  );
};

// Composant App principal avec le Provider d'authentification et le Router
function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App; 