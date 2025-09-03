// Entry point for the dashboard logic
document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const printTableButton = document.getElementById('print-table-button');
    const filterErrorButton = document.getElementById('filter-error-button');
    const filterWarningButton = document.getElementById('filter-warning-button');

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

    let currentFilter = null;

    function generateTable(residents, projets, vieSociale) {
        tableContainer.innerHTML = ''; // Clear previous table

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        tableContainer.appendChild(table);

        // Table header
        const thead = table.createTHead();
        thead.className = 'bg-gray-50';
        const headerRow = thead.insertRow();
        const headers = [
            { text: 'Aide', sortable: false },
            { text: 'ID', sortable: true },
            { text: 'Date d\'entrée', sortable: true },
            { text: 'Chambre', sortable: true },
            { text: 'Projets signés (-1 an)', sortable: true },
            { text: 'Projets Brouillon de moins d\'un an', sortable: true },
            { text: 'PP et Consentement', sortable: true },
            { text: 'Validité PP', sortable: true },
            { text: 'Bilan d\'intégration', sortable: true },
            { text: 'Projet Médical (-1 an)', sortable: true }
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

        if (!residents || !projets || !vieSociale) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = headers.length;
            cell.textContent = 'Veuillez charger tous les fichiers de données avant de générer le tableau.';
            cell.className = 'px-6 py-4 text-center text-gray-500';
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

        let sortedData = Array.from(combinedData.values());

        if (currentFilter) {
            sortedData = sortedData.filter(data => data.status === currentFilter);
        }

        function defaultSort(data) {
            const statusOrder = { 'error': 1, 'warning': 2, 'success': 3 };

            return data.sort((a, b) => {
                // 1. Sort by status
                const statusComparison = statusOrder[a.status] - statusOrder[b.status];
                if (statusComparison !== 0) return statusComparison;

                // 2. Sort by validitePp (oldest to newest)
                const dateA = a.validitePp;
                const dateB = b.validitePp;

                if (dateA && dateB) {
                    return dateA.getTime() - dateB.getTime();
                } else if (dateA) {
                    return -1; // a has a date, b doesn't, so a comes first
                } else if (dateB) {
                    return 1; // b has a date, a doesn't, so b comes first
                }

                return 0;
            });
        }

        defaultSort(sortedData);

        function formatDate(date) {
            if (!date) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        function applyStatusColor(element, status) {
            if (status === 'error') {
                element.classList.add('bg-red-200');
            } else if (status === 'warning') {
                element.classList.add('bg-yellow-200');
            }
        }

        function renderTable(dataToRender) {
            tbody.innerHTML = ''; // Clear existing rows
            dataToRender.forEach(data => {
                const row = tbody.insertRow();

                // Apply row status colors
                if (data.status === 'error') {
                    row.className = 'bg-red-100';
                } else if (data.status === 'warning') {
                    row.className = 'bg-yellow-100';
                }

                const cellClasses = 'px-6 py-4 whitespace-nownowrap text-sm text-gray-900';

                const helpCell = row.insertCell();
                helpCell.className = cellClasses;
                if (data.status === 'error' || data.status === 'warning') {
                    const icon = document.createElement('span');
                    icon.textContent = '❓';
                    icon.title = data.statusReasons.join('\n');
                    helpCell.appendChild(icon);
                }

                const idCell = row.insertCell();
                idCell.className = cellClasses;
                idCell.textContent = data.resident.id;

                const entryCell = row.insertCell();
                entryCell.className = cellClasses;
                entryCell.textContent = formatDate(data.resident.entry);

                const chNumCell = row.insertCell();
                chNumCell.className = cellClasses;
                chNumCell.textContent = data.resident.chNum;

                const signedLastYearCell = row.insertCell();
                signedLastYearCell.className = cellClasses;
                signedLastYearCell.textContent = data.projectsByStatus.signedLastYear;
                applyStatusColor(signedLastYearCell, data.signedProjectStatus);


                const draftLastYearCell = row.insertCell();
                draftLastYearCell.className = cellClasses;
                draftLastYearCell.textContent = data.draftProjectsLastYear;
                applyStatusColor(draftLastYearCell, data.draftProjectStatus);

                const ppEtConsentementCell = row.insertCell();
                ppEtConsentementCell.className = cellClasses;
                ppEtConsentementCell.textContent = data.hasPpEtConsentement ? 'Oui' : 'Non';
                applyStatusColor(ppEtConsentementCell, data.ppEtConsentementStatus);

                const validitePpCell = row.insertCell();
                validitePpCell.className = cellClasses;
                validitePpCell.textContent = formatDate(data.validitePp);

                const bilanIntegrationCell = row.insertCell();
                bilanIntegrationCell.className = cellClasses;
                bilanIntegrationCell.textContent = data.hasBilanIntegration ? 'Oui' : 'Non';
                applyStatusColor(bilanIntegrationCell, data.bilanIntegrationStatus);


                const medicalProjetCell = row.insertCell();
                medicalProjetCell.className = cellClasses;
                medicalProjetCell.textContent = data.hasMedicalProjetLastYear ? 'Oui' : 'Non';
                applyStatusColor(medicalProjetCell, data.medicalProjetLastYearStatus);
            });
        }

        let sortDirection = 'asc';

        function sortTable(columnIndex) {
            const isAsc = sortDirection === 'asc';
            sortDirection = isAsc ? 'desc' : 'asc';

            sortedData.sort((a, b) => {
                let valA, valB;

                switch (columnIndex) {
                    case 1:
                        valA = a.resident.id;
                        valB = b.resident.id;
                        break;
                    case 2:
                        valA = a.resident.entry;
                        valB = b.resident.entry;
                        break;
                    case 3:
                        valA = a.resident.chNum;
                        valB = b.resident.chNum;
                        break;
                    case 4:
                        valA = a.projectsByStatus.signedLastYear;
                        valB = b.projectsByStatus.signedLastYear;
                        break;
                    case 5:
                        valA = a.draftProjectsLastYear;
                        valB = b.draftProjectsLastYear;
                        break;
                    case 6:
                        valA = a.hasPpEtConsentement;
                        valB = b.hasPpEtConsentement;
                        break;
                    case 7:
                        valA = a.validitePp;
                        valB = b.validitePp;
                        break;
                    case 8:
                        valA = a.hasBilanIntegration;
                        valB = b.hasBilanIntegration;
                        break;
                    case 9:
                        valA = a.hasMedicalProjetLastYear;
                        valB = b.hasMedicalProjetLastYear;
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

    function setValidationIndicator(input, fileInfo, success, message) {
        const parentDiv = input.parentElement.parentElement;
        parentDiv.classList.remove('bg-white', 'bg-green-100', 'bg-red-100');
        if (success === true) {
            parentDiv.classList.add('bg-green-100');
        } else if (success === false) {
            parentDiv.classList.add('bg-red-100');
        } else {
            parentDiv.classList.add('bg-white');
        }
        fileInfo.textContent = message;
    }

    async function handleFileSelect(event, type, processor) {
        const file = event.target.files[0];
        const input = event.target;
        const fileInfo = input.parentElement.nextElementSibling;

        if (!file) {
            setValidationIndicator(input, fileInfo, null, '');
            files[type] = null;
            tableData[type] = null;
            return;
        }

        try {
            const result = await processor(file);
            console.log(`JSON pour ${type}:`, result.data);
            tableData[type] = result.data;
            files[type] = file;

            const successMessage = `${result.successCount} ligne(s) chargée(s) avec succès.`;
            if (result.errorCount > 0) {
                setValidationIndicator(input, fileInfo, false, `${successMessage} ${result.errorCount} erreur(s).`);
            } else {
                setValidationIndicator(input, fileInfo, true, successMessage);
            }

            checkAndGenerateTable();
        } catch (error) {
            console.error(`Erreur de traitement du fichier pour ${type}:`, error);
            setValidationIndicator(input, fileInfo, false, error.message);
            files[type] = null;
            tableData[type] = null;
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

    filterErrorButton.addEventListener('click', () => {
        currentFilter = currentFilter === 'error' ? null : 'error';
        generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
    });

    filterWarningButton.addEventListener('click', () => {
        currentFilter = currentFilter === 'warning' ? null : 'warning';
        generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
    });
});
