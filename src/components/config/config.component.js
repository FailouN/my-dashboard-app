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
  }

  style() {
    return `
      #config {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: rgb(24 24 29 / 95%);
          z-index: 99;
          visibility: hidden;
          top: -100%;
          backdrop-filter: blur(10px);
          transition: all .3s ease-in-out;
      }

      #config.active { 
          top: 0; 
          visibility: visible; 
      }

      .config-form {
          width: 60%;
          max-height: 80vh;
          overflow-y: auto;
          padding: 20px;
          color: #d4be98;
          font-family: 'Roboto', sans-serif;
      }

      /* Стили для скроллбара внутри формы */
      .config-form::-webkit-scrollbar {
          width: 5px;
      }
      .config-form::-webkit-scrollbar-thumb {
          background: #504945;
          border-radius: 10px;
      }

      .field-group { 
          margin-bottom: 20px; 
          display: flex; 
          flex-direction: column; 
      }

      label { 
          font-size: 10pt; 
          margin-bottom: 8px; 
          color: #a9b665; 
          text-transform: uppercase; 
          letter-spacing: 1px;
      }

      input {
          background: #32302f;
          border: 1px solid #504945;
          color: #d4be98;
          padding: 12px;
          outline: none;
          border-radius: 4px;
          font-size: 14px;
      }

      input:focus { 
          border-color: #d4be98; 
          background: #3c3836;
      }

      .save-all, #reset-config {
    position: absolute;
    right: 32px; /* Выравниваем ровно по крестику */
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 11px; /* Маленький аккуратный шрифт */
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: color 0.2s;
}

/* Кнопка сохранения - оливковый оттенок в тон проекта */
.save-all {
    top: 65px; 
    color: #a9b665;
}

/* Кнопка сброса - приглушенный красный */
#reset-config {
    top: 90px; /* Ставим чуть ниже сохранения */
    color: #ea6962;
    opacity: 0.8;
}

/* Эффект при наведении */
.save-all:hover { color: #89b482; }
#reset-config:hover { opacity: 1; text-decoration: underline; }

/* Стиль самого крестика для единообразия */
.close { 
    position: absolute; 
    right: 30px; 
    top: 30px; 
    background: 0; 
    border: 0; 
    color: #d4be98; 
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
}
    `;
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material
    ];
  }

  template() {
    const tabsEditorHtml = CONFIG.config.tabs.map((tab, tabIdx) => `
      <div class="tab-edit-section" style="border: 1px solid #504945; padding: 15px; margin-bottom: 25px; border-radius: 8px;">
        <h3 style="color: #fabd2f; margin-top: 0;">Страница №${tabIdx + 1}</h3>
        
        <div class="field-group">
            <label>Название вкладки:</label>
            <input type="text" class="cfg-tab-name" data-tab="${tabIdx}" value="${tab.name}">
        </div>

        <div class="field-group">
            <label>Баннер страницы (картинка слева):</label>
            <div style="display: flex; gap: 10px;">
                <input type="text" class="cfg-tab-bg" data-tab="${tabIdx}" value="${tab.background_url || ''}" style="flex: 1;">
                <button class="btn-browse" data-target="cfg-tab-bg" data-tab="${tabIdx}" style="padding: 0 10px; background: #504945; color: #d4be98; border: 1px solid #7c6f64; cursor: pointer; border-radius: 4px; font-size: 10px;">ОБЗОР</button>
            </div>
        </div>

        <div class="field-group">
            <label>Фон ссылок (картинка справа):</label>
            <div style="display: flex; gap: 10px;">
                <input type="text" class="cfg-tab-links-bg" data-tab="${tabIdx}" value="${tab.links_background || ''}" style="flex: 1;">
                <button class="btn-browse" data-target="cfg-tab-links-bg" data-tab="${tabIdx}" style="padding: 0 10px; background: #504945; color: #d4be98; border: 1px solid #7c6f64; cursor: pointer; border-radius: 4px; font-size: 10px;">ОБЗОР</button>
            </div>
        </div>

        <div class="field-group">
          <label>РАЗМЫТИЕ: <span id="val-blur-${tabIdx}">${tab.links_blur || 20}</span>PX</label>
          <input type="range" class="cfg-tab-blur" data-tab="${tabIdx}" min="0" max="100" 
          value="${tab.links_blur || 20}" 
          oninput="this.parentNode.querySelector('span').innerText = this.value">
        </div>

        <div class="field-group">
         <label>ЗАТЕМНЕНИЕ: <span id="val-opp-${tabIdx}">${tab.links_opacity || 0.7}</span></label>
         <input type="range" class="cfg-tab-opacity" data-tab="${tabIdx}" min="0" max="1" step="0.1" 
         value="${tab.links_opacity || 0.7}"
         oninput="this.parentNode.querySelector('span').innerText = this.value">
        </div>

        ${tab.categories.map((category, catIdx) => `
          <div class="category-edit-block" style="background: #32302f; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
            <label style="color: #ea6962; font-weight: bold;">Папка: ${category.name}</label>
            <input type="text" class="cfg-cat-name" data-tab="${tabIdx}" data-cat="${catIdx}" value="${category.name}" style="width: 100%; margin-bottom: 10px;">
            
            <label style="font-size: 8pt; color: #7c6f64;">Ссылки (Имя | Иконка | URL):</label>
            
            ${category.links.map((link, linkIdx) => `
              <div class="link-edit-row" style="display: flex; gap: 5px; margin-bottom: 8px;">
                <input type="text" class="cfg-link-name" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.name}" placeholder="Имя (пусто для удаления)" style="flex: 1;">
                <input type="text" class="cfg-link-icon" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.icon}" placeholder="Иконка" style="flex: 1;">
                <input type="text" class="cfg-link-url" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.url}" placeholder="URL" style="flex: 2;">
              </div>
            `).join('')}

            <div class="link-edit-row new-link-row" style="display: flex; gap: 5px; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #504945;">
                <input type="text" class="cfg-link-name-new" data-tab="${tabIdx}" data-cat="${catIdx}" placeholder="+ Добавить имя" style="flex: 1; background: #3c3836;">
                <input type="text" class="cfg-link-icon-new" data-tab="${tabIdx}" data-cat="${catIdx}" placeholder="Иконка" style="flex: 1; background: #3c3836;">
                <input type="text" class="cfg-link-url-new" data-tab="${tabIdx}" data-cat="${catIdx}" placeholder="URL" style="flex: 2; background: #3c3836;">
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
        <div id="config">
          <button class="close"><i class="material-icons">close</i></button>
          <div class="config-form">
            <h2 style="text-align: center; color: #a9b665; margin-bottom: 30px;">НАСТРОЙКИ ИНТЕРФЕЙСА</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #32302f; padding: 20px; border-radius: 8px;">
              <div class="field-group">
                  <label>Город (Погода):</label>
                  <input type="text" id="cfg-location" value="${CONFIG.config.temperature.location}">
              </div>
              <div class="field-group">
                  <label>Цвет часов:</label>
                  <input type="text" id="cfg-clock-color" value="${CONFIG.config.clock.iconColor}">
              </div>
              <div class="field-group" style="grid-column: span 2;">
                  <label>Задний фон приложения (background.png):</label>
                  <div style="display: flex; gap: 10px;">
                    <input type="text" id="cfg-global-image" value="${CONFIG.config.image || ''}" style="flex: 1;">
                    <button class="btn-browse" data-target="cfg-global-image" style="padding: 0 15px; background: #504945; color: #d4be98; border: 1px solid #7c6f64; cursor: pointer; border-radius: 4px;">ОБЗОР</button>
                  </div>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #504945; margin: 30px 0;">
            ${tabsEditorHtml}

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="save-all">СОХРАНИТЬ</button>
                <button id="reset-config">СБРОС</button>
            </div>
            <div style="height: 50px;"></div>
          </div>
        </div>
    `;
}

  activate() {
    this.refs.config.classList.add('active');
  }

  deactivate() {
    this.refs.config.classList.remove('active');
  }

saveConfig() {
    // 1. Берем текущий конфиг из localStorage, если он там есть. 
    // Если нет - берем дефолтный из CONFIG.config.
    const saved = localStorage.getItem("CONFIG");
    let newConfig = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(CONFIG.config));

    // 2. Считываем Глобальные настройки
    // Используем опциональную цепочку ?. на случай, если элементов нет в DOM
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

    // 4. ПЕРЕСБОРКА КАТЕГОРИЙ И ССЫЛОК
    newConfig.tabs.forEach((tab, tabIdx) => {
        tab.categories.forEach((cat, catIdx) => {
            // Обновляем название категории
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

                if (name !== "" && url !== "") {
    updatedLinks.push({ 
        name, 
        icon: icon, // Сохраняем как есть (пустоту в том числе)
        url 
    });
                }
            });

            // Проверяем поля для НОВОЙ ссылки
            const newNameInput = this.shadowRoot.querySelector(`.cfg-link-name-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            const newIconInput = this.shadowRoot.querySelector(`.cfg-link-icon-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);
            const newUrlInput = this.shadowRoot.querySelector(`.cfg-link-url-new[data-tab="${tabIdx}"][data-cat="${catIdx}"]`);

            if (newNameInput && newUrlInput) {
                const newName = newNameInput.value.trim();
                const newUrl = newUrlInput.value.trim();
                const newIcon = newIconInput ? newIconInput.value.trim() : "";

               if (newName !== "" && newUrl !== "") {
    updatedLinks.push({ 
        name: newName, 
        icon: newIcon, // Сохраняем как есть
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
    
    // Даем небольшую задержку перед перезагрузкой, чтобы localStorage успел записаться (для надежности)
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

    // 3. Обработка кнопок выбора файлов (ОБЗОР)
    this.shadowRoot.querySelectorAll('.btn-browse').forEach(btn => {
        btn.onclick = async () => {
            const targetId = btn.dataset.target;
            const tabIdx = btn.dataset.tab;
            
            let input;
            // Поиск инпута в зависимости от того, глобальный он или принадлежит вкладке
            if (tabIdx !== undefined) {
                input = this.shadowRoot.querySelector(`.${targetId}[data-tab="${tabIdx}"]`);
            } else {
                input = this.shadowRoot.getElementById(targetId);
            }

            if (!input) {
                console.error("Input not found for target:", targetId);
                return;
            }

            // ИСПОЛЬЗУЕМ ВАШ МОСТ ИЗ PRELOAD.JS
            // Вместо ipcRenderer.invoke используем window.electronAPI.invoke
            if (window.electronAPI && window.electronAPI.invoke) {
                try {
                    const newPath = await window.electronAPI.invoke('select-file');
                    
                    if (newPath) {
                        input.value = newPath;
                        input.style.borderColor = '#a9b665';
                        // Генерируем событие, чтобы форма "заметила" изменения
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
