document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const loadButton = document.getElementById('load-button');
    const xlsxInput = document.getElementById('xlsx-input');

    function generateTable(residents, projets, vieSociale) {
        tableContainer.innerHTML = ''; // Clear previous table
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
        generateTable(residents, projets, vieSociale);
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données par défaut:', error);
        tableContainer.textContent = 'Erreur lors du chargement des données par défaut. Veuillez vérifier la console.';
    });

    // Handle file upload
    loadButton.addEventListener('click', () => {
        const files = xlsxInput.files;
        if (files.length === 0) {
            alert('Veuillez sélectionner des fichiers XLSX.');
            return;
        }

        processFiles(files)
            .then(data => {
                generateTable(data.residents, data.projets, data.vieSociale);
            })
            .catch(error => {
                console.error('Erreur lors du traitement des fichiers XLSX:', error);
                alert('Erreur lors du traitement des fichiers XLSX. Veuillez vérifier la console.');
            });
    });
});
