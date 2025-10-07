import React from 'react';
import { X, Calendar, User, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ModalViewDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'matiere' | 'controle' | 'nc' | 'audit' | 'conformite';
}

const ModalViewDetails: React.FC<ModalViewDetailsProps> = ({ isOpen, onClose, item, type }) => {
  if (!isOpen || !item) return null;

  const getTypeIcon = () => {
    switch (type) {
      case 'matiere':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'controle':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'nc':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'audit':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'conformite':
        return <CheckCircle className="h-5 w-5 text-indigo-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'matiere':
        return 'Matière Première';
      case 'controle':
        return 'Contrôle Qualité';
      case 'nc':
        return 'Non-Conformité';
      case 'audit':
        return 'Audit';
      case 'conformite':
        return 'Conformité';
      default:
        return 'Élément';
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Validé':
      case 'Actif':
      case 'Accepté':
        return 'text-green-600 bg-green-100';
      case 'Non conforme':
      case 'Rejeté':
      case 'Suspendu':
        return 'text-red-600 bg-red-100';
      case 'En attente':
      case 'Planifié':
      case 'Déclarée':
        return 'text-yellow-600 bg-yellow-100';
      case 'En cours':
      case 'En investigation':
        return 'text-blue-600 bg-blue-100';
      case 'Résolue':
      case 'Fermée':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderMatiereDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Numéro</label>
          <p className="text-sm text-gray-900">{item.numero}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Statut</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(item.statut)}`}>
            {item.statut}
          </span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-500">Nom</label>
        <p className="text-sm text-gray-900">{item.nom}</p>
      </div>
      
      {item.description && (
        <div>
          <label className="text-sm font-medium text-gray-500">Description</label>
          <p className="text-sm text-gray-900">{item.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Fournisseur</label>
          <p className="text-sm text-gray-900">{item.fournisseur?.nom || 'Non défini'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Type</label>
          <p className="text-sm text-gray-900">{item.caracteristiques?.type || 'Non défini'}</p>
        </div>
      </div>
      
      {item.stats && (
        <div>
          <label className="text-sm font-medium text-gray-500">Statistiques des lots</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500">Total: </span>
              <span className="text-sm font-medium">{item.stats.totalLots}</span>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <span className="text-xs text-gray-500">En stock: </span>
              <span className="text-sm font-medium text-green-600">{item.stats.enStock}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <span className="text-xs text-gray-500">Utilisés: </span>
              <span className="text-sm font-medium text-blue-600">{item.stats.utilises}</span>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <span className="text-xs text-gray-500">Rejetés: </span>
              <span className="text-sm font-medium text-red-600">{item.stats.rejetes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderControleDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Numéro</label>
          <p className="text-sm text-gray-900">{item.numero}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Statut</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(item.statut)}`}>
            {item.statut}
          </span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-500">Titre</label>
        <p className="text-sm text-gray-900">{item.titre}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Type</label>
          <p className="text-sm text-gray-900">{item.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Zone</label>
          <p className="text-sm text-gray-900">{item.localisation?.zone || 'Non définie'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Date de planification</label>
          <p className="text-sm text-gray-900">{formatDate(item.datePlanification)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Contrôleur</label>
          <p className="text-sm text-gray-900">
            {item.controleur?.prenom} {item.controleur?.nom}
          </p>
        </div>
      </div>
      
      {item.evaluation && (
        <div>
          <label className="text-sm font-medium text-gray-500">Évaluation</label>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(item.evaluation.statut)}`}>
              {item.evaluation.statut}
            </span>
            {item.evaluation.score && (
              <span className="ml-2 text-sm text-gray-600">
                ({item.evaluation.score}%)
              </span>
            )}
          </div>
        </div>
      )}
      
      {item.stats && (
        <div>
          <label className="text-sm font-medium text-gray-500">Progression</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500">Critères: </span>
              <span className="text-sm font-medium">{item.stats.totalCriteres}</span>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <span className="text-xs text-gray-500">Conformes: </span>
              <span className="text-sm font-medium text-green-600">{item.stats.criteresConformes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNCDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Numéro</label>
          <p className="text-sm text-gray-900">{item.numero}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Statut</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(item.statut)}`}>
            {item.statut}
          </span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-500">Titre</label>
        <p className="text-sm text-gray-900">{item.titre}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Type</label>
          <p className="text-sm text-gray-900">{item.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Gravité</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            item.gravite === 'Critique' ? 'text-red-600 bg-red-100' :
            item.gravite === 'Élevée' ? 'text-orange-600 bg-orange-100' :
            item.gravite === 'Modérée' ? 'text-yellow-600 bg-yellow-100' :
            'text-green-600 bg-green-100'
          }`}>
            {item.gravite}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Date de détection</label>
          <p className="text-sm text-gray-900">{formatDate(item.detection?.date)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Détecteur</label>
          <p className="text-sm text-gray-900">
            {item.detection?.detecteur?.prenom} {item.detection?.detecteur?.nom}
          </p>
        </div>
      </div>
      
      {item.stats && (
        <div>
          <label className="text-sm font-medium text-gray-500">Actions</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-500">Total: </span>
              <span className="text-sm font-medium">{item.stats.totalActionsCorrectives}</span>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <span className="text-xs text-gray-500">Terminées: </span>
              <span className="text-sm font-medium text-green-600">{item.stats.actionsTerminees}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <span className="text-xs text-gray-500">En cours: </span>
              <span className="text-sm font-medium text-blue-600">{item.stats.actionsEnCours}</span>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <span className="text-xs text-gray-500">Coût total: </span>
              <span className="text-sm font-medium text-red-600">{item.stats.coutTotal || 0}€</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    switch (type) {
      case 'matiere':
        return renderMatiereDetails();
      case 'controle':
        return renderControleDetails();
      case 'nc':
        return renderNCDetails();
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>Détails non disponibles pour ce type d'élément</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {getTypeIcon()}
            <h2 className="text-xl font-semibold text-gray-900">
              {getTypeLabel()} - {item.numero || item.titre}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {renderDetails()}
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalViewDetails;






