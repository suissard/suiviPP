// This file will process the Residents.xlsx file.
const xlsx = require('xlsx');

function processResidents(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const formattedData = {
    "Résidents": data.map(row => ({
      "id": row["Résident"],
      "entry": row["Entrée"],
      "chNum": row["N° de chambre"]
    }))
  };

  return JSON.stringify(formattedData, null, 2);
}

// To run this file directly, you can uncomment the following lines:
// const path = require('path');
// const filePath = path.join(__dirname, 'test', 'Residents.xlsx');
// console.log(processResidents(filePath));

module.exports = processResidents;
