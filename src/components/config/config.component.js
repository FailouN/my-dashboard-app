class ConfigTab extends Component {
  refs = {
    config: '#config',
    save: '.save',
    close: '.close'
  };

  constructor() {
    super();
    const saved = localStorage.getItem("CONFIG");
    this.config = saved ? JSON.parse(saved) : CONFIG.config;
    this.iconNames = ["telegram", "brand-yandex", "brand-google", "2fa", "123", "settings", "home", "user", "mail", "device-desktop"];
    this.initIconNames();
  }

async initIconNames() {
    try {
        // Путь к вашему файлу стилей Tabler Icons
        // Убедитесь, что путь верный относительно index.html
        const response = await fetch('./src/css/tabler-icons.min.css'); 
        if (!response.ok) return;

        const cssText = await response.text();
        
        // Регулярное выражение для поиска имен классов[cite: 7]
        const regex = /\.ti-([a-z0-9-]+):before/g;
        const matches = [...cssText.matchAll(regex)];
        
        if (matches.length > 0) {
            // Создаем массив имен и удаляем дубликаты через Set
            const scannedNames = matches.map(match => match[1]);
            this.iconNames = [...new Set([...this.iconNames, ...scannedNames])];
            
            console.log(`Система: Загружено ${this.iconNames.length} иконок.`);
        }
    } catch (error) {
        console.warn("Не удалось автоматически загрузить список иконок:", error);
    }
}

  style() {
    return window.ConfigStyles || ''; 
}

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material
    ];
  }

  template() {
    // Вызываем глобальную функцию, которую мы создали в другом файле
    return window.getConfigTemplate(this.tabs);
}

  activate() {
    this.refs.config.classList.add('active');
  }

  deactivate() {
    this.refs.config.classList.remove('active');
  }

saveConfig() {
    // 1. Берем текущий конфиг
    const saved = localStorage.getItem("CONFIG");
    let newConfig = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(CONFIG.config));

    // 2. Считываем Глобальные настройки
    const locationVal = this.shadowRoot.getElementById('cfg-location')?.value;
    const clockColorVal = this.shadowRoot.getElementById('cfg-clock-color')?.value;
    const globalImageVal = this.shadowRoot.getElementById('cfg-global-image')?.value;

    if (locationVal !== undefined) newConfig.temperature.location = locationVal;
    if (clockColorVal !== undefined) newConfig.clock.iconColor = clockColorVal;
    if (globalImageVal !== undefined) newConfig.image = globalImageVal;

    // 3. Обновляем настройки вкладок
    this.shadowRoot.querySelectorAll('.cfg-tab-name').forEach(i => {
        if(newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].name = i.value;
    });
    this.shadowRoot.querySelectorAll('.cfg-tab-bg').forEach(i => {
        if(newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].background_url = i.value;
    });
    this.shadowRoot.querySelectorAll('.cfg-tab-links-bg').forEach(i => {
        if(newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].links_background = i.value;
    });
    this.shadowRoot.querySelectorAll('.cfg-tab-blur').forEach(i => {
        if(newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].links_blur = i.value;
    });
    this.shadowRoot.querySelectorAll('.cfg-tab-opacity').forEach(i => {
        if(newConfig.tabs[i.dataset.tab]) newConfig.tabs[i.dataset.tab].links_opacity = i.value;
    });

    // 4. ПЕРЕСБОРКА КАТЕГОРИЙ И ССЫЛОК (ОБНОВЛЕНО)
    newConfig.tabs.forEach((tab, tabIdx) => {
        tab.categories.forEach((cat, catIdx) => {
            const catNameInput = this.shadowRoot.querySelector(`.cfg-cat-name[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            if (catNameInput) cat.name = catNameInput.value;

            const updatedLinks = [];

            // Собираем существующие ссылки
            const rows = this.shadowRoot.querySelectorAll(`.cfg-link-name[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            rows.forEach((input) => {
                const linkIdx = input.dataset.link;
                const name = input.value.trim();
                const icon = this.shadowRoot.querySelector(`.cfg-link-icon[data-tab="${tabIdx}"][data-cat="${catIdx}"][data-link="${linkIdx}"]`)?.value.trim();
                const url = this.shadowRoot.querySelector(`.cfg-link-url[data-tab="${tabIdx}"][data-cat="${catIdx}"][data-link="${linkIdx}"]`)?.value.trim();
                
                // ЧИТАЕМ ЦВЕТ ДЛЯ СУЩЕСТВУЮЩЕЙ ССЫЛКИ
                const iconColor = this.shadowRoot.querySelector(`.cfg-link-color[data-tab="${tabIdx}"][data-cat="${catIdx}"][data-link="${linkIdx}"]`)?.value;

                if (name !== "" && url !== "") {
                    updatedLinks.push({ 
                        name, 
                        icon: icon,
                        icon_color: iconColor, // Добавляем в объект
                        url 
                    });
                }
            });

            // Проверяем поля для НОВОЙ ссылки
            const newNameInput = this.shadowRoot.querySelector(`.cfg-link-name-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            const newIconInput = this.shadowRoot.querySelector(`.cfg-link-icon-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            const newUrlInput = this.shadowRoot.querySelector(`.cfg-link-url-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            
            // ЧИТАЕМ ЦВЕТ ДЛЯ НОВОЙ ССЫЛКИ[cite: 5]
            const newIconColorInput = this.shadowRoot.querySelector(`.cfg-link-color-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);

            if (newNameInput && newUrlInput) {
                const newName = newNameInput.value.trim();
                const newUrl = newUrlInput.value.trim();
                const newIcon = newIconInput ? newIconInput.value.trim() : "";
                const newIconColor = newIconColorInput ? newIconColorInput.value : "#726f6f";

                if (newName !== "" && newUrl !== "") {
                    updatedLinks.push({ 
                        name: newName, 
                        icon: newIcon,
                        icon_color: newIconColor, // Добавляем в объект[cite: 5]
                        url: newUrl 
                    });
                }
            }

            cat.links = updatedLinks;
        });
    });

    // 5. Финальное сохранение
    localStorage.setItem("CONFIG", JSON.stringify(newConfig));
 
    if (window.electronAPI) {
        window.electronAPI.send('config-save', JSON.stringify(newConfig));
    }
    
    setTimeout(() => {
        location.reload();
    }, 100);
}

  setEvents() {
    // 1. Стандартные события (закрытие, выход)
    this.refs.config.onkeyup = (e) => { if (e.key === 'Escape') this.deactivate(); };
    this.shadowRoot.querySelector('.close').onclick = () => this.deactivate();
    this.shadowRoot.querySelector('.save-all').onclick = () => this.saveConfig();

    // 2. Сброс конфигурации
    this.shadowRoot.getElementById('reset-config').onclick = () => {
        if (confirm('Сбросить все настройки к исходным?')) {
            localStorage.removeItem("CONFIG");
            location.reload();
        }
    };

    // --- НОВОЕ: Живой поиск иконок ---
    const iconInputs = this.shadowRoot.querySelectorAll('.search-icon-input');
    
    iconInputs.forEach(input => {
        const suggestionsBox = input.nextElementSibling; // Это наш .icon-suggestions

        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            suggestionsBox.innerHTML = '';
            
            if (val.length < 1) {
                suggestionsBox.style.display = 'none';
                return;
            }

            // Фильтруем массив иконок (this.iconNames должен быть определен в constructor)
            const matches = this.iconNames
                .filter(name => name.includes(val))
                .slice(0, 15); // Ограничиваем список для производительности

            if (matches.length > 0) {
                suggestionsBox.style.display = 'block';
                matches.forEach(name => {
                    const item = document.createElement('div');
                    item.className = 'icon-suggestion-item';
                    item.innerHTML = `<i class="ti ti-${name}"></i><span>${name}</span>`;
                    
                    item.onclick = (e) => {
                        e.stopPropagation(); // Чтобы клик не ушел на родителя
                        input.value = name;
                        suggestionsBox.style.display = 'none';
                        // Генерируем событие input, чтобы сработали другие обработчики, если они есть
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    };
                    suggestionsBox.appendChild(item);
                });
            } else {
                suggestionsBox.style.display = 'none';
            }
        });
    });

    // Закрытие всех списков подсказок при клике в любом месте формы
    this.shadowRoot.addEventListener('click', () => {
        this.shadowRoot.querySelectorAll('.icon-suggestions').forEach(box => {
            box.style.display = 'none';
        });
    });
    // --- КОНЕЦ БЛОКА ПОИСКА ---

    // 3. Обработка кнопок выбора файлов (ОБЗОР)
    this.shadowRoot.querySelectorAll('.btn-browse').forEach(btn => {
        btn.onclick = async () => {
            const targetId = btn.dataset.target;
            const tabIdx = btn.dataset.tab;
            
            let input;
            if (tabIdx !== undefined) {
                input = this.shadowRoot.querySelector(`.${targetId}[data-tab="${tabIdx}"]`);
            } else {
                input = this.shadowRoot.getElementById(targetId);
            }

            if (!input) {
                console.error("Input not found for target:", targetId);
                return;
            }

            if (window.electronAPI && window.electronAPI.invoke) {
                try {
                    const newPath = await window.electronAPI.invoke('select-file');
                    if (newPath) {
                        input.value = newPath;
                        input.style.borderColor = '#a9b665';
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } catch (err) {
                    console.error("Ошибка при выборе файла:", err);
                }
            } else {
                console.warn("Electron API недоступен. Проверьте preload.js");
            }
        };
    });
}

  setConfig() {
    this.refs.textarea.value =  JSON.stringify(this.config, null, 4);
  }

  connectedCallback() {
    this.render().then(() => {
      this.setEvents();
    });
  }
}
