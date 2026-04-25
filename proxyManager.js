// Используем встроенные модули через window.require (специфика Electron)
const fs = window.require('fs');
const path = window.require('path');
const { ipcRenderer } = window.require('electron');

const userDataPath = window.process.env.APPDATA || (window.process.platform == 'darwin' ? window.process.env.HOME + '/Library/Application Support' : window.process.env.HOME + "/.config");
// Убедись, что папка WebHub-Desktop-profile совпадает с той, что в main.js
const proxyFilePath = path.join(userDataPath, 'WebHub-Desktop-profile', 'proxy_bypass.json');

export const ProxyManager = {
    list() {
        if (!fs.existsSync(proxyFilePath)) return [];
        try {
            return JSON.parse(fs.readFileSync(proxyFilePath, 'utf8'));
        } catch (e) { return []; }
    },

    add(domain) {
        if (!domain || domain.trim() === "") return;
        ipcRenderer.send('save-proxy-domain', domain.trim());
        // Даем время файлу записаться перед обновлением UI
        setTimeout(() => this.render(), 100);
    },

    remove(domain) {
        ipcRenderer.send('delete-proxy-domain', domain);
        setTimeout(() => this.render(), 100);
    },

    render() {
        const container = document.getElementById('proxy-list-container');
        if (!container) return;

        const domains = this.list();
        container.innerHTML = domains.map(d => `
            <div class="proxy-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background: #32302f; padding: 8px 12px; border-radius: 4px; border: 1px solid #504945;">
                <span style="color: #ebdbb2; font-size: 14px;">${d}</span>
                <button onclick="ProxyManager.remove('${d}')" style="background:none; border:none; color:#fb4934; cursor:pointer; font-size: 18px; line-height: 1;">&times;</button>
            </div>
        `).join('');
    }
};