class Data {
    constructor(resident) {
        this.resident = resident;
        this.projets = [];
        this.vieSociale = [];
    }

    addProjet(projet) {
        this.projets.push(projet);
    }

    addVieSociale(event) {
        this.vieSociale.push(event);
    }

    get status() {
        if (this.projets.some(p => p.state === 'En cours' && new Date(p.to) < new Date())) {
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

    get signatureProjetsLessThanYear() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return this.projets.filter(p => p.state === 'Signature' && new Date(p.from) >= oneYearAgo).length;
    }

    get brouillonProjetsLessThanYear() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return this.projets.filter(p => p.state === 'Brouillon' && new Date(p.from) >= oneYearAgo).length;
    }

    get hasPpEtConsentementLessThanYear() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return this.vieSociale.some(v => v.type === 'Pp et consentement' && new Date(v.date) >= oneYearAgo);
    }

    get hasBilanIntegration() {
        return this.vieSociale.some(v => v.type === 'Bilan d\'intégration');
    }

    get hasMedicalProjetInSignatureLessThanYear() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const signatureProjets = this.projets.filter(p => p.state === 'Signature' && new Date(p.from) >= oneYearAgo);
        return signatureProjets.some(p => p.type === 'Médical');
    }
}
