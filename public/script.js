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
        console.log('Generating table with:', { residents, projets, vieSociale });
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
        const headers = [
            { text: 'Nom', sortable: true },
            { text: 'Prénom', sortable: true },
            { text: 'Date d\'entrée', sortable: true },
            { text: 'Chambre', sortable: true },
            { text: 'Projets Signature (<1 an)', sortable: true },
            { text: 'Projets Brouillon (<1 an)', sortable: true },
            { text: 'PP et Consentement (<1 an)', sortable: true },
            { text: 'Bilan d\'intégration', sortable: true },
            { text: 'Projet Médical (signé <1 an)', sortable: true }
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

                const cellClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

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

                const signatureProjetsCell = row.insertCell();
                signatureProjetsCell.className = cellClasses;
                signatureProjetsCell.textContent = data.signatureProjetsLessThanYear;

                const brouillonProjetsCell = row.insertCell();
                brouillonProjetsCell.className = cellClasses;
                brouillonProjetsCell.textContent = data.brouillonProjetsLessThanYear;

                const ppEtConsentementCell = row.insertCell();
                ppEtConsentementCell.className = cellClasses;
                ppEtConsentementCell.textContent = data.hasPpEtConsentementLessThanYear ? 'Oui' : 'Non';

                const bilanIntegrationCell = row.insertCell();
                bilanIntegrationCell.className = cellClasses;
                bilanIntegrationCell.textContent = data.hasBilanIntegration ? 'Oui' : 'Non';

                const medicalProjetCell = row.insertCell();
                medicalProjetCell.className = cellClasses;
                medicalProjetCell.textContent = data.hasMedicalProjetInSignatureLessThanYear ? 'Oui' : 'Non';
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
                        valA = a.resident.Nom;
                        valB = b.resident.Nom;
                        break;
                    case 1:
                        valA = a.resident.Prénom;
                        valB = b.resident.Prénom;
                        break;
                    case 2:
                        valA = new Date(a.resident.entry);
                        valB = new Date(b.resident.entry);
                        break;
                    case 3:
                        valA = a.resident.chNum;
                        valB = b.resident.chNum;
                        break;
                    case 4:
                        valA = a.signatureProjetsLessThanYear;
                        valB = b.signatureProjetsLessThanYear;
                        break;
                    case 5:
                        valA = a.brouillonProjetsLessThanYear;
                        valB = b.brouillonProjetsLessThanYear;
                        break;
                    case 6:
                        valA = a.hasPpEtConsentementLessThanYear;
                        valB = b.hasPpEtConsentementLessThanYear;
                        break;
                    case 7:
                        valA = a.hasBilanIntegration;
                        valB = b.hasBilanIntegration;
                        break;
                    case 8:
                        valA = a.hasMedicalProjetInSignatureLessThanYear;
                        valB = b.hasMedicalProjetInSignatureLessThanYear;
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
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('hidden');

        const filePromises = [];

        if (residentsInput.files[0]) {
            filePromises.push(processResidentsFile(residentsInput.files[0]).then(data => {
                tableData.residents = data;
            }));
        }
        if (projetsInput.files[0]) {
            filePromises.push(processProjetsFile(projetsInput.files[0]).then(data => {
                tableData.projets = data;
            }));
        }
        if (vieSocialeInput.files[0]) {
            filePromises.push(processVieSocialeFile(vieSocialeInput.files[0]).then(data => {
                tableData.vieSociale = data;
            }));
        }

        Promise.all(filePromises)
            .then(() => {
                // Use a short timeout to allow the UI to update and show the loading indicator
                setTimeout(() => {
                    try {
                        generateTable(tableData.residents, tableData.projets, tableData.vieSociale);
                    } catch (error) {
                        console.error('Erreur lors de la génération du tableau:', error);
                        tableContainer.textContent = 'Une erreur est survenue lors de la génération du tableau.';
                    } finally {
                        loadingIndicator.classList.add('hidden');
                    }
                }, 50);
            })
            .catch(error => {
                console.error('Erreur lors du traitement des fichiers:', error);
                tableContainer.textContent = 'Erreur lors du traitement des fichiers.';
                loadingIndicator.classList.add('hidden');
            });
    });
});
