class Data {
    constructor(resident) {
        this.resident = resident;
        if (this.resident.entry) {
            this.resident.entry = new Date(this.resident.entry);
        }
        this.projets = [];
        this.vieSociale = [];
    }

    addProjet(projet) {
        if (projet.from) {
            projet.from = new Date(projet.from);
        }
        if (projet.to) {
            projet.to = new Date(projet.to);
        }
        this.projets.push(projet);
    }

    addVieSociale(event) {
        if (event.date) {
            event.date = new Date(event.date);
        }
        this.vieSociale.push(event);
    }

    get status() {
        const statuses = [
            this.signedProjectStatus,
            this.draftProjectStatus,
            this.ppEtConsentementStatus,
            this.bilanIntegrationStatus,
            this.medicalProjetLastYearStatus
        ];

        if (statuses.includes('error')) {
            return 'error';
        }
        if (statuses.includes('warning')) {
            return 'warning';
        }
        return 'success';
    }

    get statusReasons() {
        const reasons = [];
        if (this.signedProjectStatus === 'error') {
            reasons.push('Le nombre de projets signés de moins d\'un an est inférieur à 3.');
        }
        if (this.draftProjectStatus === 'warning') {
            reasons.push('Il y a des projets en état de brouillon de moins d\'un an.');
        }
        if (this.ppEtConsentementStatus === 'error') {
            reasons.push('PP et consentement manquant.');
        }
        if (this.bilanIntegrationStatus === 'error') {
            reasons.push('Bilan d\'intégration manquant.');
        }
        if (this.medicalProjetLastYearStatus === 'error') {
            reasons.push('Projet médical de moins d\'un an manquant.');
        }
        return reasons;
    }

    get signedProjectStatus() {
        return this.projectsByStatus.signedLastYear < 3 ? 'error' : 'normal';
    }

    get draftProjectStatus() {
        return this.draftProjectsLastYear > 0 ? 'warning' : 'normal';
    }

    get ppEtConsentementStatus() {
        return this.hasPpEtConsentement ? 'normal' : 'error';
    }

    get bilanIntegrationStatus() {
        return this.hasBilanIntegration ? 'normal' : 'error';
    }

    get medicalProjetLastYearStatus() {
        return this.hasMedicalProjetLastYear ? 'normal' : 'error';
    }

    get projectsCount() {
        return this.projets.length;
    }

    get signatureProjetsCount() {
        return this.projets.filter(p => p.state && p.state.trim() === 'Signature').length;
    }

    get brouillonProjetsCount() {
        return this.projets.filter(p => p.state && p.state.trim() === 'Brouillon').length;
    }

    get draftProjectsLastYear() {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return this.projets.filter(p => {
            if (!p.state || p.state.trim() !== 'Brouillon') return false;
            return p.from && p.from >= oneYearAgo;
        }).length;
    }

    get projectsByStatus() {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

        const statusCounts = {
            signedLastYear: 0,
            onGoing: 0,
            finished: 0,
            future: 0,
            draft: this.brouillonProjetsCount,
            signed: this.signatureProjetsCount,
        };

        this.projets.forEach(p => {
            if (!p.state) return;
            const state = p.state.trim();
            if (state === 'Signature' && p.from >= oneYearAgo) {
                statusCounts.signedLastYear++;
            }
            if (state === 'En cours') {
                statusCounts.onGoing++;
            }
            if (state === 'Clôture') { // Corrected keyword
                statusCounts.finished++;
            }
            if (state === 'À venir') {
                statusCounts.future++;
            }
        });

        return statusCounts;
    }

    get hasPpEtConsentement() {
        return this.vieSociale.some(v => v.type === 'PP - Présentation et Consentement');
    }

    get hasBilanIntegration() {
        return this.vieSociale.some(v => v.type === 'Bilan d’intégration');
    }

    get hasMedicalProjetLastYear() {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return this.projets.some(p => {
            if (p.type !== 'Prise en charge médicale') return false;
            // Assuming 'from' date should be within the last year
            return p.from && p.from >= oneYearAgo;
        });
    }

    get validitePp() {
        const ppEvents = this.projets
            .filter(p => p.state && p.state.trim() === 'Signature' && p.to)
            .sort((a, b) => b.to.getTime() - a.to.getTime());

        if (ppEvents.length === 0) {
            return null;
        }

        const lastPps = ppEvents.slice(0, 3);

        const oldestOfLastPps = lastPps[lastPps.length - 1];

        return oldestOfLastPps.to;
    }
}
