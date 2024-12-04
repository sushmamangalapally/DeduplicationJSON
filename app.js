const fs = require('fs');
// Create global variable so we can keep track of the changes
const changeLog = [];

// Read the JSON file
fs.readFile('leads.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Parse the JSON data
  try {
    const jsonData = JSON.parse(data);
    const jsonLeadData = jsonData.leads;
    jsonData.leads = deDuplicateJSONRecords(jsonLeadData, changeLog);

    console.log(jsonData);
    console.log(changeLog);

    // Prints in files
    fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));
    fs.writeFileSync('changeLogs.json', JSON.stringify(changeLog, null, 2));
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});

/**
 * Using an array to keep track of changed values
 *
 * @param {Array} jsonLeadData - Array of data
 * @returns {Array} Newly updated of deduped data
 */
function deDuplicateJSONRecords(jsonLeadData) {
    const hashIDMap = {};
    const hashEmailMap = {};

    for (let data of jsonLeadData) {
        const dataID = data["_id"];
        // Check if hashmap for data ID exists and update
        if (hashIDMap[dataID]) {
            const currentDate = new Date(data["entryDate"]);
            const dataDate = new Date(hashIDMap[dataID]["entryDate"]);
            // Update if the current data is last updated
            if (dataDate < currentDate) {
                trackChange(dataID, JSON.stringify(hashIDMap[dataID]), JSON.stringify(data));
                hashIDMap[dataID] = data;
            }
        } else {
            hashIDMap[dataID] = data;
        }


        // Check if hashmap for data email exists and update
        const dataEmail = data["email"];
        if (hashEmailMap[dataEmail]) {
            const currentDate = new Date(data["entryDate"]);
            const dataDate = new Date(hashEmailMap[dataEmail]["entryDate"]);
            // Update if the current data is last updated
            if (dataDate < currentDate) {
                trackChange(dataID, JSON.stringify(hashEmailMap[dataEmail]), JSON.stringify(data));
                hashEmailMap[dataEmail] = data;
            }
        } else {
            hashEmailMap[dataEmail] = data;
        }
    }

    const result = [];
    // Then we check for both IDs and emails
    const seenDataIds = new Set();
    const seenDataEmails = new Set();
    for (let dataID in hashIDMap) {
        const dataItem = hashIDMap[dataID];
        if (!seenDataIds.has(dataID) && !seenDataEmails.has(dataItem["email"])) {
            result.push(hashIDMap[dataID]);
            seenDataIds.add(dataID);
            seenDataEmails.add(dataItem["email"]);
        }
    }
    return result;
}

/**
 * Using an array to keep track of changed values
 *
 * @param {number} variable - ID of the data
 * @param {String} valueFrom - Former value
 * @param {String} valueTo - New value
 * @returns {Array} An array of change logs
 */
function trackChange(variable, valueFrom, valueTo) {
    changeLog.push({
      id: variable,
      valueFrom: valueFrom,
      valueTo: valueTo
    });
}
