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

    get signatureProjetsCount() {
        return this.projets.filter(p => p.state === 'Signature').length;
    }

    get brouillonProjetsCount() {
        return this.projets.filter(p => p.state === 'Brouillon').length;
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
