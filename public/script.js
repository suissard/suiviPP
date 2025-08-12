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

        // Adapt residents data structure for Data class
        const adaptedResidents = residents.map(r => {
            const nameParts = r.id.split(' ');
            return {
                id: r.id, // This is the concatenated "Nom Prénom" for matching
                Nom: nameParts[0] || '',
                Prénom: nameParts.slice(1).join(' ') || '',
                entry: r.entry,
                chNum: r.chNum
            };
        });

        // 1. Initialize with resident data and create Data instances
        adaptedResidents.forEach(resident => {
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

            const residentData = data.resident || {};
            row.insertCell().textContent = residentData.id;
            row.insertCell().textContent = residentData.Nom;
            row.insertCell().textContent = residentData.Prénom;
            row.insertCell().textContent = residentData.entry;
            row.insertCell().textContent = residentData.chNum;

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
        // This part might be broken because the default JSONs might not have the concatenated id.
        // The task is about XLSX files, so I will focus on that.
        // For now, I will adapt the residents to have a concatenated id.
        const adaptedResidents = residents.map(r => ({ ...r, id: `${r.Nom} ${r.Prénom}` }));
        tableData = { residents: adaptedResidents, projets, vieSociale };
        generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données par défaut:', error);
        tableContainer.textContent = 'Erreur lors du chargement des données par défaut. Veuillez vérifier la console.';
    });

    // Handle "Voir JSON" buttons with toggle
    function addJsonButtonListener(button, input, output, type) {
        button.addEventListener('click', () => {
            if (output.style.display === 'block') {
                output.style.display = 'none';
                return;
            }

            const file = input.files[0];
            if (file) {
                processFile(file, type)
                    .then(data => {
                        if (type === 'residents') tableData.residents = data;
                        if (type === 'projets') tableData.projets = data;
                        if (type === 'vie-sociale') tableData.vieSociale = data;

                        output.textContent = JSON.stringify(data, null, 2);
                        output.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Erreur:', error);
                        output.textContent = 'Erreur lors du traitement du fichier.';
                        output.style.display = 'block';
                    });
            }
        });
    }

    addJsonButtonListener(residentsJsonButton, residentsInput, residentsJsonOutput, 'residents');
    addJsonButtonListener(projetsJsonButton, projetsInput, projetsJsonOutput, 'projets');
    addJsonButtonListener(vieSocialeJsonButton, vieSocialeInput, vieSocialeJsonOutput, 'vie-sociale');

    // Handle "Générer le tableau" button
    generateTableButton.addEventListener('click', () => {
        if (tableData.residents && tableData.projets && tableData.vieSociale) {
            generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
        } else {
            alert('Veuillez charger tous les fichiers de données.');
        }
    });
});
