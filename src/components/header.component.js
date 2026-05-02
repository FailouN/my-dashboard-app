// src/components/header.component.js

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

    // Проверяем наличие API перед использованием
    if (window.electronAPI) {
        document.getElementById('app-menu-btn').onclick = () => {
            window.electronAPI.invoke('show-context-menu');
        };

        document.getElementById('min-btn').onclick = () => window.electronAPI.invoke('window-minimize');
        document.getElementById('max-btn').onclick = () => window.electronAPI.invoke('window-maximize');
        document.getElementById('close-btn').onclick = () => window.electronAPI.invoke('window-close');
    }
}

// Слушатель событий: убираем 'event', так как в preload.js он уже отфильтрован
if (window.electronAPI && window.electronAPI.on) {
    window.electronAPI.on('fullscreen-toggled', (isFullScreen) => { // Исправлено: только один аргумент
        if (isFullScreen) {
            document.body.classList.add('fullscreen-mode');
        } else {
            document.body.classList.remove('fullscreen-mode');
        }
    });
}

// Делаем функцию глобальной для вызова из index.html
window.createHeader = createHeader;