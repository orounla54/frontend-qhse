'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Database, 
  Save, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Key,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { configService } from '../services/api'
import ModalReglementations from '../components/features/ModalReglementations'

// Interfaces TypeScript
interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  permissions: string[];
  statut: string;
  derniereConnexion: string;
}

interface Config {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    rappels: boolean;
    destinataires: string[];
  };
  securite: {
    motDePasseMin: number;
    expirationSession: number;
    tentativesConnexion: number;
    authentificationDouble: boolean;
    ipWhitelist: string[];
    sessionTimeout: number;
  };
  systeme: {
    langue: string;
    fuseauHoraire: string;
    formatDate: string;
    formatHeure: string;
    sauvegardeAuto: boolean;
    version: string;
    maintenance: boolean;
  };
  qhse: {
    seuilsAlertes: {
      incidents: number;
      risques: number;
      audits: number;
      formations: number;
    };
    rapports: {
      format: string;
      signature: boolean;
      logo: boolean;
      entete: string;
      piedPage: string;
    };
    conformite: {
      normeISO14001: boolean;
      normeOHSAS18001: boolean;
      normeISO45001: boolean;
      reglementationLocale: boolean;
    };
  };
  localisation: {
    pays: string;
    region: string;
    devise: string;
    telephone: string;
    adresse: string;
  };
  exports: {
    defaultFormat: string;
    autoGenerate: boolean;
    formatsDisponibles: string[];
    compression: boolean;
  };
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [config, setConfig] = useState<Config | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showReglementations, setShowReglementations] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Charger la configuration depuis l'API
      const configResponse = await configService.getConfig()
      setConfig(configResponse.data)

      // Simulation des utilisateurs (à remplacer par une vraie API)
      const mockUsers: User[] = [
        {
          _id: '1',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@entreprise.com',
          role: 'Administrateur QHSE',
          permissions: ['lecture', 'ecriture', 'suppression', 'administration'],
          statut: 'Actif',
          derniereConnexion: '2024-12-15T10:30:00Z'
        },
        {
          _id: '2',
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@entreprise.com',
          role: 'Auditeur',
          permissions: ['lecture', 'ecriture'],
          statut: 'Actif',
          derniereConnexion: '2024-12-14T16:45:00Z'
        }
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      
      // En cas d'erreur, utiliser des données par défaut
      const defaultConfig: Config = {
        notifications: {
          email: true,
          sms: false,
          push: true,
          rappels: true,
          destinataires: ['admin@entreprise.ci', 'qhse@entreprise.ci']
        },
        securite: {
          motDePasseMin: 8,
          expirationSession: 24,
          tentativesConnexion: 3,
          authentificationDouble: false,
          ipWhitelist: [],
          sessionTimeout: 30
        },
        systeme: {
          langue: 'fr',
          fuseauHoraire: 'Africa/Abidjan',
          formatDate: 'DD/MM/YYYY',
          formatHeure: 'HH:mm',
          sauvegardeAuto: true,
          version: '1.0.0',
          maintenance: false
        },
        qhse: {
          seuilsAlertes: {
            incidents: 5,
            risques: 3,
            audits: 2,
            formations: 7
          },
          rapports: {
            format: 'PDF',
            signature: true,
            logo: true,
            entete: 'Entreprise QHSE - Côte d\'Ivoire',
            piedPage: 'Rapport généré automatiquement'
          },
          conformite: {
            normeISO14001: true,
            normeOHSAS18001: true,
            normeISO45001: true,
            reglementationLocale: true
          }
        },
        localisation: {
          pays: 'Côte d\'Ivoire',
          region: 'Abidjan',
          devise: 'XOF',
          telephone: '+225',
          adresse: 'Abidjan, Côte d\'Ivoire'
        },
        exports: {
          defaultFormat: 'pdf',
          autoGenerate: false,
          formatsDisponibles: ['PDF', 'Excel', 'Word'],
          compression: true
        }
      }
      
      setConfig(defaultConfig)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!config) return
    
    try {
      setSaving(true)
      
      // Sauvegarder chaque section de configuration
      const sections = ['notifications', 'securite', 'systeme', 'qhse', 'localisation', 'exports']
      
      for (const section of sections) {
        if (config[section as keyof Config]) {
          await configService.updateConfig(section, config[section as keyof Config])
        }
      }
      
      console.log('Configuration sauvegardée avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportConfig = async () => {
    try {
      const response = await configService.exportConfig('json')
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `config-qhse-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    }
  }

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const configData = JSON.parse(text)
      await configService.importConfig(configData)
      // Recharger la configuration
      await fetchData()
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur QHSE': return 'text-red-600 bg-red-50'
      case 'Auditeur': return 'text-blue-600 bg-blue-50'
      case 'Responsable': return 'text-green-600 bg-green-50'
      case 'Utilisateur': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Actif': return 'text-green-600 bg-green-50'
      case 'Inactif': return 'text-red-600 bg-red-50'
      case 'En attente': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Configuration QHSE
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paramètres et configuration du module
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation des onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', name: 'Général', icon: Settings },
                { id: 'utilisateurs', name: 'Utilisateurs', icon: Users },
                { id: 'securite', name: 'Sécurité', icon: Shield },
                { id: 'notifications', name: 'Notifications', icon: Bell },
                { id: 'systeme', name: 'Système', icon: Database },
                { id: 'localisation', name: 'Localisation', icon: MapPin },
                { id: 'reglementations', name: 'Réglementations', icon: FileText },
                { id: 'exports', name: 'Exports', icon: Download }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {activeTab === 'general' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Configuration Générale
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Paramètres QHSE */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Paramètres QHSE
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seuil d'alerte - Incidents
                      </label>
                      <input
                        type="number"
                        value={config?.qhse?.seuilsAlertes?.incidents || 5}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            seuilsAlertes: {
                              ...config!.qhse.seuilsAlertes,
                              incidents: parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seuil d'alerte - Risques
                      </label>
                      <input
                        type="number"
                        value={config?.qhse?.seuilsAlertes?.risques || 3}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            seuilsAlertes: {
                              ...config!.qhse.seuilsAlertes,
                              risques: parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Paramètres des rapports */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Paramètres des Rapports
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Format des rapports
                      </label>
                      <select
                        value={config?.qhse?.rapports?.format || 'PDF'}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            rapports: {
                              ...config!.qhse.rapports,
                              format: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Word">Word</option>
                        <option value="Excel">Excel</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="signature"
                        checked={config?.qhse?.rapports?.signature || false}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            rapports: {
                              ...config!.qhse.rapports,
                              signature: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="signature" className="text-sm text-gray-700 dark:text-gray-300">
                        Inclure la signature
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="logo"
                        checked={config?.qhse?.rapports?.logo || false}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            rapports: {
                              ...config!.qhse.rapports,
                              logo: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="logo" className="text-sm text-gray-700 dark:text-gray-300">
                        Inclure le logo
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'utilisateurs' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Gestion des Utilisateurs
                </h3>
                <button className="inline-flex items-center px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Dernière Connexion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.prenom} {user.nom}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(user.statut)}`}>
                            {user.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.derniereConnexion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-teal-600 hover:text-teal-900 dark:hover:text-teal-400">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'securite' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Paramètres de Sécurité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Longueur minimale du mot de passe
                    </label>
                    <input
                      type="number"
                        value={config?.securite?.motDePasseMin || 8}
                      onChange={(e) => setConfig({
                        ...config!,
                        securite: {
                          ...config!.securite,
                          motDePasseMin: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiration de session (heures)
                    </label>
                    <input
                      type="number"
                        value={config?.securite?.expirationSession || 24}
                      onChange={(e) => setConfig({
                        ...config!,
                        securite: {
                          ...config!.securite,
                          expirationSession: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de tentatives de connexion
                    </label>
                    <input
                      type="number"
                        value={config?.securite?.tentativesConnexion || 3}
                      onChange={(e) => setConfig({
                        ...config!,
                        securite: {
                          ...config!.securite,
                          tentativesConnexion: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="authDouble"
                        checked={config?.securite?.authentificationDouble || false}
                      onChange={(e) => setConfig({
                        ...config!,
                        securite: {
                          ...config!.securite,
                          authentificationDouble: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="authDouble" className="text-sm text-gray-700 dark:text-gray-300">
                      Authentification à deux facteurs
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Paramètres des Notifications
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Canaux de notification
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="email"
                          checked={config?.notifications?.email || false}
                          onChange={(e) => setConfig({
                            ...config!,
                            notifications: {
                              ...config!.notifications,
                              email: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">
                          Notifications par email
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="sms"
                          checked={config?.notifications?.sms || false}
                          onChange={(e) => setConfig({
                            ...config!,
                            notifications: {
                              ...config!.notifications,
                              sms: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms" className="text-sm text-gray-700 dark:text-gray-300">
                          Notifications par SMS
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="push"
                          checked={config?.notifications?.push || false}
                          onChange={(e) => setConfig({
                            ...config!,
                            notifications: {
                              ...config!.notifications,
                              push: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="push" className="text-sm text-gray-700 dark:text-gray-300">
                          Notifications push
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Types de notifications
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="rappels"
                          checked={config?.notifications?.rappels || false}
                          onChange={(e) => setConfig({
                            ...config!,
                            notifications: {
                              ...config!.notifications,
                              rappels: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="rappels" className="text-sm text-gray-700 dark:text-gray-300">
                          Rappels automatiques
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'systeme' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Paramètres Système
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                        value={config?.systeme?.langue || 'fr'}
                      onChange={(e) => setConfig({
                        ...config!,
                        systeme: {
                          ...config!.systeme,
                          langue: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuseau horaire
                    </label>
                    <select
                        value={config?.systeme?.fuseauHoraire || 'Africa/Abidjan'}
                      onChange={(e) => setConfig({
                        ...config!,
                        systeme: {
                          ...config!.systeme,
                          fuseauHoraire: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format de date
                    </label>
                    <select
                        value={config?.systeme?.formatDate || 'DD/MM/YYYY'}
                      onChange={(e) => setConfig({
                        ...config!,
                        systeme: {
                          ...config!.systeme,
                          formatDate: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sauvegarde"
                        checked={config?.systeme?.sauvegardeAuto || false}
                      onChange={(e) => setConfig({
                        ...config!,
                        systeme: {
                          ...config!.systeme,
                          sauvegardeAuto: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sauvegarde" className="text-sm text-gray-700 dark:text-gray-300">
                      Sauvegarde automatique
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localisation' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Paramètres de Localisation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                        value={config?.localisation?.pays || 'Côte d\'Ivoire'}
                      onChange={(e) => setConfig({
                        ...config!,
                        localisation: {
                          ...config!.localisation,
                          pays: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Région/Ville
                    </label>
                    <input
                      type="text"
                        value={config?.localisation?.region || 'Abidjan'}
                      onChange={(e) => setConfig({
                        ...config!,
                        localisation: {
                          ...config!.localisation,
                          region: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise
                    </label>
                    <select
                        value={config?.localisation?.devise || 'XOF'}
                      onChange={(e) => setConfig({
                        ...config!,
                        localisation: {
                          ...config!.localisation,
                          devise: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="XOF">XOF - Franc CFA</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Indicatif téléphonique
                    </label>
                    <input
                      type="text"
                        value={config?.localisation?.telephone || '+225'}
                      onChange={(e) => setConfig({
                        ...config!,
                        localisation: {
                          ...config!.localisation,
                          telephone: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse complète
                    </label>
                    <textarea
                        value={config?.localisation?.adresse || 'Abidjan, Côte d\'Ivoire'}
                      onChange={(e) => setConfig({
                        ...config!,
                        localisation: {
                          ...config!.localisation,
                          adresse: e.target.value
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reglementations' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Réglementations QHSE
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Normes Internationales
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="iso14001"
                        checked={config?.qhse?.conformite?.normeISO14001 || false}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            conformite: {
                              ...config!.qhse.conformite,
                              normeISO14001: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="iso14001" className="text-sm text-gray-700 dark:text-gray-300">
                        ISO 14001:2015 - Management environnemental
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="iso45001"
                        checked={config?.qhse?.conformite?.normeISO45001 || false}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            conformite: {
                              ...config!.qhse.conformite,
                              normeISO45001: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="iso45001" className="text-sm text-gray-700 dark:text-gray-300">
                        ISO 45001:2018 - Santé et sécurité au travail
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ohsas18001"
                        checked={config?.qhse?.conformite?.normeOHSAS18001 || false}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            conformite: {
                              ...config!.qhse.conformite,
                              normeOHSAS18001: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="ohsas18001" className="text-sm text-gray-700 dark:text-gray-300">
                        OHSAS 18001:2007 - Système de management SST
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="reglementationLocale"
                        checked={config?.qhse?.conformite?.reglementationLocale || false}
                        onChange={(e) => setConfig({
                          ...config!,
                          qhse: {
                            ...config!.qhse,
                            conformite: {
                              ...config!.qhse.conformite,
                              reglementationLocale: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="reglementationLocale" className="text-sm text-gray-700 dark:text-gray-300">
                        Réglementation locale Côte d'Ivoire
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Organismes de contrôle en Côte d'Ivoire
                    </h5>
                    <button
                      onClick={() => setShowReglementations(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                    >
                      Voir détails
                    </button>
                  </div>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Ministère de l'Environnement et du Développement Durable</li>
                    <li>• Ministère de l'Emploi et de la Protection Sociale</li>
                    <li>• Agence Nationale de l'Environnement (ANDE)</li>
                    <li>• Caisse Nationale de Prévoyance Sociale (CNPS)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Paramètres d'Export
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format par défaut
                    </label>
                    <select
                        value={config?.exports?.defaultFormat || 'pdf'}
                      onChange={(e) => setConfig({
                        ...config!,
                        exports: {
                          ...config!.exports,
                          defaultFormat: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="word">Word</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoGenerate"
                        checked={config?.exports?.autoGenerate || false}
                      onChange={(e) => setConfig({
                        ...config!,
                        exports: {
                          ...config!.exports,
                          autoGenerate: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoGenerate" className="text-sm text-gray-700 dark:text-gray-300">
                      Génération automatique des rapports
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="compression"
                        checked={config?.exports?.compression || false}
                      onChange={(e) => setConfig({
                        ...config!,
                        exports: {
                          ...config!.exports,
                          compression: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="compression" className="text-sm text-gray-700 dark:text-gray-300">
                      Compression des fichiers
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formats disponibles
                    </label>
                    <div className="space-y-2">
                      {(config?.exports?.formatsDisponibles || ['PDF', 'Excel', 'Word']).map((format) => (
                        <div key={format} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`format-${format}`}
                            defaultChecked
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`format-${format}`} className="text-sm text-gray-700 dark:text-gray-300">
                            {format}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button 
                    onClick={handleExportConfig}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter la configuration
                  </button>
                  <label className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer une configuration
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportConfig}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal des réglementations */}
      <ModalReglementations
        isOpen={showReglementations}
        onClose={() => setShowReglementations(false)}
      />
    </div>
  )
} 