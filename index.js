const ws = require('./valorant/websocket/ws');
const { getFmt, lockLog } = require('./valorant/logger');
const readline = require('readline-sync');
const agent_data = require('./agent_data.json');

console.clear();

let agent = readline.question(`[${getFmt()}] ENTER AGENT NAME: `).toLowerCase();
if (!agent_data.hasOwnProperty(agent)) return console.log(`[${getFmt()}] INVALID AGENT, A LIST OF VALID AGENTS CAN BE FOUND IN AGENT_DATA.JSON`);

lockLog(`CONFIGURATION`, `UUID_SUCCESS`, `SELECTED AGENT: ${agent_data[agent].uuid} (${agent})`);
lockLog(`INITIALIZATION`, `SUCCESS`, `SUCCESSFUL (0)`);

ws.establish(agent_data[agent].uuid);
