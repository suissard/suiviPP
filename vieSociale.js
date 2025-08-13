// This file will process the Vie sociale.xlsx file.
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

function processVieSociale(filePath) {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  const formattedData = {
    "Vie Sociale": []
  };

  let currentResident = null;
  // Start from 1 to skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Resident name is in the first column and the rest are empty
    if (row[0] && row[1] === undefined) {
      currentResident = extractName(row[0]);
    } else if (currentResident && row[1] && row[2]) { // Make sure date and type are not empty
      formattedData["Vie Sociale"].push({
        "id": currentResident,
        "type": row[2], // "motif" is in the third column
        "date": toISODateString(row[1])  // "date" is in the second column
      });
    }
  }

  return JSON.stringify(formattedData, null, 2);
}

// To run this file directly, you can uncomment the following lines:
// const path = require('path');
// const filePath = path.join(__dirname, 'test', 'Vie sociale.xlsx');
// console.log(processVieSociale(filePath));

module.exports = processVieSociale;
