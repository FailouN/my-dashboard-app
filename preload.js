// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
    'select-file',       
    'save-config',   
    'app-message', 
    'widget-update', 
    'go-back', 
    'show-context-menu', 
    'window-minimize',   
    'window-maximize',   
    'window-close',
    'fullscreen-toggled',
    'get-proxy-bypass-list', // Добавьте это
    'get-current-domain-for-proxy',
    'save-proxy-domain',     // Добавьте это
    'delete-proxy-domain'    // Добавьте это
];

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
            ipcRenderer.on(channel, (event, ...args) => callback(event, ...args));
        }
    },
    
    on: (channel, func) => {
        if (validChannels.includes(channel)) {
            const subscription = (event, ...args) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    },
    
    invoke: (channel, data) => {
        if (validChannels.includes(channel)) { // Рекомендуется проверять и здесь[cite: 3]
            return ipcRenderer.invoke(channel, data);
        }
    },
    // Теперь метод добавлен корректно через запятую[cite: 3]
    showMenu: () => ipcRenderer.invoke('show-context-menu') 
});

contextBridge.exposeInMainWorld('proxyAPI', {
    getBypassList: () => ipcRenderer.invoke('get-proxy-bypass-list'),
    addDomain: (domain) => ipcRenderer.invoke('save-proxy-domain', domain),
    removeDomain: (domain) => ipcRenderer.invoke('delete-proxy-domain', domain)
});