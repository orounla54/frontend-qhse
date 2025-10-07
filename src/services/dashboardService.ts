// Service pour récupérer les données réelles du dashboard

export interface DashboardData {
  laboratoire: {
    echantillons: {
      total: number;
      enAttente: number;
      enCours: number;
      termines: number;
      conformes: number;
      nonConformes: number;
    };
    analyses: {
      total: number;
      planifiees: number;
      enCours: number;
      terminees: number;
    };
    plansControle: {
      total: number;
      actifs: number;
      enAttente: number;
    };
  };
  qualite: {
    matieresPremieres: {
      total: number;
      conformes: number;
      nonConformes: number;
      enAttente: number;
    };
    controlesQualite: {
      total: number;
      planifies: number;
      enCours: number;
      termines: number;
    };
    nonConformites: {
      total: number;
      critiques: number;
      elevees: number;
      moderees: number;
      faibles: number;
    };
    decisionsQualite: {
      total: number;
      enAttente: number;
      validees: number;
      rejetees: number;
    };
    audits: {
      total: number;
      planifies: number;
      enCours: number;
      termines: number;
    };
    conformite: {
      score: number;
      evolution: number;
    };
  };
  hse: {
    hygiene: {
      total: number;
      conformes: number;
      nonConformes: number;
      enAttente: number;
    };
    epi: {
      total: number;
      enStock: number;
      seuilAlerte: number;
      manquants: number;
    };
    produitsChimiques: {
      total: number;
      enStock: number;
      seuilAlerte: number;
      manquants: number;
    };
    incidents: {
      total: number;
      critiques: number;
      eleves: number;
      moderes: number;
      faibles: number;
    };
    risques: {
      total: number;
      tresEleves: number;
      eleves: number;
      moderes: number;
      faibles: number;
    };
    formations: {
      total: number;
      planifiees: number;
      enCours: number;
      terminees: number;
    };
  };
}

export interface RecentActivity {
  id: string;
  type: 'laboratoire' | 'qualite' | 'hse';
  module: string;
  action: string;
  description: string;
  date: string;
  statut: string;
  priorite: 'haute' | 'moyenne' | 'basse';
}

class DashboardService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Récupérer les données du laboratoire
  async getLaboratoireData(): Promise<DashboardData['laboratoire']> {
    try {
      const response = await fetch('/api/dashboard/laboratoire', {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          echantillons: {
            total: data.echantillons?.total || 0,
            enAttente: data.echantillons?.enAttente || 0,
            enCours: data.echantillons?.enCours || 0,
            termines: data.echantillons?.termines || 0,
            conformes: data.echantillons?.conformes || 0,
            nonConformes: data.echantillons?.nonConformes || 0
          },
          analyses: {
            total: data.analyses?.total || 0,
            planifiees: data.analyses?.planifiees || 0,
            enCours: data.analyses?.enCours || 0,
            terminees: data.analyses?.terminees || 0
          },
          plansControle: {
            total: data.plansControle?.total || 0,
            actifs: data.plansControle?.actifs || 0,
            enAttente: data.plansControle?.enAttente || 0
          }
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données laboratoire:', error);
    }

    // Retourner des données par défaut en cas d'erreur
    return {
      echantillons: { total: 0, enAttente: 0, enCours: 0, termines: 0, conformes: 0, nonConformes: 0 },
      analyses: { total: 0, planifiees: 0, enCours: 0, terminees: 0 },
      plansControle: { total: 0, actifs: 0, enAttente: 0 }
    };
  }

  // Récupérer les données de qualité
  async getQualiteData(): Promise<DashboardData['qualite']> {
    try {
      const response = await fetch('/api/dashboard/qualite', {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          matieresPremieres: {
            total: data.matieresPremieres?.total || 0,
            conformes: data.matieresPremieres?.conformes || 0,
            nonConformes: data.matieresPremieres?.nonConformes || 0,
            enAttente: data.matieresPremieres?.enAttente || 0
          },
          controlesQualite: {
            total: data.controlesQualite?.total || 0,
            planifies: data.controlesQualite?.planifies || 0,
            enCours: data.controlesQualite?.enCours || 0,
            termines: data.controlesQualite?.termines || 0
          },
          nonConformites: {
            total: data.nonConformites?.total || 0,
            critiques: data.nonConformites?.critiques || 0,
            elevees: data.nonConformites?.elevees || 0,
            moderees: data.nonConformites?.moderees || 0,
            faibles: data.nonConformites?.faibles || 0
          },
          decisionsQualite: {
            total: data.decisionsQualite?.total || 0,
            enAttente: data.decisionsQualite?.enAttente || 0,
            validees: data.decisionsQualite?.validees || 0,
            rejetees: data.decisionsQualite?.rejetees || 0
          },
          audits: {
            total: data.audits?.total || 0,
            planifies: data.audits?.planifies || 0,
            enCours: data.audits?.enCours || 0,
            termines: data.audits?.termines || 0
          },
          conformite: {
            score: data.conformite?.score || 0,
            evolution: data.conformite?.evolution || 0
          }
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données qualité:', error);
    }

    // Retourner des données par défaut en cas d'erreur
    return {
      matieresPremieres: { total: 0, conformes: 0, nonConformes: 0, enAttente: 0 },
      controlesQualite: { total: 0, planifies: 0, enCours: 0, termines: 0 },
      nonConformites: { total: 0, critiques: 0, elevees: 0, moderees: 0, faibles: 0 },
      decisionsQualite: { total: 0, enAttente: 0, validees: 0, rejetees: 0 },
      audits: { total: 0, planifies: 0, enCours: 0, termines: 0 },
      conformite: { score: 0, evolution: 0 }
    };
  }

  // Récupérer les données HSE
  async getHSEData(): Promise<DashboardData['hse']> {
    try {
      const response = await fetch('/api/dashboard/hse', {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          hygiene: {
            total: data.hygiene?.total || 0,
            conformes: data.hygiene?.conformes || 0,
            nonConformes: data.hygiene?.nonConformes || 0,
            enAttente: data.hygiene?.enAttente || 0
          },
          epi: {
            total: data.epi?.total || 0,
            enStock: data.epi?.enStock || 0,
            seuilAlerte: data.epi?.seuilAlerte || 0,
            manquants: data.epi?.manquants || 0
          },
          produitsChimiques: {
            total: data.produitsChimiques?.total || 0,
            enStock: data.produitsChimiques?.enStock || 0,
            seuilAlerte: data.produitsChimiques?.seuilAlerte || 0,
            manquants: data.produitsChimiques?.manquants || 0
          },
          incidents: {
            total: data.incidents?.total || 0,
            critiques: data.incidents?.critiques || 0,
            eleves: data.incidents?.eleves || 0,
            moderes: data.incidents?.moderes || 0,
            faibles: data.incidents?.faibles || 0
          },
          risques: {
            total: data.risques?.total || 0,
            tresEleves: data.risques?.tresEleves || 0,
            eleves: data.risques?.eleves || 0,
            moderes: data.risques?.moderes || 0,
            faibles: data.risques?.faibles || 0
          },
          formations: {
            total: data.formations?.total || 0,
            planifiees: data.formations?.planifiees || 0,
            enCours: data.formations?.enCours || 0,
            terminees: data.formations?.terminees || 0
          }
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données HSE:', error);
    }

    // Retourner des données par défaut en cas d'erreur
    return {
      hygiene: { total: 0, conformes: 0, nonConformes: 0, enAttente: 0 },
      epi: { total: 0, enStock: 0, seuilAlerte: 0, manquants: 0 },
      produitsChimiques: { total: 0, enStock: 0, seuilAlerte: 0, manquants: 0 },
      incidents: { total: 0, critiques: 0, eleves: 0, moderes: 0, faibles: 0 },
      risques: { total: 0, tresEleves: 0, eleves: 0, moderes: 0, faibles: 0 },
      formations: { total: 0, planifiees: 0, enCours: 0, terminees: 0 }
    };
  }

  // Récupérer les activités récentes
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await fetch('/api/activities/recent', {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.activities || [];
      }
    } catch (error) {
      console.error('Erreur lors du chargement des activités récentes:', error);
    }

    return [];
  }

  // Récupérer toutes les données du dashboard
  async getAllDashboardData(): Promise<DashboardData> {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // Fallback vers les méthodes individuelles
        const [laboratoire, qualite, hse] = await Promise.all([
          this.getLaboratoireData(),
          this.getQualiteData(),
          this.getHSEData()
        ]);

        return {
          laboratoire,
          qualite,
          hse
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
