document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const generateTableButton = document.getElementById('generate-table-button');

    const residentsInput = document.getElementById('residents-input');
    const residentsJsonButton = document.getElementById('residents-json-button');
    const residentsJsonOutput = document.getElementById('residents-json-output');

    const projetsInput = document.getElementById('projets-input');
    const projetsJsonButton = document.getElementById('projets-json-button');
    const projetsJsonOutput = document.getElementById('projets-json-output');

    const vieSocialeInput = document.getElementById('vie-sociale-input');
    const vieSocialeJsonButton = document.getElementById('vie-sociale-json-button');
    const vieSocialeJsonOutput = document.getElementById('vie-sociale-json-output');

    let tableData = {
        residents: null,
        projets: null,
        vieSociale: null
    };

    function generateTable(residents, projets, vieSociale) {
        tableContainer.innerHTML = ''; // Clear previous table
        if (!residents || !projets || !vieSociale) {
            tableContainer.textContent = 'Veuillez charger tous les fichiers de données avant de générer le tableau.';
            return;
        }

        const combinedData = new Map();

        // 1. Initialize with resident data and create Data instances
        residents.forEach(resident => {
            combinedData.set(resident.id, new Data(resident));
        });

        // 2. Add projects to residents
        projets.forEach(projet => {
            if (combinedData.has(projet.id)) {
                combinedData.get(projet.id).addProjet(projet);
            }
        });

        // 3. Add social life events to residents
        vieSociale.forEach(event => {
            if (combinedData.has(event.id)) {
                combinedData.get(event.id).addVieSociale(event);
            }
        });

        // 4. Generate the table
        const table = document.createElement('table');

        // Table header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const headers = ['ID', 'Nom', 'Prénom', 'Date d\'entrée', 'Chambre', 'Projets', 'Vie Sociale'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Table body
        const tbody = table.createTBody();
        combinedData.forEach(data => {
            const row = tbody.insertRow();
            row.className = data.status;

            row.insertCell().textContent = data.resident.id;
            row.insertCell().textContent = data.resident.Nom;
            row.insertCell().textContent = data.resident.Prénom;
            row.insertCell().textContent = data.resident.entry;
            row.insertCell().textContent = data.resident.chNum;

            // Projects cell
            const projetsCell = row.insertCell();
            projetsCell.innerHTML = data.projets.map(p =>
                `<b>Type:</b> ${p.type}<br>
                 <b>État:</b> ${p.state}<br>
                 <b>Du:</b> ${p.from} <b>Au:</b> ${p.to}`
            ).join('<hr style="margin: 5px 0;">');

            // Social life cell
            const vieSocialeCell = row.insertCell();
            vieSocialeCell.innerHTML = data.vieSociale.map(v =>
                `<b>Motif:</b> ${v.type}<br>
                 <b>Date:</b> ${v.date}`
            ).join('<hr style="margin: 5px 0;">');
        });

        tableContainer.appendChild(table);
    }

    // Load default data
    Promise.all([
        fetch('residents.json').then(response => response.json()),
        fetch('projets.json').then(response => response.json()),
        fetch('vie_sociale.json').then(response => response.json())
    ])
    .then(([residents, projets, vieSociale]) => {
        tableData = { residents, projets, vieSociale };
        generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données par défaut:', error);
        tableContainer.textContent = 'Erreur lors du chargement des données par défaut. Veuillez vérifier la console.';
    });

    // Handle "Voir JSON" buttons
    residentsJsonButton.addEventListener('click', () => {
        if (residentsJsonOutput.textContent) {
            residentsJsonOutput.textContent = '';
            return;
        }
        const file = residentsInput.files[0];
        if (file) {
            processResidentsFile(file)
                .then(data => {
                    tableData.residents = data;
                    residentsJsonOutput.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    residentsJsonOutput.textContent = 'Erreur lors du traitement du fichier.';
                });
        }
    });

    projetsJsonButton.addEventListener('click', () => {
        if (projetsJsonOutput.textContent) {
            projetsJsonOutput.textContent = '';
            return;
        }
        const file = projetsInput.files[0];
        if (file) {
            processProjetsFile(file)
                .then(data => {
                    tableData.projets = data;
                    projetsJsonOutput.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    projetsJsonOutput.textContent = 'Erreur lors du traitement du fichier.';
                });
        }
    });

    vieSocialeJsonButton.addEventListener('click', () => {
        if (vieSocialeJsonOutput.textContent) {
            vieSocialeJsonOutput.textContent = '';
            return;
        }
        const file = vieSocialeInput.files[0];
        if (file) {
            processVieSocialeFile(file)
                .then(data => {
                    tableData.vieSociale = data;
                    vieSocialeJsonOutput.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    vieSocialeJsonOutput.textContent = 'Erreur lors du traitement du fichier.';
                });
        }
    });

    // Handle "Générer le tableau" button
    generateTableButton.addEventListener('click', () => {
        generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
    });
});
