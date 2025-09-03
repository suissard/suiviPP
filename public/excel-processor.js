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

                let successCount = 0;
                let errorCount = 0;
                const formattedData = [];

                jsonData.forEach(row => {
                    try {
                        let entryDate = row["Entrée"];
                        if (typeof entryDate === 'number') {
                            entryDate = new Date(Math.round((entryDate - 25569) * 86400 * 1000));
                        }

                        const resident = {
                            "id": extractName(row["Résident"]),
                            "entry": toISODateString(entryDate),
                            "chNum": row["N° de chambre"]
                        };

                        if (!resident.id || !resident.entry || !resident.chNum) {
                            throw new Error("Missing required fields for resident.");
                        }

                        formattedData.push(resident);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                    }
                });

                resolve({ data: formattedData, successCount, errorCount });
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

function exportToExcel(data) {
    const worksheetData = data.map(item => ({
        'ID': item.resident.id,
        'Date d\'entrée': item.resident.entry,
        'Chambre': item.resident.chNum,
        'Projets signés (-1 an)': item.projectsByStatus.signedLastYear,
        'Projets Brouillon de moins d\'un an': item.draftProjectsLastYear,
        'PP et Consentement': item.hasPpEtConsentement ? 'Oui' : 'Non',
        'Validité PP': item.validitePp,
        'Bilan d\'intégration': item.hasBilanIntegration ? 'Oui' : 'Non',
        'Projet Médical (-1 an)': item.hasMedicalProjetLastYear ? 'Oui' : 'Non',
        'Status': item.status,
        'Status Reasons': item.statusReasons.join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suivi Résidents');
    XLSX.writeFile(workbook, 'suivi_residents.xlsx');
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

                let successCount = 0;
                let errorCount = 0;
                const formattedData = [];

                jsonData.forEach(row => {
                    try {
                        const projet = {
                            "id": extractName(row["Résident"]),
                            "type": row["Libellé"],
                            "state": row["Étape"],
                            "from": toISODateString(row["Du"]),
                            "to": toISODateString(row["Au"])
                        };

                        if (!projet.id || !projet.type || !projet.state || !projet.from) {
                            throw new Error("Missing required fields for projet.");
                        }

                        formattedData.push(projet);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                    }
                });

                resolve({ data: formattedData, successCount, errorCount });
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

                let successCount = 0;
                let errorCount = 0;
                const formattedData = [];
                let currentResident = null;

                for (let i = 1; i < sheetData.length; i++) {
                    try {
                        const row = sheetData[i];
                        if (row[0] && row[1] === undefined) {
                            currentResident = extractName(row[0]);
                        } else if (currentResident && row[1] && row[2]) {
                            const event = {
                                "id": currentResident,
                                "type": row[2],
                                "date": toISODateString(row[1])
                            };

                            if (!event.id || !event.type || !event.date) {
                                throw new Error("Missing required fields for vie sociale event.");
                            }

                            formattedData.push(event);
                            successCount++;
                        } else {
                            // This case can be an error if the row is not empty
                            if (row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
                                throw new Error("Invalid row format in vie sociale file.");
                            }
                        }
                    } catch (error) {
                        errorCount++;
                    }
                }

                if (formattedData.length === 0 && errorCount > 0) {
                    return reject(new Error("Aucune donnée valide n'a été trouvée dans le fichier Vie Sociale."));
                }

                resolve({ data: formattedData, successCount, errorCount });
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
