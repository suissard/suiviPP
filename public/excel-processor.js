function processResidentsFile(file) {
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
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                const formattedData = jsonData.map(row => ({
                    "id": row["Résident"],
                    "entry": row["Entrée"],
                    "chNum": row["N° de chambre"]
                }));

                resolve(formattedData);
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

function processProjetsFile(file) {
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
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                const formattedData = jsonData.map(row => ({
                    "id": row["Résident"],
                    "type": row["Libellé"],
                    "state": row["Étape"],
                    "from": row["Du"],
                    "to": row["Au"]
                }));

                resolve(formattedData);
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

function processVieSocialeFile(file) {
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
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const formattedData = [];
                let currentResident = null;
                // Start from 1 to skip header row
                for (let i = 1; i < sheetData.length; i++) {
                    const row = sheetData[i];
                    // Resident name is in the first column and the rest are empty
                    if (row[0] && row[1] === undefined) {
                        currentResident = row[0];
                    } else if (currentResident && row[1] && row[2]) { // Make sure date and type are not empty
                        formattedData.push({
                            "id": currentResident,
                            "type": row[2], // "motif" is in the third column
                            "date": row[1]  // "date" is in the second column
                        });
                    }
                }

                resolve(formattedData);
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
