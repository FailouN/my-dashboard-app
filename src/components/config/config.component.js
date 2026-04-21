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
            <input type="text" class="cfg-tab-bg" data-tab="${tabIdx}" value="${tab.background_url || ''}">
        </div>

        <div class="field-group">
            <label>Фон ссылок (картинка справа):</label>
            <input type="text" class="cfg-tab-links-bg" data-tab="${tabIdx}" value="${tab.links_background || ''}">
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
                <input type="text" class="cfg-link-name" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.name}" placeholder="Имя" style="flex: 1;">
                <input type="text" class="cfg-link-icon" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.icon}" placeholder="Иконка" style="flex: 1;">
                <input type="text" class="cfg-link-url" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.url}" placeholder="URL" style="flex: 2;">
              </div>
            `).join('')}
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
                  <input type="text" id="cfg-global-image" value="${CONFIG.config.image || ''}">
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
    const newConfig = JSON.parse(JSON.stringify(CONFIG.config));

    // 1. Погода, Цвет и Глобальный фон
    newConfig.temperature.location = this.shadowRoot.getElementById('cfg-location').value;
    newConfig.clock.iconColor = this.shadowRoot.getElementById('cfg-clock-color').value;
    newConfig.image = this.shadowRoot.getElementById('cfg-global-image').value;

    // 2. Названия вкладок и баннеры
    this.shadowRoot.querySelectorAll('.cfg-tab-name').forEach(i => {
        newConfig.tabs[i.dataset.tab].name = i.value;
    });
    
    this.shadowRoot.querySelectorAll('.cfg-tab-bg').forEach(i => {
        newConfig.tabs[i.dataset.tab].background_url = i.value;
    });

    this.shadowRoot.querySelectorAll('.cfg-tab-links-bg').forEach(i => {
         newConfig.tabs[i.dataset.tab].links_background = i.value;
    });

    // 3. Названия папок (категорий)
    this.shadowRoot.querySelectorAll('.cfg-cat-name').forEach(i => {
        newConfig.tabs[i.dataset.tab].categories[i.dataset.cat].name = i.value;
    });

    // --- ВОТ ЭТОТ БЛОК НУЖНО ДОБАВИТЬ ДЛЯ ССЫЛОК ---
    // Сохраняем имена ссылок
    this.shadowRoot.querySelectorAll('.cfg-link-name').forEach(i => {
        const d = i.dataset; 
        newConfig.tabs[d.tab].categories[d.cat].links[d.link].name = i.value;
    });
    // Сохраняем иконки ссылок
    this.shadowRoot.querySelectorAll('.cfg-link-icon').forEach(i => {
        const d = i.dataset; 
        newConfig.tabs[d.tab].categories[d.cat].links[d.link].icon = i.value;
    });
    // Сохраняем URL ссылок
    this.shadowRoot.querySelectorAll('.cfg-link-url').forEach(i => {
        const d = i.dataset; 
        newConfig.tabs[d.tab].categories[d.cat].links[d.link].url = i.value;
    });
 
    this.shadowRoot.querySelectorAll('.cfg-tab-blur').forEach(i => {
    newConfig.tabs[i.dataset.tab].links_blur = i.value;
    });

    // Сохраняем затемнение
    this.shadowRoot.querySelectorAll('.cfg-tab-opacity').forEach(i => {
    newConfig.tabs[i.dataset.tab].links_opacity = i.value;
    });
    // -----------------------------------------------

    localStorage.setItem("CONFIG", JSON.stringify(newConfig));
    location.reload();
  }

  setEvents() {
    this.refs.config.onkeyup = (e) => { if (e.key === 'Escape') this.deactivate(); };
    this.shadowRoot.querySelector('.close').onclick = () => this.deactivate();
    this.shadowRoot.querySelector('.save-all').onclick = () => this.saveConfig();

    this.shadowRoot.getElementById('reset-config').onclick = () => {
        if (confirm('Сбросить все настройки к исходным?')) {
            localStorage.removeItem("CONFIG");
            location.reload();
        }
    };
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
