import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  BarChart3, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import DecisionQualiteWorkflow from '../components/DecisionQualiteWorkflow';

interface WorkflowItem {
  _id: string;
  echantillon: {
    numero: string;
    numeroLot: string;
    produit: string;
    typeEchantillon: string;
  };
  statut: string;
  dateCreation: string;
  decideur: string;
  priorite: 'Faible' | 'Normale' | 'Élevée' | 'Critique';
}

const DecisionQualite: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      // Simulation de données - à remplacer par des appels API réels
      const mockWorkflows: WorkflowItem[] = [
        {
          _id: '1',
          echantillon: {
            numero: 'ECH-2024-0001',
            numeroLot: 'LOT-2024-001',
            produit: 'Jus d\'ananas',
            typeEchantillon: 'Produit fini'
          },
          statut: 'En attente',
          dateCreation: '2024-01-15',
          decideur: 'Jean Dupont',
          priorite: 'Normale'
        },
        {
          _id: '2',
          echantillon: {
            numero: 'ECH-2024-0002',
            numeroLot: 'LOT-2024-002',
            produit: 'Purée de tomate',
            typeEchantillon: 'Produit fini'
          },
          statut: 'Validé',
          dateCreation: '2024-01-14',
          decideur: 'Marie Martin',
          priorite: 'Élevée'
        },
        {
          _id: '3',
          echantillon: {
            numero: 'ECH-2024-0003',
            numeroLot: 'LOT-2024-003',
            produit: 'Jus de mangue',
            typeEchantillon: 'Produit fini'
          },
          statut: 'Rejeté',
          dateCreation: '2024-01-13',
          decideur: 'Pierre Durand',
          priorite: 'Critique'
        }
      ];
      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Validé':
        return 'text-green-600 bg-green-100';
      case 'Rejeté':
        return 'text-red-600 bg-red-100';
      case 'En attente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Sous réserve':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'Critique':
        return 'text-red-600 bg-red-100';
      case 'Élevée':
        return 'text-orange-600 bg-orange-100';
      case 'Normale':
        return 'text-blue-600 bg-blue-100';
      case 'Faible':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.echantillon.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.echantillon.produit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = !filterStatut || workflow.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  if (selectedWorkflow) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedWorkflow(null)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow de Décision Qualité
          </h1>
        </div>
        <DecisionQualiteWorkflow />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Décision Qualité
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Workflow unifié de décision qualité intégrant Laboratoire, Qualité et HSE
            </p>
          </div>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouveau workflow</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro d'échantillon ou produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Tous les statuts</option>
          <option value="En attente">En attente</option>
          <option value="Validé">Validé</option>
          <option value="Rejeté">Rejeté</option>
          <option value="Sous réserve">Sous réserve</option>
        </select>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filtres</span>
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Exporter</span>
        </button>
        <button
          onClick={loadWorkflows}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Workflows List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Échantillon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Décideur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {workflow.echantillon.numero}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Lot: {workflow.echantillon.numeroLot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {workflow.echantillon.produit}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.echantillon.typeEchantillon}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(workflow.statut)}`}>
                        {workflow.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioriteColor(workflow.priorite)}`}>
                        {workflow.priorite}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {workflow.decideur}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(workflow.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedWorkflow(workflow._id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ouvrir le workflow"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.filter(w => w.statut === 'En attente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Validés</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.filter(w => w.statut === 'Validé').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">✕</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejetés</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.filter(w => w.statut === 'Rejeté').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionQualite;
