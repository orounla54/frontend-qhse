import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';

interface Statistiques {
  generales: {
    hygiene: number;
    epi: number;
    produitsChimiques: number;
    incidents: number;
    risques: number;
    formations: number;
  };
  incidents: {
    parGravite: Array<{ _id: string; count: number }>;
    evolution: Array<{ _id: { year: number; month: number }; count: number }>;
    topZones: Array<{ _id: string; count: number }>;
  };
  risques: {
    parNiveau: Array<{ _id: string; count: number }>;
  };
  formations: {
    parStatut: Array<{ _id: string; count: number }>;
  };
  epi: {
    parStatut: Array<{ _id: string; count: number }>;
  };
}

interface ModalStatistiquesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalStatistiques({ isOpen, onClose }: ModalStatistiquesProps) {
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Charger les statistiques
  const loadStatistiques = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const params = new URLSearchParams();
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);
      
      const response = await fetch(`/api/hse/statistiques?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatistiques(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatistiques();
    }
  }, [isOpen, dateDebut, dateFin]);

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'Critique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Grave': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Modérée': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Légère': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getNiveauRisqueColor = (niveau: string) => {
    switch (niveau) {
      case 'Critique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Élevé': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Modéré': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Faible': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Terminé': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'En cours': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Planifié': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Annulé': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Statistiques QHSE"
      size="4xl"
    >
      <div className="space-y-6">
        {/* Filtres de date */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : statistiques ? (
          <>
            {/* Statistiques générales */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hygiène</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales.hygiene}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">EPI</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales.epi}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales.produitsChimiques}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Incidents</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales.incidents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risques</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales.risques}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Formations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales.formations}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails par catégorie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incidents par gravité */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Incidents par gravité
                </h3>
                <div className="space-y-3">
                  {statistiques.incidents.parGravite.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGraviteColor(item._id)}`}>
                        {item._id}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risques par niveau */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Risques par niveau
                </h3>
                <div className="space-y-3">
                  {statistiques.risques.parNiveau.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNiveauRisqueColor(item._id)}`}>
                        {item._id}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formations par statut */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Formations par statut
                </h3>
                <div className="space-y-3">
                  {statistiques.formations.parStatut.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(item._id)}`}>
                        {item._id}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top zones incidents */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Top zones incidents
                </h3>
                <div className="space-y-3">
                  {statistiques.incidents.topZones.map((item, index) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}. {item._id || 'Non spécifié'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          </div>
        )}

        {/* Bouton fermer */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}