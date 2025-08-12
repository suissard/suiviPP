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
        table.className = 'min-w-full divide-y divide-gray-200';

        // Table header
        const thead = table.createTHead();
        thead.className = 'bg-gray-50';
        const headerRow = thead.insertRow();
        const headers = ['ID', 'Nom', 'Prénom', 'Date d\'entrée', 'Chambre', 'Projets', 'Vie Sociale'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Table body
        const tbody = table.createTBody();
        tbody.className = 'bg-white divide-y divide-gray-200';
        combinedData.forEach(data => {
            const row = tbody.insertRow();

            // Apply status colors
            if (data.status === 'success') {
                row.className = 'bg-green-100';
            } else if (data.status === 'warning') {
                row.className = 'bg-yellow-100';
            } else if (data.status === 'error') {
                row.className = 'bg-red-100';
            }

            const cellClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

            const idCell = row.insertCell();
            idCell.className = cellClasses;
            idCell.textContent = data.resident.id;

            const nomCell = row.insertCell();
            nomCell.className = cellClasses;
            nomCell.textContent = data.resident.Nom;

            const prenomCell = row.insertCell();
            prenomCell.className = cellClasses;
            prenomCell.textContent = data.resident.Prénom;

            const entryCell = row.insertCell();
            entryCell.className = cellClasses;
            entryCell.textContent = data.resident.entry;

            const chNumCell = row.insertCell();
            chNumCell.className = cellClasses;
            chNumCell.textContent = data.resident.chNum;

            // Projects cell
            const projetsCell = row.insertCell();
            projetsCell.className = cellClasses;
            projetsCell.innerHTML = data.projets.map(p =>
                `<div class="mb-2"><b>Type:</b> ${p.type}</div>
                 <div class="mb-2"><b>État:</b> ${p.state}</div>
                 <div><b>Du:</b> ${p.from} <b>Au:</b> ${p.to}</div>`
            ).join('<hr class="my-2">');

            // Social life cell
            const vieSocialeCell = row.insertCell();
            vieSocialeCell.className = cellClasses;
            vieSocialeCell.innerHTML = data.vieSociale.map(v =>
                `<div class="mb-2"><b>Motif:</b> ${v.type}</div>
                 <div><b>Date:</b> ${v.date}</div>`
            ).join('<hr class="my-2">');
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
        const file = residentsInput.files[0];
        if (file) {
            processFile(file)
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
        const file = projetsInput.files[0];
        if (file) {
            processFile(file)
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
        const file = vieSocialeInput.files[0];
        if (file) {
            processFile(file)
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
