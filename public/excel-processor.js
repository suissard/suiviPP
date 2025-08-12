function formatDate(date) {
    if (!date || !(date instanceof Date)) {
        return date;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function transformResidents(data) {
    return data.map(row => ({
        id: `${row['Nom utilisé'] || ''} ${row['Premier prénom'] || ''}`.trim(),
        entry: formatDate(row['Entrée']),
        chNum: row['N° de chambre'] ? String(row['N° de chambre']).trim() : ''
    })).filter(r => r.id);
}

function transformProjets(data) {
    return data.map(row => {
        const residentName = row['Résident'] || '';
        const nameParts = residentName.split(' ');
        const id = nameParts.length > 2 ? `${nameParts[1]} ${nameParts[2].replace(',', '')}` : residentName;

        return {
            id: id,
            type: row['Libellé'],
            state: row['Étape'] ? row['Étape'].trim() : '',
            from: formatDate(row['Du']),
            to: formatDate(row['Au'])
        };
    }).filter(r => r.id);
}

function transformVieSociale(data) {
    const transformed = [];
    let currentResidentId = '';

    data.forEach(row => {
        if (row[0] && typeof row[0] === 'string') { // This is a resident row
            const residentName = row[0] || '';
            const nameParts = residentName.split(' ');
            if (nameParts.length > 1) {
                // Extracts "Nom Prénom" from "Civilité. Nom Prénom ..."
                currentResidentId = `${nameParts[1]} ${nameParts[2].replace(',', '')}`;
            } else {
                currentResidentId = residentName;
            }
        } else if (row[1] && currentResidentId) { // This is an event row for the current resident
            transformed.push({
                id: currentResidentId,
                date: row[1], // Already formatted as DD/MM/YYYY string from xlsx
                type: row[2]
            });
        }
    });
    return transformed;
}

function transformData(data, type) {
    switch (type) {
        case 'residents':
            return transformResidents(data);
        case 'projets':
            return transformProjets(data);
        case 'vie-sociale':
            return transformVieSociale(data);
        default:
            return data;
    }
}

function processFile(file, type) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error('No file selected.'));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                let jsonData;
                if (type === 'vie-sociale') {
                    // For 'vie-sociale', we need to process it row by row as array of arrays
                    jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });
                    // remove header
                    if (jsonData.length > 0) {
                        jsonData.shift();
                    }
                } else {
                    jsonData = XLSX.utils.sheet_to_json(sheet, { cellDates: true, raw: false });
                }

                const transformedData = transformData(jsonData, type);
                resolve(transformedData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}
