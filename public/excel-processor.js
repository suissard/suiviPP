function processFiles(files) {
    return new Promise((resolve, reject) => {
        const processedData = {
            residents: [],
            projets: [],
            vieSociale: []
        };

        if (files.length === 0) {
            return reject(new Error('No files selected.'));
        }

        let filesProcessed = 0;

        for (const file of files) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    if (file.name.toLowerCase().includes('residents')) {
                        const sheetName = workbook.SheetNames[0];
                        processedData.residents = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    } else if (file.name.toLowerCase().includes('projets')) {
                        const sheetName = workbook.SheetNames[0];
                        processedData.projets = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    } else if (file.name.toLowerCase().includes('vie sociale')) {
                        const sheetName = workbook.SheetNames[0];
                        processedData.vieSociale = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    }

                    filesProcessed++;
                    if (filesProcessed === files.length) {
                        resolve(processedData);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        }
    });
}
