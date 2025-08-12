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

function processProjets(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const formattedData = {
    "Projets": data.map(row => ({
      "id": extractName(row["Résident"]),
      "type": row["Libellé"],
      "state": row["Étape"],
      "from": new Date(row["Du"]),
      "to": new Date(row["Au"])
    }))
  };

  return JSON.stringify(formattedData, null, 2);
}

// To run this file directly, you can uncomment the following lines:
// const path = require('path');
// const filePath = path.join(__dirname, 'test', 'Projets.xlsx');
// console.log(processProjets(filePath));

module.exports = processProjets;
