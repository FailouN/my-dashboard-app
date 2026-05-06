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
    'get-proxy-bypass-list',
    'get-current-domain-for-proxy',
    'save-proxy-domain',   
    'delete-proxy-domain',
    'hotkey-action' 
];

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            // Передаем только данные, игнорируя системные объекты
            ipcRenderer.send(channel, data);
        }
    },
    
    on: (channel, func) => {
        if (validChannels.includes(channel)) {
            // Создаем обертку, которая пробрасывает ТОЛЬКО полезную нагрузку (args)
            // и полностью отсекает объект event, который нельзя клонировать
            const subscription = (_event, ...args) => func(...args);
            
            ipcRenderer.on(channel, subscription);
            
            // Возвращаем функцию отписки (чистильщик)
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        }
    },
    
    invoke: (channel, data) => {
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    },
    
    showMenu: () => ipcRenderer.invoke('show-context-menu') 
});

// Для прокси лучше тоже использовать проверку каналов для безопасности
contextBridge.exposeInMainWorld('proxyAPI', {
    getBypassList: () => ipcRenderer.invoke('get-proxy-bypass-list'),
    addDomain: (domain) => ipcRenderer.invoke('save-proxy-domain', domain),
    removeDomain: (domain) => ipcRenderer.invoke('delete-proxy-domain', domain)
});