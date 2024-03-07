const { getLockFileData } = require('../lockfile/lockfile');
const fetch = require('node-fetch'); // Assuming you've installed node-fetch

let entitlementAccess = "";
let entitlementToken = "";

/*@ getEntitlementToken()
@ creates an entitlement token from the local api
*/

async function getEntitlementToken() {
  try {
    const data = await getLockFileData();

    const https = require('https'); // Import the HTTPS module
    const agent = new https.Agent({ 
      rejectUnauthorized: false 
    });

    const response = await fetch(`https://localhost:${data[2]}/entitlements/v1/token`, {
      method: "GET",
      agent: agent,
      headers: {
        "Authorization": "Basic " + Buffer.from(`riot:${data[3]}`).toString('base64')
      }
    });

    if (!response.ok) {
      throw new Error(`Entitlement request failed: ${response.status}`);
    }

    const responseData = await response.json();
    entitlementAccess = responseData.accessToken;
    entitlementToken = responseData.token;
    return entitlementAccess + ":" + entitlementToken;
  } catch (ex) {
    console.log(`failed to get entitlement: `, ex);
  }
}

module.exports = {
  entitlementAccess,
  entitlementToken,
  getEntitlementToken
}
