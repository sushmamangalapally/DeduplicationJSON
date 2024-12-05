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
    const uniqueIDMap = {};
    const uniqueEmailMap = {};

    for (let data of jsonLeadData) {
        const id = data["_id"];
        // Check if hashmap for data ID exists and update
        if (uniqueIDMap[id]) {
            const currentDate = new Date(data["entryDate"]);
            const existingDate = new Date(uniqueIDMap[id]["entryDate"]);
            // Update if the current data is last updated
            if (currentDate >= existingDate) {
                trackChange(id, JSON.stringify(uniqueIDMap[id]), JSON.stringify(data));
                uniqueIDMap[id] = data;
            }
        } else {
            uniqueIDMap[id] = data;
        }
    }

    // Looping through hashset that was created from previous step
    for (let dataID in uniqueIDMap) {
        const data = uniqueIDMap[dataID];
        const email = uniqueIDMap[dataID]["email"];
        // Check if hashmap for data email exists and update
        if (uniqueEmailMap[email]) {
            const currentDate = new Date(data["entryDate"]);
            const existingDate = new Date(uniqueEmailMap[email]["entryDate"]);
            // Update if the current data is last updated
            if (currentDate >= existingDate) {
                trackChange(data["_id"], JSON.stringify(uniqueEmailMap[email]), JSON.stringify(data));
                uniqueEmailMap[email] = data;
            }
        } else {
            uniqueEmailMap[email] = data;
        }
    }
    const result = [];
    // Then we add to result array
    for (let data in uniqueEmailMap) {
        result.push(uniqueEmailMap[data]);
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
