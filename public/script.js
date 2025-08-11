document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');

    Promise.all([
        fetch('residents.json').then(response => response.json()),
        fetch('projets.json').then(response => response.json()),
        fetch('vie_sociale.json').then(response => response.json())
    ])
    .then(([residents, projets, vieSociale]) => {
        const combinedData = new Map();

        // 1. Initialize with resident data
        residents.forEach(resident => {
            combinedData.set(resident.id, {
                ...resident,
                projets: [],
                vieSociale: []
            });
        });

        // 2. Add projects to residents
        projets.forEach(projet => {
            if (combinedData.has(projet.id)) {
                combinedData.get(projet.id).projets.push(projet);
            }
        });

        // 3. Add social life events to residents
        vieSociale.forEach(event => {
            if (combinedData.has(event.id)) {
                combinedData.get(event.id).vieSociale.push(event);
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
        combinedData.forEach(resident => {
            const row = tbody.insertRow();

            row.insertCell().textContent = resident.id;
            row.insertCell().textContent = resident.Nom;
            row.insertCell().textContent = resident.Prénom;
            row.insertCell().textContent = resident.entry;
            row.insertCell().textContent = resident.chNum;

            // Projects cell
            const projetsCell = row.insertCell();
            projetsCell.innerHTML = resident.projets.map(p =>
                `<b>Type:</b> ${p.type}<br>
                 <b>État:</b> ${p.state}<br>
                 <b>Du:</b> ${p.from} <b>Au:</b> ${p.to}`
            ).join('<hr style="margin: 5px 0;">');

            // Social life cell
            const vieSocialeCell = row.insertCell();
            vieSocialeCell.innerHTML = resident.vieSociale.map(v =>
                `<b>Motif:</b> ${v.type}<br>
                 <b>Date:</b> ${v.date}`
            ).join('<hr style="margin: 5px 0;">');
        });

        tableContainer.appendChild(table);
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données:', error);
        tableContainer.textContent = 'Erreur lors du chargement des données. Veuillez vérifier la console.';
    });
});
