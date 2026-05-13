class ConfigService {
    /**
     * Собирает данные из DOM и сохраняет их в конфиг
     * @param {ShadowRoot} root - shadowRoot компонента ConfigTab
     */
    static save(root) {
        // 1. Получаем текущее состояние
        const saved = localStorage.getItem("CONFIG");
        
        // Проверка на случай если CONFIG еще не загружен
        const defaultConfig = typeof CONFIG !== 'undefined' ? CONFIG.config : { 
            temperature: {}, clock: {}, tabs: [], image: '' 
        };
        
        let newConfig = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultConfig));

        // Вспомогательные функции для безопасного получения значений
        const getVal = (id) => root.getElementById(id)?.value;
        const query = (selector) => root.querySelectorAll(selector);
        const queryOne = (selector) => root.querySelector(selector);

        // 2. Глобальные настройки
        const location = getVal('cfg-location');
        const clockColor = getVal('cfg-clock-color');
        const globalImg = getVal('cfg-global-image');

        if (location !== undefined) newConfig.temperature.location = location;
        if (clockColor !== undefined) newConfig.clock.iconColor = clockColor;
        if (globalImg !== undefined) newConfig.image = globalImg;

        // 3. Настройки вкладок (Общие параметры)
        query('.cfg-tab-name').forEach(i => {
            if (newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].name = i.value;
        });
        query('.cfg-tab-bg').forEach(i => {
            if (newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].background_url = i.value;
        });
        query('.cfg-tab-links-bg').forEach(i => {
            if (newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].links_background = i.value;
        });
        query('.cfg-tab-blur').forEach(i => {
            if (newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].links_blur = i.value;
        });
        query('.cfg-tab-opacity').forEach(i => {
            if (newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].links_opacity = i.value;
        });

        // 4. Пересборка ссылок и категорий
        newConfig.tabs.forEach((tab, tabIdx) => {
            tab.categories.forEach((cat, catIdx) => {
                const catName = queryOne(`.cfg-cat-name[data-tab="${tabIdx}"][data-cat="${catIdx}"]`)?.value;
                if (catName !== undefined) cat.name = catName;

                const updatedLinks = [];

                // Сбор существующих ссылок
                const linkRows = query(`.cfg-link-name[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
                linkRows.forEach((input) => {
                    const lIdx = input.dataset.link;
                    const name = input.value.trim();
                    const url = queryOne(`.cfg-link-url[data-tab="${tabIdx}"][data-cat="${catIdx}"][data-link="${lIdx}"]`)?.value.trim();
                    const icon = queryOne(`.cfg-link-icon[data-tab="${tabIdx}"][data-cat="${catIdx}"][data-link="${lIdx}"]`)?.value.trim();
                    const color = queryOne(`.cfg-link-color[data-tab="${tabIdx}"][data-cat="${catIdx}"][data-link="${lIdx}"]`)?.value;

                    if (name && url) {
                        updatedLinks.push({ 
                            name, 
                            url, 
                            icon: icon || "", 
                            icon_color: color || "#FFFFFF" 
                        });
                    }
                });

                // Сбор НОВОЙ ссылки
                const newName = queryOne(`.cfg-link-name-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`)?.value.trim();
                const newUrl = queryOne(`.cfg-link-url-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`)?.value.trim();
                
                if (newName && newUrl) {
                    const newIcon = queryOne(`.cfg-link-icon-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`)?.value.trim() || "";
                    const newColor = queryOne(`.cfg-link-color-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`)?.value || "#726f6f";
                    updatedLinks.push({ name: newName, url: newUrl, icon: newIcon, icon_color: newColor });
                }

                cat.links = updatedLinks;
            });
        });

        // 5. Финальное сохранение
        localStorage.setItem("CONFIG", JSON.stringify(newConfig));

        if (window.electronAPI) {
            window.electronAPI.send('config-save', JSON.stringify(newConfig));
        }

        // Перезагрузка для применения настроек
        setTimeout(() => window.location.reload(), 100);
    }
}

// РЕГИСТРАЦИЯ: Вот так мы делаем его доступным для ConfigTab
window.ConfigService = ConfigService;