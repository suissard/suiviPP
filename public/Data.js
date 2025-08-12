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
}
