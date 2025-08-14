function extractName(fullName) {
  if (!fullName) {
    return '';
  }

  let processedName = String(fullName);

  // Remove titles like "Mme.", "M.", "MR"
  processedName = processedName.replace(/^(Mme|M|MR)\.?\s+/, '');

  // Stop at "Née"
  const neeIndex = processedName.indexOf('Née');
  if (neeIndex > -1) {
    processedName = processedName.substring(0, neeIndex);
  }

  // Stop at a comma, which often separates other names
  const commaIndex = processedName.indexOf(',');
  if (commaIndex > -1) {
    processedName = processedName.substring(0, commaIndex);
  }

  // Stop at parenthesis
  const parenthesisIndex = processedName.indexOf('(');
  if (parenthesisIndex > -1) {
    processedName = processedName.substring(0, parenthesisIndex);
  }

  // Trim any remaining whitespace
  return processedName.trim();
}

function toISODateString(date) {
    if (!date) {
        return null;
    }

    let d;
    if (date instanceof Date) {
        d = date;
    } else if (typeof date === 'string' && date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
            // Assuming DD/MM/YYYY
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            d = new Date(Date.UTC(year, month, day));
        } else {
            d = new Date(date); // Fallback for other string formats
        }
    } else if (typeof date === 'number') {
        // It could be an Excel serial number.
        d = new Date(Math.round((date - 25569) * 86400 * 1000));
    }
    else {
        d = new Date(date); // Fallback for other types
    }

    // Check if the date is valid
    if (isNaN(d.getTime())) {
        return null;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { cellDates: true });

                if (jsonData.length > 0) {
                    const firstRow = jsonData[0];
                    if (!('Résident' in firstRow && 'Entrée' in firstRow && 'N° de chambre' in firstRow)) {
                        return reject(new Error('Le fichier Résidents ne contient pas les colonnes attendues.'));
                    }
                }

                const formattedData = jsonData.map(row => {
                    let entryDate = row["Entrée"];
                    // The robust toISODateString now handles numbers, so this inline check is no longer needed.
                    // However, to minimize changes, we'll leave it. The function is idempotent.
                    if (typeof entryDate === 'number') {
                        entryDate = new Date(Math.round((entryDate - 25569) * 86400 * 1000));
                    }
                    return {
                        "id": extractName(row["Résident"]),
                        "entry": toISODateString(entryDate),
                        "chNum": row["N° de chambre"]
                    };
                });

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractName,
        processResidentsFile,
        processProjetsFile,
        processVieSocialeFile,
    };
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
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { cellDates: true });

                if (jsonData.length > 0) {
                    const firstRow = jsonData[0];
                    if (!('Résident' in firstRow && 'Libellé' in firstRow && 'Étape' in firstRow && 'Du' in firstRow && 'Au' in firstRow)) {
                        return reject(new Error('Le fichier Projets ne contient pas les colonnes attendues.'));
                    }
                }

                const formattedData = jsonData.map(row => ({
                    "id": extractName(row["Résident"]),
                    "type": row["Libellé"],
                    "state": row["Étape"],
                    "from": toISODateString(row["Du"]),
                    "to": toISODateString(row["Au"])
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
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

                if (sheetData.length < 2) {
                    return reject(new Error('Le fichier Vie Sociale ne contient pas de données.'));
                }

                const formattedData = [];
                let currentResident = null;
                // Start from 1 to skip header row
                for (let i = 1; i < sheetData.length; i++) {
                    const row = sheetData[i];
                    // Resident name is in the first column and the rest are empty
                    if (row[0] && row[1] === undefined) {
                        currentResident = extractName(row[0]);
                    } else if (currentResident && row[1] && row[2]) { // Make sure date and type are not empty
                        formattedData.push({
                            "id": currentResident,
                            "type": row[2], // "motif" is in the third column
                            "date": toISODateString(row[1])  // "date" is in the second column
                        });
                    }
                }

                if (formattedData.length === 0) {
                    return reject(new Error("Aucune donnée valide n'a été trouvée dans le fichier Vie Sociale."));
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
