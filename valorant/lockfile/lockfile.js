const fs = require('fs').promises;
const os = require('os');

const path = require('path');
const username = os.userInfo().username;

/*@ getLockFileData()
@ returns data of users lockfile, seperated by : 
*/

async function getLockFileData() {
    const lockfilePath = path.join('C:\\', 'Users', username, 'AppData', 'Local', 'Riot Games', 'Riot Client', 'Config', 'lockfile');
    try {
        const data = await fs.readFile(lockfilePath, "utf-8");
        const lockfiledata = data.trim().split(':');
        return lockfiledata; 
    } catch (err) {
        console.log('failed to get lockfile data.', err);
        return null; 
    }
}

module.exports = { 
    getLockFileData
}
