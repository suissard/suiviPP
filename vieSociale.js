// This file will process the Vie sociale.xlsx file.
const xlsx = require('xlsx');

function processVieSociale(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  const formattedData = {
    "Vie Sociale": []
  };

  let currentResident = null;
  // Start from 1 to skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Resident name is in the first column and the rest are empty
    if (row[0] && row[1] === undefined) {
      currentResident = row[0];
    } else if (currentResident && row[1] && row[2]) { // Make sure date and type are not empty
      formattedData["Vie Sociale"].push({
        "id": currentResident,
        "type": row[2], // "motif" is in the third column
        "date": row[1]  // "date" is in the second column
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
