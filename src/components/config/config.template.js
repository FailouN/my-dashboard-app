window.getConfigTemplate = (tabs) => {
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
            
            <label style="font-size: 8pt; color: #7c6f64;">Ссылки (Имя | Цвет + Иконка | URL):</label>
            
            ${category.links.map((link, linkIdx) => `
              <div class="link-edit-row" style="display: flex; gap: 5px; margin-bottom: 8px; align-items: center;">
                <input type="text" class="cfg-link-name" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.name}" placeholder="Имя" style="flex: 1;">
                
                <!-- ОБНОВЛЕННЫЙ БЛОК: Группа выбора цвета и поиска иконки -->
                <div class="color-picker-wrapper" style="display: flex; align-items: center; background: #32302f; border: 1px solid #504945; border-radius: 4px; padding: 0 5px; flex: 1; position: relative;">
                    <input type="color" class="cfg-link-color" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.icon_color || '#726f6f'}" style="width: 24px; height: 24px; border: none; background: none; cursor: pointer; padding: 0;">
                    
                    <div style="position: relative; width: 100%;">
                        <input type="text" class="cfg-link-icon search-icon-input" 
                            data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" 
                            value="${link.icon}" placeholder="Иконка" 
                            style="border: none; background: none; width: 100%; padding: 8px 5px;" 
                            autocomplete="off">
                        <!-- Контейнер для выпадающего списка -->
                        <div class="icon-suggestions"></div>
                    </div>
                </div>

                <input type="text" class="cfg-link-url" data-tab="${tabIdx}" data-cat="${catIdx}" data-link="${linkIdx}" value="${link.url}" placeholder="URL" style="flex: 2;">
              </div>
            `).join('')}

            <!-- ОБНОВЛЕННЫЙ БЛОК: Поле для новой ссылки -->
            <div class="link-edit-row new-link-row" style="display: flex; gap: 5px; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #504945; align-items: center;">
                <input type="text" class="cfg-link-name-new" data-tab="${tabIdx}" data-cat="${catIdx}" placeholder="+ Имя" style="flex: 1; background: #3c3836;">
                
                <div class="color-picker-wrapper" style="display: flex; align-items: center; background: #3c3836; border: 1px solid #504945; border-radius: 4px; padding: 0 5px; flex: 1; position: relative;">
                    <input type="color" class="cfg-link-color-new" data-tab="${tabIdx}" data-cat="${catIdx}" value="#726f6f" style="width: 24px; height: 24px; border: none; background: none; cursor: pointer; padding: 0;">
                    
                    <div style="position: relative; width: 100%;">
                        <input type="text" class="cfg-link-icon-new search-icon-input" 
                            data-tab="${tabIdx}" data-cat="${catIdx}" 
                            placeholder="Иконка" 
                            style="border: none; background: none; width: 100%; padding: 8px 5px; color: #d4be98;" 
                            autocomplete="off">
                        <!-- Контейнер для выпадающего списка -->
                        <div class="icon-suggestions"></div>
                    </div>
                </div>

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
};