'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Calendar,
  Building,
  Globe,
  Shield
} from 'lucide-react'
import { configService } from '../../services/api'

interface Reglementation {
  nom: string;
  version: string;
  description: string;
  obligations: string[];
  type: 'environnement' | 'securite' | 'sante';
  applicable: boolean;
}

interface ModalReglementationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalReglementations({ isOpen, onClose }: ModalReglementationsProps) {
  const [reglementations, setReglementations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReglementations();
    }
  }, [isOpen]);

  const fetchReglementations = async () => {
    try {
      setLoading(true);
      const response = await configService.getReglementations();
      setReglementations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réglementations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'environnement':
        return <Globe className="w-5 h-5 text-green-600" />;
      case 'securite':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'sante':
        return <CheckCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'environnement':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'securite':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'sante':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Réglementations QHSE
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Côte d'Ivoire et normes internationales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reglementations ? (
            <div className="space-y-8">
              {/* Réglementations Côte d'Ivoire */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-orange-600" />
                  Réglementations Côte d'Ivoire
                </h3>
                
                <div className="space-y-6">
                  {/* Environnement */}
                  {reglementations.coteIvoire?.environnement?.map((reg: Reglementation, index: number) => (
                    <div key={index} className={`border rounded-lg p-4 ${getTypeColor('environnement')}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon('environnement')}
                          <div>
                            <h4 className="font-medium">{reg.nom}</h4>
                            <p className="text-sm opacity-75">Version {reg.version}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                          {reg.type}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{reg.description}</p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Obligations principales :</h5>
                        <ul className="text-sm space-y-1">
                          {reg.obligations.map((obligation, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {obligation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {/* Sécurité */}
                  {reglementations.coteIvoire?.securite?.map((reg: Reglementation, index: number) => (
                    <div key={index} className={`border rounded-lg p-4 ${getTypeColor('securite')}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon('securite')}
                          <div>
                            <h4 className="font-medium">{reg.nom}</h4>
                            <p className="text-sm opacity-75">Version {reg.version}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                          {reg.type}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{reg.description}</p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Obligations principales :</h5>
                        <ul className="text-sm space-y-1">
                          {reg.obligations.map((obligation, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {obligation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {/* Santé */}
                  {reglementations.coteIvoire?.sante?.map((reg: Reglementation, index: number) => (
                    <div key={index} className={`border rounded-lg p-4 ${getTypeColor('sante')}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon('sante')}
                          <div>
                            <h4 className="font-medium">{reg.nom}</h4>
                            <p className="text-sm opacity-75">Version {reg.version}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                          {reg.type}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{reg.description}</p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Obligations principales :</h5>
                        <ul className="text-sm space-y-1">
                          {reg.obligations.map((obligation, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {obligation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Normes Internationales */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Normes Internationales
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reglementations.internationales?.map((norme: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{norme.nom}</h4>
                        {norme.applicable && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Applicable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{norme.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations complémentaires */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Informations importantes
                    </h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Les réglementations locales de la Côte d'Ivoire sont prioritaires</li>
                      <li>• Les normes internationales complètent le cadre réglementaire</li>
                      <li>• La conformité doit être vérifiée régulièrement</li>
                      <li>• Les mises à jour réglementaires sont automatiquement intégrées</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Impossible de charger les réglementations
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}


