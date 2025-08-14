document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const printTableButton = document.getElementById('print-table-button');

    const residentsInput = document.getElementById('residents-input');
    const projetsInput = document.getElementById('projets-input');
    const vieSocialeInput = document.getElementById('vie-sociale-input');

    let tableData = {
        residents: null,
        projets: null,
        vieSociale: null
    };

    let files = {
        residents: null,
        projets: null,
        vieSociale: null
    }

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
        console.log('combinedData:', combinedData);
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';

        // Table header
        const thead = table.createTHead();
        thead.className = 'bg-gray-50';
        const headerRow = thead.insertRow();
        const headers = [
            { text: 'ID', sortable: true },
            { text: 'Date d\'entrée', sortable: true },
            { text: 'Chambre', sortable: true },
            { text: 'Projets (total)', sortable: true },
            { text: 'Projets signés (-1 an)', sortable: true },
            { text: 'Projets en cours', sortable: true },
            { text: 'Projets terminés', sortable: true },
            { text: 'Projets à venir', sortable: true },
            { text: 'PP et Consentement', sortable: true },
            { text: 'Bilan d\'intégration', sortable: true },
            { text: 'Projet Médical', sortable: true }
        ];

        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            th.textContent = header.text;
            if (header.sortable) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => sortTable(index));
            }
            headerRow.appendChild(th);
        });

        // Table body
        const tbody = table.createTBody();
        tbody.className = 'bg-white divide-y divide-gray-200';
        let sortedData = Array.from(combinedData.values());

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        function renderTable(dataToRender) {
            tbody.innerHTML = ''; // Clear existing rows
            dataToRender.forEach(data => {
                const row = tbody.insertRow();

                // Apply status colors
                if (data.status === 'success') {
                    row.className = 'bg-green-100';
                } else if (data.status === 'warning') {
                    row.className = 'bg-yellow-100';
                } else if (data.status === 'error') {
                    row.className = 'bg-red-100';
                }

                const cellClasses = 'px-6 py-4 whitespace-nownowrap text-sm text-gray-900';

                const idCell = row.insertCell();
                idCell.className = cellClasses;
                idCell.textContent = data.resident.id;

                const entryCell = row.insertCell();
                entryCell.className = cellClasses;
                entryCell.textContent = formatDate(data.resident.entry);

                const chNumCell = row.insertCell();
                chNumCell.className = cellClasses;
                chNumCell.textContent = data.resident.chNum;

                const projectsTotalCell = row.insertCell();
                projectsTotalCell.className = cellClasses;
                projectsTotalCell.textContent = data.projectsCount;

                const signedLastYearCell = row.insertCell();
                signedLastYearCell.className = cellClasses;
                signedLastYearCell.textContent = data.projectsByStatus.signedLastYear;

                const onGoingCell = row.insertCell();
                onGoingCell.className = cellClasses;
                onGoingCell.textContent = data.projectsByStatus.onGoing;

                const finishedCell = row.insertCell();
                finishedCell.className = cellClasses;
                finishedCell.textContent = data.projectsByStatus.finished;

                const futureCell = row.insertCell();
                futureCell.className = cellClasses;
                futureCell.textContent = data.projectsByStatus.future;

                const ppEtConsentementCell = row.insertCell();
                ppEtConsentementCell.className = cellClasses;
                ppEtConsentementCell.textContent = data.hasPpEtConsentement ? 'Oui' : 'Non';

                const bilanIntegrationCell = row.insertCell();
                bilanIntegrationCell.className = cellClasses;
                bilanIntegrationCell.textContent = data.hasBilanIntegration ? 'Oui' : 'Non';

                const medicalProjetCell = row.insertCell();
                medicalProjetCell.className = cellClasses;
                medicalProjetCell.textContent = data.hasMedicalProjet ? 'Oui' : 'Non';
            });
        }

        let sortDirection = 'asc';

        function sortTable(columnIndex) {
            const isAsc = sortDirection === 'asc';
            sortDirection = isAsc ? 'desc' : 'asc';

            sortedData.sort((a, b) => {
                let valA, valB;

                switch (columnIndex) {
                    case 0:
                        valA = a.resident.id;
                        valB = b.resident.id;
                        break;
                    case 1:
                        valA = new Date(a.resident.entry);
                        valB = new Date(b.resident.entry);
                        break;
                    case 2:
                        valA = a.resident.chNum;
                        valB = b.resident.chNum;
                        break;
                    case 3:
                        valA = a.projectsCount;
                        valB = b.projectsCount;
                        break;
                    case 4:
                        valA = a.projectsByStatus.signedLastYear;
                        valB = b.projectsByStatus.signedLastYear;
                        break;
                    case 5:
                        valA = a.projectsByStatus.onGoing;
                        valB = b.projectsByStatus.onGoing;
                        break;
                    case 6:
                        valA = a.projectsByStatus.finished;
                        valB = b.projectsByStatus.finished;
                        break;
                    case 7:
                        valA = a.projectsByStatus.future;
                        valB = b.projectsByStatus.future;
                        break;
                    case 8:
                        valA = a.hasPpEtConsentement;
                        valB = b.hasPpEtConsentement;
                        break;
                    case 9:
                        valA = a.hasBilanIntegration;
                        valB = b.hasBilanIntegration;
                        break;
                    case 10:
                        valA = a.hasMedicalProjet;
                        valB = b.hasMedicalProjet;
                        break;
                }

                if (valA < valB) {
                    return isAsc ? -1 : 1;
                }
                if (valA > valB) {
                    return isAsc ? 1 : -1;
                }
                return 0;
            });

            renderTable(sortedData);
        }

        renderTable(sortedData);

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

    function setValidationIndicator(input, isValid) {
        const parentDiv = input.parentElement.parentElement;
        parentDiv.classList.remove('bg-white', 'bg-green-100', 'bg-red-100');
        if (isValid === true) {
            parentDiv.classList.add('bg-green-100');
        } else if (isValid === false) {
            parentDiv.classList.add('bg-red-100');
        } else {
            parentDiv.classList.add('bg-white');
        }
    }

    async function handleFileSelect(event, type, processor) {
        const file = event.target.files[0];
        const input = event.target;
        if (!file) {
            setValidationIndicator(input, null);
            files[type] = null;
            return;
        }

        try {
            const data = await processor(file);
            console.log(`JSON pour ${type}:`, data);
            tableData[type] = data;
            files[type] = file;
            setValidationIndicator(input, true);
            checkAndGenerateTable();
        } catch (error) {
            console.error(`Erreur de traitement du fichier pour ${type}:`, error);
            setValidationIndicator(input, false);
            files[type] = null;
        }
    }

    residentsInput.addEventListener('change', (e) => handleFileSelect(e, 'residents', processResidentsFile));
    projetsInput.addEventListener('change', (e) => handleFileSelect(e, 'projets', processProjetsFile));
    vieSocialeInput.addEventListener('change', (e) => handleFileSelect(e, 'vieSociale', processVieSocialeFile));


    function checkAndGenerateTable() {
        if (tableData.residents && tableData.projets && tableData.vieSociale) {
            generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
        }
    }

    printTableButton.addEventListener('click', () => {
        window.print();
    });
});
