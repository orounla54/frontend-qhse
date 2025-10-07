import React, { useState, useEffect } from 'react';
import {
  Microscope,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap,
  Award,
  RefreshCw,
  Download,
  PieChart,
  BarChart
} from 'lucide-react';

interface StatistiquesData {
  echantillons: {
    total: number;
    conformes: number;
    nonConformes: number;
    partiels: number;
    enAttente: number;
    evolution: number;
  };
  analyses: {
    total: number;
    terminees: number;
    enCours: number;
    planifiees: number;
    evolution: number;
  };
  plansControle: {
    total: number;
    actifs: number;
    enAttente: number;
    evolution: number;
  };
  performance: {
    tauxConformite: number;
    delaiMoyen: number;
    efficacite: number;
  };
  tendances: {
    echantillonsParMois: Array<{ mois: string; valeur: number }>;
    conformiteParType: Array<{ type: string; conformite: number }>;
    analysesParCategorie: Array<{ categorie: string; nombre: number }>;
  };
  alertes: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    priorite: 'haute' | 'moyenne' | 'basse';
    date: string;
  }>;
  recommandations: Array<{
    id: string;
    titre: string;
    description: string;
    impact: 'eleve' | 'moyen' | 'faible';
    action: string;
  }>;
}

interface StatistiquesLaboratoireProps {
  echantillons: any[];
  analyses: any[];
  plans: any[];
}

const StatistiquesLaboratoire: React.FC<StatistiquesLaboratoireProps> = ({
  echantillons,
  analyses,
  plans
}) => {
  const [data, setData] = useState<StatistiquesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30j');

  // Calculer les statistiques à partir des données
  useEffect(() => {
    const calculateStats = () => {
      const totalE = echantillons.length;
      const conformes = echantillons.filter(e => e.resultats?.conformite === 'Conforme').length;
      const nonConformes = echantillons.filter(e => e.resultats?.conformite === 'Non conforme').length;
      const partiels = echantillons.filter(e => e.resultats?.conformite === 'Partiellement conforme').length;
      const enAttente = echantillons.filter(e => e.resultats?.conformite === 'En attente' || !e.resultats?.conformite).length;

      const totalA = analyses.length;
      const terminees = analyses.filter(a => a.statut === 'Terminée' || a.statut === 'Validée').length;
      const enCours = analyses.filter(a => a.statut === 'En cours').length;
      const planifiees = analyses.filter(a => a.statut === 'Planifiée').length;

      const totalP = plans.length;
      const actifs = plans.filter(p => p.statut === 'Actif').length;
      const enAttenteP = plans.filter(p => p.statut === 'En attente').length;

      // Calculer les métriques de performance
      const tauxConformite = totalE > 0 ? Math.round((conformes / totalE) * 100) : 0;
      const delaiMoyen = 2.5; // Jours - à calculer à partir des données réelles
      const efficacite = totalA > 0 ? Math.round((terminees / totalA) * 100) : 0;

      // Générer des données de tendances simulées
      const echantillonsParMois = [
        { mois: 'Jan', valeur: 45 },
        { mois: 'Fév', valeur: 52 },
        { mois: 'Mar', valeur: 38 },
        { mois: 'Avr', valeur: 61 },
        { mois: 'Mai', valeur: 47 },
        { mois: 'Juin', valeur: 55 }
      ];

      const conformiteParType = [
        { type: 'Microbiologie', conformite: 92 },
        { type: 'Chimie', conformite: 88 },
        { type: 'Physique', conformite: 95 },
        { type: 'Sensorial', conformite: 90 }
      ];

      const analysesParCategorie = [
        { categorie: 'Contrôle qualité', nombre: 45 },
        { categorie: 'Recherche', nombre: 23 },
        { categorie: 'Développement', nombre: 18 },
        { categorie: 'Validation', nombre: 12 }
      ];

      // Générer des alertes intelligentes
      const alertes = [];
      if (tauxConformite < 85) {
        alertes.push({
          id: '1',
          type: 'warning' as const,
          message: `Taux de conformité faible (${tauxConformite}%)`,
          priorite: 'haute' as const,
          date: new Date().toISOString()
        });
      }
      if (enAttente > totalE * 0.3) {
        alertes.push({
          id: '2',
          type: 'error' as const,
          message: `${enAttente} échantillons en attente de traitement`,
          priorite: 'haute' as const,
          date: new Date().toISOString()
        });
      }
      if (efficacite > 90) {
        alertes.push({
          id: '3',
          type: 'success' as const,
          message: `Excellente efficacité des analyses (${efficacite}%)`,
          priorite: 'basse' as const,
          date: new Date().toISOString()
        });
      }

      // Générer des recommandations
      const recommandations = [];
      if (tauxConformite < 90) {
        recommandations.push({
          id: '1',
          titre: 'Améliorer la conformité',
          description: 'Mettre en place des contrôles supplémentaires',
          impact: 'eleve' as const,
          action: 'Réviser les procédures de contrôle'
        });
      }
      if (delaiMoyen > 3) {
        recommandations.push({
          id: '2',
          titre: 'Optimiser les délais',
          description: 'Réduire le temps de traitement des échantillons',
          impact: 'moyen' as const,
          action: 'Automatiser certains processus'
        });
      }

      setData({
        echantillons: {
          total: totalE,
          conformes,
          nonConformes,
          partiels,
          enAttente,
          evolution: 5.2
        },
        analyses: {
          total: totalA,
          terminees,
          enCours,
          planifiees,
          evolution: 3.8
        },
        plansControle: {
          total: totalP,
          actifs,
          enAttente: enAttenteP,
          evolution: 2.1
        },
        performance: {
          tauxConformite,
          delaiMoyen,
          efficacite
        },
        tendances: {
          echantillonsParMois,
          conformiteParType,
          analysesParCategorie
        },
        alertes,
        recommandations
      });
    };

    calculateStats();
    setLoading(false);
  }, [echantillons, analyses, plans]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'eleve': return 'text-red-600 bg-red-100';
      case 'moyen': return 'text-yellow-600 bg-yellow-100';
      case 'faible': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques Laboratoire</h2>
          <p className="text-gray-600 dark:text-gray-400">Analyse intelligente des performances</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="90j">90 derniers jours</option>
            <option value="1a">1 an</option>
          </select>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Échantillons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Microscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center space-x-1">
              {data.echantillons.evolution >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {data.echantillons.evolution}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.echantillons.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Échantillons</div>
            <div className="flex space-x-2 text-xs">
              <span className="text-green-600">{data.echantillons.conformes} conformes</span>
              <span className="text-red-600">{data.echantillons.nonConformes} non-conformes</span>
            </div>
          </div>
        </div>

        {/* Analyses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FlaskConical className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center space-x-1">
              {data.analyses.evolution >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {data.analyses.evolution}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.analyses.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Analyses</div>
            <div className="flex space-x-2 text-xs">
              <span className="text-green-600">{data.analyses.terminees} terminées</span>
              <span className="text-blue-600">{data.analyses.enCours} en cours</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Conformité
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.performance.tauxConformite}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Taux de conformité</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.performance.tauxConformite}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Efficacité */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Efficacité
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.performance.efficacite}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Taux d'efficacité</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Délai moyen: {data.performance.delaiMoyen} jours
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des échantillons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Évolution des échantillons</h3>
            <BarChart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {data.tendances.echantillonsParMois.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.mois}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.valeur / 70) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {item.valeur}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conformité par type */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conformité par type</h3>
            <PieChart className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-4">
            {data.tendances.conformiteParType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.type}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.conformite}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {item.conformite}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alertes</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="space-y-3">
            {data.alertes.length > 0 ? (
              data.alertes.map((alerte) => (
                <div key={alerte.id} className={`p-3 rounded-lg border ${getAlertColor(alerte.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alerte.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alerte.date).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alerte.priorite === 'haute' ? 'bg-red-100 text-red-800' :
                      alerte.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alerte.priorite}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune alerte</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommandations</h3>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {data.recommandations.length > 0 ? (
              data.recommandations.map((rec) => (
                <div key={rec.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{rec.titre}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(rec.impact)}`}>
                      {rec.impact}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{rec.action}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune recommandation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesLaboratoire;
