export function setupLogging() {
    const logContainer = document.getElementById('log-container');
    if (!logContainer) {
        console.error('Log container not found');
        return;
    }
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        const logMessage = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        const isBonusLog = /horizontal_arrow|vertical_arrow|bonus_star/.test(logMessage);
        const colorClass = isBonusLog ? 'bonus-log' : 'default-log';
        logContainer.innerHTML += `<span class="${colorClass}">${logMessage}</span>\n`;
        logContainer.scrollTop = logContainer.scrollHeight;
    };
    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        const logMessage = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        const isBonusLog = /horizontal_arrow|vertical_arrow|bonus_star/.test(logMessage);
        const colorClass = isBonusLog ? 'bonus-log' : 'default-log';
        logContainer.innerHTML += `<span class="${colorClass}">ERROR: ${logMessage}</span>\n`;
        logContainer.scrollTop = logContainer.scrollHeight;
    };

    window.onerror = function (msg, url, lineNo, columnNo, error) {
        const errorMessage = `Uncaught error: ${msg} at ${url}:${lineNo}:${columnNo}\nStack: ${error?.stack || 'N/A'}`;
        logContainer.innerHTML += `<span style="color: #ff0000">${errorMessage}</span>\n`;
        console.error(errorMessage);
        return false;
    };
}
