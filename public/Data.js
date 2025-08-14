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
        this.vieSociale.push(event);
    }

    get status() {
        if (this.projets.some(p => p.state === 'En cours' && p.to < new Date())) {
            return 'error';
        }
        if (this.projets.length === 0) {
            return 'success';
        }
        if (this.projets.some(p => p.state === 'En cours' || p.state === 'À venir')) {
            return 'success';
        }
        return 'warning';
    }

    get projectsCount() {
        return this.projets.length;
    }

    get signatureProjetsCount() {
        return this.projets.filter(p => p.state === 'Signature').length;
    }

    get brouillonProjetsCount() {
        return this.projets.filter(p => p.state === 'Brouillon').length;
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
            if (p.state === 'Signature' && p.from >= oneYearAgo) {
                statusCounts.signedLastYear++;
            }
            if (p.state === 'En cours') {
                statusCounts.onGoing++;
            }
            if (p.state === 'Terminé') {
                statusCounts.finished++;
            }
            if (p.state === 'À venir') {
                statusCounts.future++;
            }
        });

        return statusCounts;
    }

    get hasPpEtConsentement() {
        return this.vieSociale.some(v => v.type === 'PP - Présentation et Consentement');
    }

    get hasBilanIntegration() {
        return this.vieSociale.some(v => v.type === 'Bilan d\'intégration');
    }

    get hasMedicalProjet() {
        return this.projets.some(p => p.type === 'Prise en charge médicale');
    }
}
