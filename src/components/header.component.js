// src/components/header.component.js
const { ipcRenderer } = require('electron'); 

function createHeader() {
    const header = document.createElement('header');
    header.id = 'app-header';
    header.innerHTML = `
   <button id="app-menu-btn" style="margin-right: 10px; cursor: pointer;">☰ Меню</button>
        <div class="header-drag-area">
            <div class="header-logo">
                <img src="src/img/logo.ico" width="16" height="16" style="margin-right: 8px;">
                <span>WebHub Desktop</span>
            </div>
        </div>
        <div class="header-controls">
            <button id="min-btn">—</button>
            <button id="max-btn">▢</button>
            <button id="close-btn">✕</button>
        </div>
    `;

    document.body.prepend(header);

    // Вызов системного меню
    document.getElementById('app-menu-btn').onclick = (e) => {
        ipcRenderer.send('show-context-menu');
    };

    // Управление окном
    document.getElementById('min-btn').onclick = () => ipcRenderer.send('window-minimize');
    document.getElementById('max-btn').onclick = () => ipcRenderer.send('window-maximize');
    document.getElementById('close-btn').onclick = () => ipcRenderer.send('window-close');
}

// Внутри или после функции createHeader в header.component.js
ipcRenderer.on('fullscreen-toggled', (event, isFullScreen) => {
    if (isFullScreen) {
        document.body.classList.add('fullscreen-mode');
    } else {
        document.body.classList.remove('fullscreen-mode');
    }
});

module.exports = createHeader;