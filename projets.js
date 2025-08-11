// This file will process the Projets.xlsx file.
const xlsx = require('xlsx');

function processProjets(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const formattedData = {
    "Projets": data.map(row => ({
      "id": row["Résident"],
      "type": row["Libellé"],
      "state": row["Étape"],
      "from": row["Du"],
      "to": row["Au"]
    }))
  };

  return JSON.stringify(formattedData, null, 2);
}

// To run this file directly, you can uncomment the following lines:
// const path = require('path');
// const filePath = path.join(__dirname, 'test', 'Projets.xlsx');
// console.log(processProjets(filePath));

module.exports = processProjets;
