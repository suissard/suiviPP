// This file will process the Projets.xlsx file.
const xlsx = require('xlsx');

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

function toISODateString(date, fromDateString = null) {
    if (!date) {
        if (fromDateString) {
            const fromDate = new Date(fromDateString);
            if (!isNaN(fromDate.getTime())) {
                fromDate.setFullYear(fromDate.getFullYear() + 1);
                const year = fromDate.getFullYear();
                const month = String(fromDate.getMonth() + 1).padStart(2, '0');
                const day = String(fromDate.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }
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
        // It could be an Excel serial number. The xlsx library should have converted it with cellDates:true,
        // but as a fallback, we can try to convert it.
        d = new Date(Date.UTC(0, 0, date - 1));
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

function processProjets(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { cellDates: true });

  const formattedData = {
    "Projets": data.map(row => {
      const from = toISODateString(row["Du"]);
      if (!from) {
        console.error(`Date "Du" manquante pour le projet "${row["Libellé"]}" du résident "${row["Résident"]}"`);
      }
      if (!row["Au"]) {
        console.error(`Date "Au" manquante pour le projet "${row["Libellé"]}" du résident "${row["Résident"]}"`);
      }
      const to = toISODateString(row["Au"], from);
      return {
        "id": extractName(row["Résident"]),
        "type": row["Libellé"],
        "state": row["Étape"],
        "from": from,
        "to": to
      };
    })
  };

  return JSON.stringify(formattedData, null, 2);
}

// To run this file directly, you can uncomment the following lines:
// const path = require('path');
// const filePath = path.join(__dirname, 'test', 'Projets.xlsx');
// console.log(processProjets(filePath));

module.exports = processProjets;
