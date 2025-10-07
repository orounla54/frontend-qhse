import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  FileText,
  Shield,
  Download,
  Filter,
  Calendar,
  Brain,
  Target,
  Zap,
  Lightbulb,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Eye,
  RefreshCw,
  Settings,
  Bell,
  Star,
  Award,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
  Info,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface StatistiquesQualiteProps {
  periode?: string;
}

interface KPI {
  nom: string;
  valeur: number;
  unite: string;
  evolution: number;
  couleur: string;
  icone: React.ComponentType<any>;
  prediction?: number;
  tendance?: 'up' | 'down' | 'stable';
  scoreIA?: number;
}

interface DonneesGraphique {
  nom: string;
  valeur: number;
  couleur?: string;
  prediction?: number;
  risque?: number;
}

interface RecommandationIA {
  id: string;
  type: 'preventif' | 'correctif' | 'optimisation' | 'alerte';
  titre: string;
  description: string;
  impact: 'faible' | 'modere' | 'eleve' | 'critique';
  priorite: number;
  action: string;
  delai: string;
  economie?: number;
  probabiliteSucces: number;
}

interface AlerteIntelligente {
  id: string;
  type: 'risque' | 'opportunite' | 'anomalie' | 'prediction';
  niveau: 'info' | 'warning' | 'error' | 'critical';
  titre: string;
  message: string;
  probabilite: number;
  impact: string;
  actionRecommandee: string;
  delai: string;
}

interface AnalysePredictive {
  periode: string;
  probabiliteNC: number;
  zonesRisque: string[];
  facteursInfluence: Array<{
    facteur: string;
    poids: number;
    impact: 'positif' | 'negatif';
  }>;
  recommandations: string[];
}

const StatistiquesQualite: React.FC<StatistiquesQualiteProps> = ({ periode = 'mois' }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [donneesConformite, setDonneesConformite] = useState<DonneesGraphique[]>([]);
  const [donneesNC, setDonneesNC] = useState<DonneesGraphique[]>([]);
  const [evolutionConformite, setEvolutionConformite] = useState<any[]>([]);
  const [topFournisseurs, setTopFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState(periode);
  
  // États pour l'IA et l'intelligence
  const [recommandationsIA, setRecommandationsIA] = useState<RecommandationIA[]>([]);
  const [alertesIntelligentes, setAlertesIntelligentes] = useState<AlerteIntelligente[]>([]);
  const [analysePredictive, setAnalysePredictive] = useState<AnalysePredictive | null>(null);
  const [modeIA, setModeIA] = useState<'actif' | 'inactif'>('actif');
  const [donneesRadar, setDonneesRadar] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [performancePredictive, setPerformancePredictive] = useState<any[]>([]);
  const [insightsIA, setInsightsIA] = useState<string[]>([]);

  const couleurs = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    chargerDonnees();
  }, [filtrePeriode]);

  const chargerDonnees = async () => {
    setLoading(true);
    
    // Utiliser les données de démonstration par défaut pour éviter les erreurs
    genererDonneesDemo();
    
    // Construire les KPIs intelligents avec prédictions
    const nouveauxKpis: KPI[] = [
      {
        nom: 'Taux de conformité',
        valeur: 87,
        unite: '%',
        evolution: 5.2,
        couleur: 'text-green-600',
        icone: CheckCircle,
        prediction: 89,
        tendance: 'up',
        scoreIA: 87
      },
      {
        nom: 'Non-conformités ouvertes',
        valeur: 12,
        unite: '',
        evolution: -12.3,
        couleur: 'text-red-600',
        icone: AlertTriangle,
        prediction: 8,
        tendance: 'down',
        scoreIA: 92
      },
      {
        nom: 'Matières premières actives',
        valeur: 45,
        unite: '',
        evolution: 2.1,
        couleur: 'text-blue-600',
        icone: Package,
        prediction: 47,
        tendance: 'stable',
        scoreIA: 78
      },
      {
        nom: 'Taux de résolution NC',
        valeur: 92,
        unite: '%',
        evolution: 8.7,
        couleur: 'text-purple-600',
        icone: Clock,
        prediction: 94,
        tendance: 'up',
        scoreIA: 85
      }
    ];

    setKpis(nouveauxKpis);
    setLoading(false);
  };

  const genererDonneesDemo = () => {
    // Générer des données de démonstration pour l'IA
    const recommandationsDemo: RecommandationIA[] = [
      {
        id: '1',
        type: 'preventif',
        titre: 'Optimisation des contrôles qualité',
        description: 'L\'IA détecte une corrélation entre la température et les non-conformités. Recommande d\'ajuster les seuils de contrôle.',
        impact: 'eleve',
        priorite: 9,
        action: 'Ajuster les paramètres de contrôle température',
        delai: '7 jours',
        economie: 15000,
        probabiliteSucces: 87
      },
      {
        id: '2',
        type: 'correctif',
        titre: 'Formation équipe production',
        description: 'Augmentation des NC liées aux erreurs humaines. Formation ciblée recommandée.',
        impact: 'modere',
        priorite: 7,
        action: 'Programmer formation sécurité qualité',
        delai: '14 jours',
        economie: 8000,
        probabiliteSucces: 92
      }
    ];

    const alertesDemo: AlerteIntelligente[] = [
      {
        id: '1',
        type: 'risque',
        niveau: 'warning',
        titre: 'Risque de non-conformité détecté',
        message: 'L\'IA prédit une augmentation de 23% des NC dans la zone Production A dans les 15 prochains jours.',
        probabilite: 78,
        impact: 'Modéré',
        actionRecommandee: 'Renforcer les contrôles préventifs',
        delai: '5 jours'
      },
      {
        id: '2',
        type: 'opportunite',
        niveau: 'info',
        titre: 'Optimisation possible détectée',
        message: 'Réduction potentielle de 12% des coûts qualité en optimisant les fréquences de contrôle.',
        probabilite: 85,
        impact: 'Élevé',
        actionRecommandee: 'Analyser les fréquences optimales',
        delai: '10 jours'
      }
    ];

    const analyseDemo: AnalysePredictive = {
      periode: '30 prochains jours',
      probabiliteNC: 23,
      zonesRisque: ['Production A', 'Stockage B'],
      facteursInfluence: [
        { facteur: 'Température', poids: 0.35, impact: 'negatif' },
        { facteur: 'Humidité', poids: 0.28, impact: 'negatif' },
        { facteur: 'Formation équipe', poids: 0.22, impact: 'positif' },
        { facteur: 'Maintenance équipements', poids: 0.15, impact: 'positif' }
      ],
      recommandations: [
        'Maintenir température < 22°C',
        'Contrôler humidité < 60%',
        'Programmer formation équipe',
        'Planifier maintenance préventive'
      ]
    };

    // Données sûres pour éviter les erreurs NaN
    setRecommandationsIA(recommandationsDemo);
    setAlertesIntelligentes(alertesDemo);
    setAnalysePredictive(analyseDemo);
    setDonneesRadar([
      { sujet: 'Conformité', A: 85, B: 90, fullMark: 100 },
      { sujet: 'Efficacité', A: 78, B: 82, fullMark: 100 },
      { sujet: 'Sécurité', A: 92, B: 88, fullMark: 100 },
      { sujet: 'Coûts', A: 75, B: 80, fullMark: 100 },
      { sujet: 'Formation', A: 68, B: 72, fullMark: 100 }
    ]);
    setCorrelations([
      { facteur: 'Température', correlation: -0.73, impact: 'Fort' },
      { facteur: 'Humidité', correlation: -0.58, impact: 'Modéré' },
      { facteur: 'Formation', correlation: 0.65, impact: 'Fort' },
      { facteur: 'Maintenance', correlation: 0.52, impact: 'Modéré' }
    ]);
    setPerformancePredictive([
      { mois: 'Jan', reel: 85, predit: 87 },
      { mois: 'Fév', reel: 88, predit: 89 },
      { mois: 'Mar', reel: 82, predit: 84 },
      { mois: 'Avr', reel: 90, predit: 88 },
      { mois: 'Mai', reel: 87, predit: 91 },
      { mois: 'Juin', reel: 93, predit: 89 }
    ]);
    setInsightsIA([
      'Les contrôles en fin de semaine montrent 15% plus de NC',
      'La température optimale pour la conformité est 20-22°C',
      'Les équipes formées ont 40% moins de NC',
      'Les contrôles préventifs réduisent les coûts de 25%'
    ]);

    // Données de base sûres pour éviter les erreurs
    setDonneesConformite([
      { nom: 'Conformes', valeur: 75, couleur: '#10B981', prediction: 78 },
      { nom: 'Non conformes', valeur: 25, couleur: '#EF4444', prediction: 22 }
    ]);
    setDonneesNC([
      { nom: 'Critique', valeur: 5, couleur: '#EF4444', risque: 0.9 },
      { nom: 'Majeure', valeur: 12, couleur: '#F59E0B', risque: 0.7 },
      { nom: 'Mineure', valeur: 8, couleur: '#3B82F6', risque: 0.3 }
    ]);
    setEvolutionConformite([
      { mois: '01/2024', taux: 85, total: 100, prediction: 87 },
      { mois: '02/2024', taux: 88, total: 105, prediction: 89 },
      { mois: '03/2024', taux: 82, total: 98, prediction: 84 },
      { mois: '04/2024', taux: 90, total: 110, prediction: 88 }
    ]);
    setTopFournisseurs([
      { nom: 'Production A', nc: 15, couleur: '#EF4444' },
      { nom: 'Stockage B', nc: 8, couleur: '#F59E0B' },
      { nom: 'Zone C', nc: 5, couleur: '#3B82F6' }
    ]);
  };

  const exporterRapport = () => {
    // Logique d'export (Excel/PDF)
    console.log('Export du rapport...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête intelligent avec IA */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Intelligence Qualité IA
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Analyses prédictives et recommandations automatiques
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${modeIA === 'actif' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              IA {modeIA === 'actif' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <select
            value={filtrePeriode}
            onChange={(e) => setFiltrePeriode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          <button
            onClick={() => setModeIA(modeIA === 'actif' ? 'inactif' : 'actif')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              modeIA === 'actif' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {modeIA === 'actif' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{modeIA === 'actif' ? 'Désactiver IA' : 'Activer IA'}</span>
          </button>
          <button
            onClick={exporterRapport}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Alertes intelligentes en temps réel */}
      {alertesIntelligentes.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alertes Intelligentes
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">En temps réel</span>
            </div>
          </div>
          <div className="space-y-3">
            {alertesIntelligentes.map((alerte) => (
              <div key={alerte.id} className={`p-4 rounded-lg border-l-4 ${
                alerte.niveau === 'critical' ? 'bg-red-50 border-red-500 dark:bg-red-900/20' :
                alerte.niveau === 'error' ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' :
                alerte.niveau === 'warning' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20' :
                'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{alerte.titre}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alerte.niveau === 'critical' ? 'bg-red-100 text-red-800' :
                        alerte.niveau === 'error' ? 'bg-orange-100 text-orange-800' :
                        alerte.niveau === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alerte.niveau.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alerte.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Probabilité: {alerte.probabilite}%</span>
                      <span>Impact: {alerte.impact}</span>
                      <span>Délai: {alerte.delai}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                    {alerte.actionRecommandee}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs intelligents avec prédictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icone;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative overflow-hidden">
              {/* Indicateur IA */}
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">{kpi.scoreIA}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.nom}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.valeur}{kpi.unite}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${kpi.couleur}`} />
              </div>
              
              {/* Prédiction IA */}
              {kpi.prediction && (
                <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-700 dark:text-purple-300">Prédiction IA:</span>
                    <span className="font-medium text-purple-800 dark:text-purple-200">
                      {kpi.prediction}{kpi.unite}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {kpi.tendance === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : kpi.tendance === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-500" />
                  )}
                  <span className={`ml-2 text-sm ${
                    kpi.evolution > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(kpi.evolution)}% vs période précédente
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{kpi.tendance}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommandations IA */}
      {recommandationsIA.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recommandations IA
            </h3>
            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
              {recommandationsIA.length} recommandations
            </div>
          </div>
          
          <div className="space-y-4">
            {recommandationsIA.map((recommandation) => (
              <div key={recommandation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{recommandation.titre}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        recommandation.impact === 'critique' ? 'bg-red-100 text-red-800' :
                        recommandation.impact === 'eleve' ? 'bg-orange-100 text-orange-800' :
                        recommandation.impact === 'modere' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {recommandation.impact.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">Priorité: {recommandation.priorite}/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{recommandation.description}</p>
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span>Action: {recommandation.action}</span>
                      <span>Délai: {recommandation.delai}</span>
                      {recommandation.economie && <span>Économie: {recommandation.economie.toLocaleString()}€</span>}
                      <span>Succès: {recommandation.probabiliteSucces}%</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Appliquer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyses prédictives */}
      {analysePredictive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analyse prédictive */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analyse Prédictive
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Probabilité NC ({analysePredictive.periode})
                  </span>
                  <span className="text-lg font-bold text-red-900 dark:text-red-100">
                    {analysePredictive.probabiliteNC}%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Zones à risque:</h4>
                <div className="space-y-1">
                  {analysePredictive.zonesRisque.map((zone, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>{zone}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Facteurs d'influence:</h4>
                <div className="space-y-2">
                  {analysePredictive.facteursInfluence.map((facteur, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{facteur.facteur}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              facteur.impact === 'positif' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${facteur.poids * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(facteur.poids * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Graphique radar des performances */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Performance Multi-dimensionnelle
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={donneesRadar.filter(d => d && typeof d.A === 'number' && typeof d.B === 'number')}>
                <PolarGrid />
                <PolarAngleAxis dataKey="sujet" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Actuel"
                  dataKey="A"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Objectif"
                  dataKey="B"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Graphiques intelligents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution avec prédictions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <LineChartIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Évolution Prédictive
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performancePredictive.filter(d => d && typeof d.reel === 'number' && typeof d.predit === 'number')}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="reel"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Réel"
              />
              <Line
                type="monotone"
                dataKey="predit"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Prédiction IA"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Corrélations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Corrélations Facteurs
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={correlations.filter(d => d && typeof d.correlation === 'number')} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[-1, 1]} />
              <YAxis dataKey="facteur" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="correlation" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights IA */}
      {insightsIA.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Insights IA
            </h3>
            <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              Découvertes automatiques
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insightsIA.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphiques traditionnels améliorés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des contrôles avec prédictions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <PieChartIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Répartition Intelligente
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donneesConformite.filter(d => d && typeof d.valeur === 'number' && d.valeur > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valeur"
              >
                {donneesConformite.filter(d => d && typeof d.valeur === 'number' && d.valeur > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.couleur} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Non-conformités par gravité avec risques */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risques par Gravité
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donneesNC.filter(d => d && typeof d.valeur === 'number' && d.valeur >= 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" />
              <YAxis domain={[0, 'dataMax + 5']} />
              <Tooltip />
              <Bar dataKey="valeur" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesQualite;
