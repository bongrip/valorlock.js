const WebSocket = require('ws');
const tls = require('tls');

const { getLockFileData } = require('../lockfile/lockfile');
const { autolock } = require('../game/game');
const {lockLog} = require('../logger');

let ws;

let MESSAGE_SUBSCRIBE = 5; 
let events = [
    'OnJsonApiEvent_chat_v4_presences',
    'OnJsonApiEvent_riot-messaging-service_v1_message',
    'OnJsonApiEvent_riot-messaging-service_v1_messages'
];

let matchId = "";

/*@ establish(agent_id)
@ creates a websocket connection to the websocket port given by getLockFileData().
*/

async function establish(agent_id) {
    try {
        const data = await getLockFileData();
        if (!data) return; 

        const authorizationHeader = 'Basic ' + Buffer.from(`riot:${data[3]}`).toString('base64');
        ws = new WebSocket(`wss://localhost:${data[2]}`, {
            rejectUnauthorized: false, 
            headers: { 
                Authorization: authorizationHeader
            }
        });

        ws.on('open', () => {
            lockLog(`CONNECTION`, `SUCCESS`, `CONNECTED`)
            events.forEach(evnt => {
                send([MESSAGE_SUBSCRIBE, evnt]); 
            });
        });

        let buffer = '';

        ws.on('message', (data) => {
            buffer += data;
        
            try {
                const jsonData = JSON.parse(buffer);
                buffer = '';

                if (jsonData[0] == 8 && jsonData[2].eventType == 'Create' && jsonData[2].uri.startsWith('/riot-messaging-service/v1/message/ares-pregame/pregame/v1/matches/')) {
                    const uri = jsonData[2].data.resource;
                    const uriParts = uri.split('/');
                    matchId = uriParts[uriParts.length - 1];
                    autolock(matchId, agent_id);
                }
        
            } catch (error) {
                if (error instanceof SyntaxError) {
                    // JSON is still incomplete, keep accumulating 
                } else {
                    console.error('Error parsing message data:', error);
                }
            }
        });
        
    } catch (error) {
        console.error('Error establishing connection:', error);
    }
}

function send(data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data)); 
    } else {
        console.error('WebSocket not ready. Data not sent.');
    }
}

module.exports = {
    establish,
    matchId
}
