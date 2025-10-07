import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Microscope,
  Package,
  Droplets,
  FileText,
  BarChart3,
  Eye,
  Edit,
  Save,
  RefreshCw
} from 'lucide-react';

interface DecisionQualiteData {
  echantillon: {
    numero: string;
    numeroLot: string;
    produit: string;
    typeEchantillon: string;
    statut: string;
  };
  analyses: Array<{
    numero: string;
    nom: string;
    type: string;
    resultat: {
      valeur: number;
      unite: string;
      statut: string;
    };
  }>;
  controlesQualite: Array<{
    numero: string;
    type: string;
    evaluation: {
      statut: string;
      score: number;
    };
  }>;
  controlesHSE: Array<{
    numero: string;
    type: string;
    evaluation: {
      statut: string;
      score: number;
    };
  }>;
  decision: {
    statut: 'En attente' | 'Validé' | 'Rejeté' | 'Sous réserve';
    commentaire: string;
    decideur: string;
    dateDecision: string;
  };
}

const DecisionQualiteWorkflow: React.FC = () => {
  const [data, setData] = useState<DecisionQualiteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState({
    statut: 'En attente' as const,
    commentaire: ''
  });
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, name: 'Laboratoire', icon: Microscope, description: 'Analyses et résultats' },
    { id: 2, name: 'Qualité', icon: Package, description: 'Contrôles qualité' },
    { id: 3, name: 'HSE', icon: Droplets, description: 'Hygiène, sécurité, environnement' },
    { id: 4, name: 'Décision', icon: CheckCircle, description: 'Décision finale' }
  ];

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      // Simulation de données - à remplacer par des appels API réels
      const mockData: DecisionQualiteData = {
        echantillon: {
          numero: 'ECH-2024-0001',
          numeroLot: 'LOT-2024-001',
          produit: 'Jus d\'ananas',
          typeEchantillon: 'Produit fini',
          statut: 'Analysé'
        },
        analyses: [
          {
            numero: 'ANA-2024-0001',
            nom: 'pH',
            type: 'Physico-chimique',
            resultat: {
              valeur: 4.2,
              unite: 'pH',
              statut: 'Conforme'
            }
          },
          {
            numero: 'ANA-2024-0002',
            nom: 'Brix',
            type: 'Physico-chimique',
            resultat: {
              valeur: 12.5,
              unite: '°Brix',
              statut: 'Conforme'
            }
          },
          {
            numero: 'ANA-2024-0003',
            nom: 'Bactéries totales',
            type: 'Microbiologique',
            resultat: {
              valeur: 50,
              unite: 'CFU/ml',
              statut: 'Conforme'
            }
          }
        ],
        controlesQualite: [
          {
            numero: 'CQ-2024-0001',
            type: 'Contrôle produit fini',
            evaluation: {
              statut: 'Conforme',
              score: 95
            }
          }
        ],
        controlesHSE: [
          {
            numero: 'HYG-2024-0001',
            type: 'Nettoyage de ligne',
            evaluation: {
              statut: 'Conforme',
              score: 90
            }
          }
        ],
        decision: {
          statut: 'En attente',
          commentaire: '',
          decideur: '',
          dateDecision: ''
        }
      };
      setData(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Validé':
        return 'text-green-600 bg-green-100';
      case 'Non conforme':
      case 'Rejeté':
        return 'text-red-600 bg-red-100';
      case 'En attente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Validé':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Non conforme':
      case 'Rejeté':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'En attente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDecisionChange = (field: string, value: string) => {
    setDecision(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDecision = async () => {
    setLoading(true);
    try {
      // Simulation de sauvegarde - à remplacer par un appel API réel
      console.log('Décision sauvegardée:', decision);
      // Ici, vous feriez l'appel API pour sauvegarder la décision
      alert('Décision sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Workflow de Décision Qualité
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Échantillon: {data.echantillon.numero} - Lot: {data.echantillon.numeroLot}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadWorkflowData}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isActive 
                    ? 'bg-primary-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content based on active step */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeStep === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Résultats du Laboratoire
            </h3>
            <div className="space-y-4">
              {data.analyses.map((analyse) => (
                <div key={analyse.numero} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {analyse.nom} ({analyse.numero})
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {analyse.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(analyse.resultat.statut)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(analyse.resultat.statut)}`}>
                        {analyse.resultat.statut}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Résultat: {analyse.resultat.valeur} {analyse.resultat.unite}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contrôles Qualité
            </h3>
            <div className="space-y-4">
              {data.controlesQualite.map((controle) => (
                <div key={controle.numero} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {controle.numero}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {controle.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(controle.evaluation.statut)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(controle.evaluation.statut)}`}>
                        {controle.evaluation.statut}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({controle.evaluation.score}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contrôles HSE
            </h3>
            <div className="space-y-4">
              {data.controlesHSE.map((controle) => (
                <div key={controle.numero} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {controle.numero}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {controle.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(controle.evaluation.statut)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(controle.evaluation.statut)}`}>
                        {controle.evaluation.statut}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({controle.evaluation.score}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Décision Qualité
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut de la décision
                </label>
                <select
                  value={decision.statut}
                  onChange={(e) => handleDecisionChange('statut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="En attente">En attente</option>
                  <option value="Validé">Validé</option>
                  <option value="Rejeté">Rejeté</option>
                  <option value="Sous réserve">Sous réserve</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={decision.commentaire}
                  onChange={(e) => handleDecisionChange('commentaire', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ajouter un commentaire sur la décision..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleSaveDecision}
                  disabled={loading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder la décision</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
          disabled={activeStep === 4}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default DecisionQualiteWorkflow;
