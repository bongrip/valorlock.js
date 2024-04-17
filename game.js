const { getLockFileData } = require('../lockfile/lockfile');
const ws = require('../websocket/ws');
const { entitlementToken, entitlementAccess, getEntitlementToken } = require('./entitlementToken');
const fetch = require('node-fetch');

const {lockLog} = require('../logger')

let autolockedIds = []

/*@ autolock(pregameId, agent_id)
@ autolock an agent with a randomly generated, realistic delay within requests
*/

function encodeJSONRiotLike(data) {
  return JSON.stringify(data, null, '\t').replace(/\n/gi, '\r\n')
}

async function autolock(pregameId, agent_id) {
    try {
        if (autolockedIds.includes(pregameId)) return;
        const lockFileData = await getLockFileData(); 
        const fullEntitlements = await getEntitlementToken(); 

        const [bearerToken, entitlementJWT] = fullEntitlements.split(":");

        if (!pregameId || !bearerToken || !entitlementJWT) { 
            handleLockError('Missing lock data', 400); 
            return;
        }

        lockLog(`SELECT`, `sending`, `PENDING`)
        setTimeout(async () => {
            const response = await fetch(`https://glz-na-1.na.a.pvp.net/pregame/v1/matches/${pregameId}/select/${agent_id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${bearerToken}`,
                    "X-Riot-Entitlements-JWT": entitlementJWT,
                    "X-Riot-ClientPlatform": btoa(
                        encodeJSONRiotLike({
                            platformType: "PC",
                            platformOS: "Windows",
                            platformOSVersion: "10.0.19044.1.256.64bit",
                            platformChipset: "Unknown"
                        })
                    ),
                    "X-Riot-ClientVersion": "release-08.07-shipping-9-2444158",
                    "User-Agent": "Shooter Game/22 Windows/10.0.19044.1.256.64bit"
                }
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                handleLockError(errorText, response.status);
                return; 
            } else {
                lockLog(`SELECT`, `sending`, `SUCCESS`)
                lockLog(`LOCK`, `sending`, `PENDING`)
                setTimeout(async () => {
                    const response_lock = await fetch(`https://glz-na-1.na.a.pvp.net/pregame/v1/matches/${pregameId}/lock/${agent_id}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${bearerToken}`,
                            "X-Riot-Entitlements-JWT": entitlementJWT,
                            "X-Riot-ClientPlatform": btoa(
                                encodeJSONRiotLike({
                                    platformType: "PC",
                                    platformOS: "Windows",
                                    platformOSVersion: "10.0.19044.1.256.64bit",
                                    platformChipset: "Unknown"
                                })
                            ),
                            "X-Riot-ClientVersion": "release-08.07-shipping-9-2444158",
                            "User-Agent": "Shooter Game/22 Windows/10.0.19044.1.256.64bit"
                        }
                    });
    
                    if (response_lock.ok) {
                        lockLog(`LOCK`, `sending`, `SUCCESS`)
                    }
                }, getRandomDelay(400, 550))
            }
        }, getRandomDelay(5000, 5700))
        autolockedIds.push(pregameId);

    } catch (ex) {
        console.error('An error occurred in autolock:', ex.message);
    }
}

function handleLockError(errorText, responseStatus) {
    console.error('---------- IMPORTANT ------------');
    console.error('Lock request failed:', errorText);
    console.error('Error Code:', responseStatus);
    console.error('---------- IMPORTANT ------------');
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

module.exports = { autolock };
