import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  ChevronRight, 
  Search, 
  Settings, 
  Sun, 
  FileText,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Target,
  Award,
  AlertCircle,
  GraduationCap,
  Flame,
  Star,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  BarChart,
  PieChart,
  LineChart,
  Plus,
  Filter,
  RefreshCw,
  Microscope,
  Package,
  Droplets,
  HardHat,
  FlaskConical,
  XCircle,
  AlertCircle as AlertCircleIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { dashboardService, DashboardData, RecentActivity } from '../services/dashboardService';
import { useFormattedTime } from '../hooks/useRealTime';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // Hook pour l'heure en temps réel
  const { time, date, fullDateTime } = useFormattedTime();

  // Chargement des données
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [dashboardData, activities] = await Promise.all([
        dashboardService.getAllDashboardData(),
        dashboardService.getRecentActivities()
      ]);

      setData(dashboardData);
      setRecentActivities(activities);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'conforme':
      case 'terminé':
      case 'validé':
        return 'text-green-600 bg-green-100';
      case 'non conforme':
      case 'rejeté':
        return 'text-red-600 bg-red-100';
      case 'en attente':
      case 'planifié':
        return 'text-yellow-600 bg-yellow-100';
      case 'en cours':
      case 'en investigation':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'haute':
        return 'text-red-600 bg-red-100';
      case 'moyenne':
        return 'text-yellow-600 bg-yellow-100';
      case 'basse':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'laboratoire':
        return <Microscope className="h-4 w-4" />;
      case 'qualite':
        return <Package className="h-4 w-4" />;
      case 'hse':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'laboratoire':
        return 'text-blue-600 bg-blue-100';
      case 'qualite':
        return 'text-green-600 bg-green-100';
      case 'hse':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Erreur lors du chargement des données</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tableau de Bord QHSE
            </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vue d'ensemble des modules Laboratoire, Qualité et HSE
            </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {date}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">En ligne</span>
            </div>
            <div className="flex items-center space-x-2" title={fullDateTime}>
              <Clock className="h-4 w-4" />
              <span className="font-mono">{time}</span>
            </div>
            <div className="hidden sm:block">
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Laboratoire */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Microscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Laboratoire</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Échantillons & Analyses</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('laboratoire')}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Échantillons</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.echantillons.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Analyses</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.analyses.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Plans de contrôle</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.plansControle.total}</span>
            </div>
          </div>
          </div>
          
        {/* Qualité */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Qualité</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Contrôles & Conformité</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('qualite')}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Matières premières</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.qualite.matieresPremieres.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Non-conformités</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.qualite.nonConformites.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score conformité</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.qualite.conformite.score}%</span>
            </div>
              </div>
              </div>

        {/* HSE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">HSE</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sécurité & Environnement</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('hse')}
              className="text-orange-600 hover:text-orange-700 transition-colors"
            >
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Incidents</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.hse.incidents.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Risques</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.hse.risques.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Formations</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.hse.formations.total}</span>
            </div>
          </div>
        </div>

        {/* Indicateurs globaux */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Performance Globale</h3>
              <p className="text-primary-100 text-sm">Score de conformité</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-primary-100 text-sm">Score actuel</span>
              <span className="text-2xl font-bold">{data.qualite.conformite.score}%</span>
              </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-100 text-sm">Évolution</span>
              <div className="flex items-center space-x-1">
                {data.qualite.conformite.evolution >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">{Math.abs(data.qualite.conformite.evolution)}%</span>
              </div>
            </div>
          </div>
              </div>
            </div>
            
      {/* Graphiques et métriques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* État des échantillons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">État des Échantillons</h3>
            <Microscope className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">En attente</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.echantillons.enAttente}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">En cours</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.echantillons.enCours}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Terminés</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.echantillons.termines}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Non conformes</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{data.laboratoire.echantillons.nonConformes}</span>
            </div>
          </div>
        </div>

        {/* Alertes et incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alertes & Incidents</h3>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Incidents critiques</span>
              </div>
              <span className="font-semibold text-red-600">{data.hse.incidents.critiques}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Risques élevés</span>
              </div>
              <span className="font-semibold text-orange-600">{data.hse.risques.tresEleves}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Non-conformités critiques</span>
              </div>
              <span className="font-semibold text-yellow-600">{data.qualite.nonConformites.critiques}</span>
              </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Décisions en attente</span>
              </div>
              <span className="font-semibold text-blue-600">{data.qualite.decisionsQualite.enAttente}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activités Récentes</h3>
            <button 
              onClick={() => onNavigate?.('dashboard')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
        </div>
        <div className="p-6">
          {recentActivities.length > 0 ? (
          <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`p-2 rounded-lg ${getModuleColor(activity.type)}`}>
                  {getModuleIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.statut)}`}>
                        {activity.statut}
                      </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleString('fr-FR')}
                    </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priorite)}`}>
                        {activity.priorite}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}