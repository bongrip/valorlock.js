function lockLog(stage, text, state) {
    const now = new Date();

    const formattedDate = now.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    }) + '|' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
    });
    console.log(`[${formattedDate}] ` + `${stage.toUpperCase()} ${state.toUpperCase()}`)
}

function getFmt() {
    const now = new Date();

    const formattedDate = now.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    }) + '|' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
    });

    return formattedDate;
}

module.exports = { lockLog, getFmt }
