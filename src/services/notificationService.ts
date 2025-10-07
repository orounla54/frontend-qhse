// Service pour gérer les notifications basées sur des données réelles
import { Notification } from '../components/common/NotificationSystem';
import { shouldUseMockData, getApiUrl } from '../config/api';

interface NotificationRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  notification: (data: any) => Notification;
  priority: 'low' | 'medium' | 'high' | 'critical';
  module: 'laboratoire' | 'qualite' | 'hse' | 'general';
}

class NotificationService {
  private rules: NotificationRule[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private callbacks: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.initializeRules();
  }

  private getApiUrl(): string {
    return getApiUrl();
  }

  // Données mockées pour les notifications
  private getMockData(): any {
    return {
      laboratoire: {
        echantillons: { total: 25, enAttente: 5, enCours: 8, termines: 12, conformes: 10, nonConformes: 2 },
        analyses: { total: 15, planifiees: 3, enCours: 4, terminees: 8 },
        plansControle: { total: 6, actifs: 4, enAttente: 2 }
      },
      qualite: {
        matieresPremieres: { total: 45, conformes: 40, nonConformes: 3, enAttente: 2 },
        controlesQualite: { total: 12, planifies: 2, enCours: 3, termines: 7 },
        nonConformites: { total: 8, critiques: 1, elevees: 2, moderees: 3, faibles: 2 },
        decisionsQualite: { total: 15, enAttente: 4, validees: 9, rejetees: 2 },
        audits: { total: 6, planifies: 1, enCours: 2, termines: 3 },
        conformite: { score: 85, evolution: 5 }
      },
      hse: {
        hygiene: { total: 20, conformes: 18, nonConformes: 1, enAttente: 1 },
        epi: { total: 50, enStock: 45, seuilAlerte: 5, manquants: 0 },
        produitsChimiques: { total: 30, enStock: 28, seuilAlerte: 2, manquants: 0 },
        incidents: { total: 5, critiques: 0, eleves: 1, moderes: 2, faibles: 2 },
        risques: { total: 12, tresEleves: 1, eleves: 2, moderes: 4, faibles: 5 },
        formations: { total: 18, planifiees: 3, enCours: 2, terminees: 13 }
      }
    };
  }

  // Initialiser les règles de notification
  private initializeRules() {
    this.rules = [
      // Règles Laboratoire
      {
        id: 'lab_echantillons_en_attente',
        name: 'Échantillons en attente',
        condition: (data) => data.laboratoire?.echantillons?.enAttente > 10,
        notification: (data) => ({
          id: `lab_attente_${Date.now()}`,
          type: 'warning',
          title: 'Échantillons en attente',
          message: `${data.laboratoire.echantillons.enAttente} échantillons en attente de traitement`,
          timestamp: new Date(),
          read: false,
          action: 'Voir les échantillons',
          link: 'laboratoire-echantillons'
        }),
        priority: 'medium',
        module: 'laboratoire'
      },
      {
        id: 'lab_taux_conformite_faible',
        name: 'Taux de conformité faible',
        condition: (data) => {
          const total = data.laboratoire?.echantillons?.total || 0;
          const conformes = data.laboratoire?.echantillons?.conformes || 0;
          return total > 0 && (conformes / total) < 0.8;
        },
        notification: (data) => {
          const total = data.laboratoire?.echantillons?.total || 0;
          const conformes = data.laboratoire?.echantillons?.conformes || 0;
          const taux = total > 0 ? Math.round((conformes / total) * 100) : 0;
          return {
            id: `lab_conformite_${Date.now()}`,
            type: 'error',
            title: 'Taux de conformité faible',
            message: `Le taux de conformité des échantillons est de ${taux}% (seuil: 80%)`,
            timestamp: new Date(),
            read: false,
            action: 'Voir les statistiques',
            link: 'laboratoire-statistiques'
          };
        },
        priority: 'high',
        module: 'laboratoire'
      },

      // Règles Qualité
      {
        id: 'qualite_nc_critiques',
        name: 'Non-conformités critiques',
        condition: (data) => data.qualite?.nonConformites?.critiques > 0,
        notification: (data) => ({
          id: `qualite_nc_${Date.now()}`,
          type: 'error',
          title: 'Non-conformités critiques',
          message: `${data.qualite.nonConformites.critiques} non-conformité(s) critique(s) détectée(s)`,
          timestamp: new Date(),
          read: false,
          action: 'Voir les NC',
          link: 'qualite-non-conformites'
        }),
        priority: 'critical',
        module: 'qualite'
      },
      {
        id: 'qualite_decisions_en_attente',
        name: 'Décisions qualité en attente',
        condition: (data) => data.qualite?.decisionsQualite?.enAttente > 5,
        notification: (data) => ({
          id: `qualite_decisions_${Date.now()}`,
          type: 'warning',
          title: 'Décisions en attente',
          message: `${data.qualite.decisionsQualite.enAttente} décisions qualité en attente`,
          timestamp: new Date(),
          read: false,
          action: 'Voir les décisions',
          link: 'qualite-decisions-qualite'
        }),
        priority: 'medium',
        module: 'qualite'
      },
      {
        id: 'qualite_score_conformite_faible',
        name: 'Score de conformité faible',
        condition: (data) => data.qualite?.conformite?.score < 85,
        notification: (data) => ({
          id: `qualite_score_${Date.now()}`,
          type: 'warning',
          title: 'Score de conformité faible',
          message: `Le score de conformité global est de ${data.qualite.conformite.score}% (objectif: 85%)`,
          timestamp: new Date(),
          read: false,
          action: 'Voir la conformité',
          link: 'qualite-conformite'
        }),
        priority: 'high',
        module: 'qualite'
      },

      // Règles HSE
      {
        id: 'hse_incidents_critiques',
        name: 'Incidents critiques',
        condition: (data) => data.hse?.incidents?.critiques > 0,
        notification: (data) => ({
          id: `hse_incident_${Date.now()}`,
          type: 'error',
          title: 'Incident critique',
          message: `${data.hse.incidents.critiques} incident(s) critique(s) signalé(s)`,
          timestamp: new Date(),
          read: false,
          action: 'Voir les incidents',
          link: 'hse-incidents'
        }),
        priority: 'critical',
        module: 'hse'
      },
      {
        id: 'hse_risques_eleves',
        name: 'Risques élevés',
        condition: (data) => data.hse?.risques?.tresEleves > 0,
        notification: (data) => ({
          id: `hse_risque_${Date.now()}`,
          type: 'warning',
          title: 'Risques très élevés',
          message: `${data.hse.risques.tresEleves} risque(s) très élevé(s) identifié(s)`,
          timestamp: new Date(),
          read: false,
          action: 'Voir les risques',
          link: 'hse-risques'
        }),
        priority: 'high',
        module: 'hse'
      },
      {
        id: 'hse_epi_manquants',
        name: 'EPI manquants',
        condition: (data) => data.hse?.epi?.manquants > 0,
        notification: (data) => ({
          id: `hse_epi_${Date.now()}`,
          type: 'warning',
          title: 'EPI manquants',
          message: `${data.hse.epi.manquants} équipement(s) de protection manquant(s)`,
          timestamp: new Date(),
          read: false,
          action: 'Voir les EPI',
          link: 'hse-epi'
        }),
        priority: 'medium',
        module: 'hse'
      },
      {
        id: 'hse_formations_en_retard',
        name: 'Formations en retard',
        condition: (data) => {
          const total = data.hse?.formations?.total || 0;
          const terminees = data.hse?.formations?.terminees || 0;
          return total > 0 && (terminees / total) < 0.7;
        },
        notification: (data) => {
          const total = data.hse?.formations?.total || 0;
          const terminees = data.hse?.formations?.terminees || 0;
          const taux = total > 0 ? Math.round((terminees / total) * 100) : 0;
          return {
            id: `hse_formations_${Date.now()}`,
            type: 'info',
            title: 'Formations en retard',
            message: `Taux de formation: ${taux}% (objectif: 70%)`,
            timestamp: new Date(),
            read: false,
            action: 'Voir les formations',
            link: 'hse-formations'
          };
        },
        priority: 'medium',
        module: 'hse'
      }
    ];
  }

  // Récupérer les données depuis l'API
  private async fetchData(): Promise<any> {
    // Utiliser des données mockées si l'API n'est pas disponible
    if (shouldUseMockData()) {
      console.log('🔄 Mode mock activé - utilisation des données mockées pour les notifications');
      return this.getMockData();
    }

    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${this.getApiUrl()}/api/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données pour les notifications:', error);
    }
    return null;
  }

  // Générer les notifications basées sur les règles
  private generateNotifications(data: any): Notification[] {
    const notifications: Notification[] = [];

    this.rules.forEach(rule => {
      try {
        if (rule.condition(data)) {
          const notification = rule.notification(data);
          // Vérifier si cette notification n'existe pas déjà
          const exists = notifications.some(n => 
            n.title === notification.title && 
            n.message === notification.message
          );
          if (!exists) {
            notifications.push(notification);
          }
        }
      } catch (error) {
        console.error(`Erreur dans la règle ${rule.id}:`, error);
      }
    });

    return notifications;
  }

  // Démarrer le polling des notifications
  public startPolling(intervalMs: number = 30000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      const data = await this.fetchData();
      if (data) {
        const notifications = this.generateNotifications(data);
        this.notifyCallbacks(notifications);
      }
    }, intervalMs);
  }

  // Arrêter le polling
  public stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // S'abonner aux notifications
  public subscribe(callback: (notifications: Notification[]) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  // Notifier les callbacks
  private notifyCallbacks(notifications: Notification[]) {
    this.callbacks.forEach(callback => callback(notifications));
  }

  // Récupérer les notifications actuelles
  public async getCurrentNotifications(): Promise<Notification[]> {
    const data = await this.fetchData();
    if (data) {
      return this.generateNotifications(data);
    }
    return [];
  }

  // Marquer une notification comme lue
  public async markAsRead(notificationId: string): Promise<void> {
    // Ici vous pouvez ajouter une logique pour persister l'état "lu"
    // Par exemple, envoyer une requête à l'API
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  }

  // Supprimer une notification
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  }

  // Ajouter une règle personnalisée
  public addRule(rule: NotificationRule) {
    this.rules.push(rule);
  }

  // Supprimer une règle
  public removeRule(ruleId: string) {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  // Obtenir les règles actives
  public getRules(): NotificationRule[] {
    return [...this.rules];
  }
}

export const notificationService = new NotificationService();
