class Links extends Component {
  constructor() {
    super();
  }

  static getIcon(link) {
    const defaultColor = "#726f6f";

    return link.icon
      ? `<i class="ti ti-${link.icon} link-icon"
            style="color: ${link.icon_color ?? defaultColor}"></i>`
      : "";
  }

  static getAll(tabName, tabs) {
    if (!tabs) return ""; // Защита от пустого конфига
    const tab = tabs.find((f) => f.name === tabName);
    if (!tab) return ""; // Если вкладка не найдена — не падаем
    
    const { categories } = tab;
   

    return `
      ${
      categories.map(({ name, links }) => {
        return `
          <li>
            <h1>${name}</h1>
              <div class="links-wrapper">
              ${
          links.map((link) => `
                  <div class="link-info">
                    <a href="${link.url}">
                      ${Links.getIcon(link)}
                      ${
            link.name ? `<p class="link-name">${link.name}</p>` : ""
          }
                    </a>
                </div>`).join("")
        }
            </div>
          </li>`;
      }).join("")
    }
    `;
  }
}

class Category extends Component {
  constructor() {
    super();
  }

static getBackgroundStyle(url) {
    // Оставляем 100% 100% для левого баннера ("телефон")
    return `style="background-image: url(${url}); background-repeat: no-repeat; background-size: 100% 100%; background-position: center;"`;
  }

 static getAll(tabs) {
  return `
    ${tabs.map(({ name, background_url, links_background, links_blur, links_opacity }, index) => {
      
      // Передаем все настройки в style через переменные
      const linksStyle = links_background 
        ? `style="
            --bg: url(${links_background}); 
            --blur: ${links_blur || 20}px; 
            --opacity: ${links_opacity || 0.7};
          "` 
        : "";

      return `<ul class="${name}" ${index == 0 ? "active" : ""}>
          <div class="banner" ${Category.getBackgroundStyle(background_url)}></div>
          <div class="links" ${linksStyle}>
            ${Links.getAll(name, tabs)}
          </div>
        </ul>`;
    }).join("")}
  `;
  }
}
class Tabs extends Component {
  refs = {};

  constructor() {
    super();
    this.tabs = CONFIG.tabs;
    this.openedWindows = []; 
    this.activeWindowId = null;
  }

  imports() {
    return [
      this.resources.icons.material,
      this.resources.icons.tabler,
      this.resources.fonts.roboto,
      this.resources.fonts.raleway,
      this.resources.libs.awoo,
    ];
  }

  style() {
    return `
    #links {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    position: relative;
    overflow: hidden;
    display: block; /* Чтобы он вел себя как полноценный контейнер */
    }
 
    #full-window {
    display: none;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    
    /* 15px отступ + 38px высота бара + 15px отступ бара от края = 68px */
    bottom: 60px; 
    
    background: #1a1b26;
    border-radius: 0 0 15px 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    
    /* Слой НИЖЕ статус-бара */
    z-index: 5000; 
    
    flex-direction: column;
    overflow: hidden;
}

#full-frame {
    width: 100%;
    height: 100%;
}

status-bar {
    position: fixed;
    bottom: 15px;
    left: 0;
    right: 0;
    margin-left: 20px !important;
    margin-right: 20px !important;
    width: auto !important; 
    height: 38px;
    
    /* ЭТО КЛЮЧЕВОЕ: */
    background: rgba(40, 40, 40, 0.4) !important; 
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);

    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 9998;
    box-sizing: border-box;
    overflow: hidden;
}

#taskbar {
    position: fixed;
    bottom: 15px; /* Та же высота, что у бара */
    left: 50%;
    transform: translateX(-50%);
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 10000; /* Поверх всего */
    pointer-events: none; /* Пропускаем клики сквозь контейнер */
}

.taskbar-item {
    pointer-events: auto; /* А вот по самим иконкам кликать можно */
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: rgba(255,255,255, 0.05);
    border-radius: 8px;
    transition: all 0.2s;
}

.taskbar-item img {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}
.taskbar-item:hover {
    transform: scale(1.1);
}


.taskbar-item .dot {
    position: absolute;
    bottom: -2px;
    width: 4px;
    height: 4px;
    background: #7daea3; /* Цвет индикатора активного окна */
    border-radius: 50%;
    display: none;
}

.taskbar-item.active .dot {
    display: block;
    width: 12px;
    border-radius: 2px;
}

 /* Кнопка закрытия в статус-баре */

.global-btn {

    position: fixed;

    bottom: 21px; /* Центровка по вертикали относительно бара */
    
    height: 38px;
    cursor: pointer;

    font: 700 10px 'Raleway', sans-serif;

    letter-spacing: 1.5px;

    text-transform: uppercase;

    padding: 6px 20px;

    border-radius: 8px;

    z-index: 10000;

    transition: all 0.2s ease;

    backdrop-filter: blur(4px);

} 


/* Кнопка превью — слева (под окном превью) */
#close-preview-bar {
    position: fixed;
    /* Размещаем над статус-баром: 15px (отступ) + 38px (высота бара) + 12px (зазор) = 65px */
    bottom: 15px; 
    
    /* Центрируем относительно панели превью (она у нас 380px) */
    left: 320px; 
    transform: translateX(-50%);
    height: 38px;
    
    /* Ограничиваем размер, чтобы она не была на весь экран */
    width: auto;
    min-width: 150px;
    padding: 8px 16px;
    
    /* Оформление */
    color: #f7768e;
    background: rgba(247, 118, 142, 0.15);
    border: 1px solid rgba(247, 118, 142, 0.4);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    
    font: 700 11px 'Raleway', sans-serif;
    letter-spacing: 1px;
    text-align: center;
    cursor: pointer;
    z-index: 10001; /* Поверх всего */
    transition: all 0.2s ease;
}

#close-preview-bar:hover {
    background: rgba(247, 118, 142, 0.3);
    border-color: #f7768e;
    box-shadow: 0 4px 15px rgba(247, 118, 142, 0.2);
}

.global-btn:hover {
    background: #ff5555;
    color: #fff;
    box-shadow: 0 0 15px rgba(255, 85, 85, 0.4);
}


.taskbar-item {
    width: 34px;
    height: 34px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.taskbar-item:hover {
    transform: scale(1.1);
}

.taskbar-item img {
    width: 24px;
    height: 24px;
}

/* Сама точка индикатор */
.taskbar-item .dot {
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    position: absolute;
    bottom: -2px;
    transition: all 0.3s ease;
}

/* Когда окно активно, точка превращается в полоску */
.taskbar-item.active .dot {
    background: #7daea3; 
    width: 12px;
    border-radius: 4px;
}

      #panels, #panels ul,
      #panels .links {
          position: absolute;
      }

      .nav {
          color: #fff;
      }

      #panels {
          border-radius: 15px;
          /* Устанавливаем 16:9 на основе ширины */
          width: 1200px; 
          height: 675px;
          right: 0;
          left: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          position: absolute;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          background: #282828;
          overflow: hidden;
          }

      .categories .banner {
    position: absolute;
    left: 0;
    top: 0;
    width: 380px; /* Фиксированная ширина левой части */
    height: 100%;
    z-index: 2;
}

      .categories ul {
    --panelbg: transparent;
    --flavour: var(--accent);
    width: 100%;
    height: 100%;
    right: 100%;
    background: #282828; /* Чистый фон */
    transition: all .6s;
    position: absolute;
}

      @keyframes scroll {
          50% {
              background-position-x: -240px;
          }
      }

      .categories ul:nth-child(2) {
          --flavour: #e78a4e;
      }

      .categories ul:nth-child(3) {
          --flavour: #ea6962;
      }

      .categories ul:nth-child(4) {
          --flavour: #7daea3;
      }

      .categories ul:nth-child(5) {
          --flavour: #d3869b;
      }

      .categories ul:nth-child(6) {
          --flavour: #d3869b;
      }

      .categories ul:nth-child(7) {
          --flavour: #a9b665;
      }

      .categories ul:nth-child(8) {
          --flavour: #e78a4e;
      }

      .categories ul:nth-child(9) {
          --flavour: #ea6962;
      }

      .categories ul:nth-child(10) {
          --flavour: #7daea3;
      }

      .categories ul:nth-child(11) {
          --flavour: #d3869b;
      }

      .categories ul:nth-child(12) {
          --flavour: #d3869b;
      }

      .categories ul .links {
          box-shadow: inset -1px 0 var(--flavour);
      }

      .categories ul[active] {
          right: 0;
          z-index: 1;
      }

.categories .links {
    right: 0;
    /* Занимает всё оставшееся место справа от баннера */
    width: calc(100% - 380px); 
    height: 100%;
    background: #282828;
    padding: 40px;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    position: absolute;
}
      .categories .links li {
          list-style: none;
      }

      .categories ul .links a {
    color: #d4be98;
    text-decoration: none;
    font: 700 18px 'Roboto', sans-serif;
    transition: all .2s;
    display: inline-flex;
    align-items: center;
    padding: .4em .7em;
    
    /* Стеклянный эффект */
    background: rgba(255, 255, 255, 0.05) !important; 
    backdrop-filter: blur(8px) saturate(140%);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
    
    /* Тонкая рамка для объема */
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px; /* Немного увеличил скругление для мягкости */
    
    margin-bottom: .7em;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

      .categories .link-info {
          display: inline-flex;
      }

      .categories .link-info:not(:last-child) { margin-right: .5em; }

      .categories ul .links a:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    transform: translateY(-3px); /* Кнопка слегка всплывает */
    border-color: var(--flavour); /* Подсвечиваем рамку цветом категории */
    color: #fff;
}

.categories ul::after {
    content: attr(class);
    position: absolute;
    display: flex;
    text-transform: uppercase;
    overflow-wrap: break-word;
    width: 25px;
    
    /* 1. Высота плашки */
    height: 450px; 
    
    padding: 1em;
    margin: auto;
    border-radius: 5px;
    box-shadow: inset 0 0 0 2px var(--flavour);

    /* 2. Центрируем внутри области 380px */
    /* 190px — это ровно середина твоего баннера */
    left: 190px; 
    transform: translateX(-50%); 

    bottom: 0;
    top: 0;
    
    /* 3. Фон и слои */
    /* Увеличиваем z-index, чтобы текст был ПОВЕРХ картинки в .banner */
    z-index: 10; 
    background: linear-gradient(to top, rgb(50 48 47 / 90%), transparent);
    
    /* 4. Типографика */
    color: var(--flavour);
    letter-spacing: 1px;
    font: 500 30px 'Nunito', sans-serif;
    text-align: center;
    flex-wrap: wrap;
    word-break: break-all;
    align-items: center;

    /* Размытие фона под текстом (по желанию, убери # если нужно) */
    /* backdrop-filter: blur(3px); */
    
    /* Отключаем клики по тексту, чтобы они проходили сквозь него на ссылки или баннер */
    pointer-events: none; 
}
      .categories .links li:not(:last-child) {
          box-shadow: 0 1px 0 rgba(212, 190, 152, .25);
          padding: 0 0 .5em 0;
          margin-bottom: 1.5em;
      }

      .categories .links li h1 {
          color: #d4be98;
	        opacity: 0.5;
          font-size: 13px;
          margin-bottom: 1em;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Raleway', sans-serif;
      }

      .categories .link-icon {
          font-size: 27px;
          color: #726f6f;
      }

      .categories .link-icon + .link-name {
          margin-left: 10px;
      }

      .categories .links-wrapper {
          display: flex;
          flex-wrap: wrap;
      }
      .links {
    position: relative; /* Обязательно */
    z-index: 1;
    overflow: hidden; /* Чтобы размытие не вылезало за края */
    background: #18181d; /* Цвет фона, если картинка не загрузится */
}

.links::before {
    content: "";
    position: absolute;
    top: -10px; left: -10px; right: -10px; bottom: -10px; /* Немного расширяем, чтобы скрыть края блюра */
    
    background-image: var(--bg);
    background-size: cover;
    background-position: center;
    
    /* Используем переменную прозрачности */
    background-color: rgba(0, 0, 0, var(--opacity)); 
    background-blend-mode: darken;
    
    /* Используем переменную блюра */
    filter: blur(var(--blur)); 
    
    z-index: -1;
}

      .ti {
          animation: fadeInAnimation ease .5s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          height: 27px;
          width: 27px;
      }

      @keyframes fadeInAnimation {
          0% {
              opacity: 0;
          }
          100% {
              opacity: 1;
           }
      }
      
      /* ПРЕВЬЮ ПАНЕЛЬ */
#preview-panel {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    /* Ширина для 9:16 при высоте 675px */
    width: 380px; 
    height: 100%;
    background: #1a1b26;
    z-index: 100;
    flex-direction: column;
    border-right: 2px solid var(--flavour);
}


#close-full {
    pointer-events: auto; /* Возвращаем кликабельность кнопке */
    color: rgba(255, 255, 255, 0.5);
    font: 600 10px 'Raleway', sans-serif;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 10px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
}

#close-full:hover, #close-preview:hover {
    color: #ff5555;
    background: rgba(255, 85, 85, 0.2);
    transform: scale(1.05);
}

#preview-frame { 
    width: 100%; 
    height: 100%; /* Занимаем честные 100% без вычетов */
    border: none; 
    background: #1a1b26; /* Цвет под тему */
}

webview::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}

* Прячем скроллбар для контейнеров */
#full-container, #preview-frame {
    scrollbar-width: none; /* Для Firefox */
    -ms-overflow-style: none; /* Для IE/Edge */
}

#full-container::-webkit-scrollbar,
#preview-frame::-webkit-scrollbar {
    display: none;
}

    `; // Обратная кавычка, точка с запятой
  } // Закрывающая скобка метода style

template() {

    return `
      <div id="links">
        <div id="panels">
          <div class="categories">
            <div id="preview-panel" style="display: none;">
                <webview id="preview-frame" 
                         src="" 
                         allowpopups></webview>
            </div>

            ${Category.getAll(this.tabs || [])} 
            <div id="full-window" style="display: none;">
                <div id="full-container" style="width:100%; height:100%;"></div>
            </div>

            <search-bar></search-bar>
            <config-tab></config-tab>
          </div>
        </div>

        <status-bar></status-bar>
        
        <div id="taskbar"></div>

        <div id="close-preview-bar" class="global-btn" style="display: none;">ЗАКРЫТЬ ПРЕВЬЮ</div>
      </div>
    `;
}
connectedCallback() {
    this.render();
    // Даем браузеру миллисекунду, чтобы отрисовать HTML, прежде чем искать в нем панель
    setTimeout(() => this.setupPreview(), 10);
  }

setupPreview() {
    const root = this.shadowRoot;
    const fullWin = root.getElementById('full-window');
    const fullContainer = root.getElementById('full-container');
    const panel = root.getElementById('preview-panel');
    const frame = root.getElementById('preview-frame');
    const taskbar = root.getElementById('taskbar');
    const btnPreview = root.getElementById('close-preview-bar');

    const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36";

    const cleanStyles = (target) => {
        target.addEventListener('dom-ready', () => {
            target.insertCSS(`
                ::-webkit-scrollbar { width: 0px !important; display: none !important; }
                body { scrollbar-width: none !important; }
                .JoinVkMsiteMobileHeader, .m_footer, [class*="UnauthActionPanel"] { display: none !important; }
            `);
        });
    };

    // ФУНКЦИЯ ЗАКРЫТИЯ (ВЫГРУЗКИ)
    const closeWindow = (id) => {
        const wv = fullContainer.querySelector(`webview[data-id="${id}"]`);
        if (wv) wv.remove();
        
        this.openedWindows = this.openedWindows.filter(w => w.id !== id);
        if (this.activeWindowId === id) {
            this.activeWindowId = null;
            fullWin.style.display = 'none';
        }
        updateTaskbar();
    };

    // ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ (СВЕРНУТЬ/РАЗВЕРНУТЬ)
    const toggleWindow = (id) => {
        if (this.activeWindowId === id) {
            this.activeWindowId = null;
            fullWin.style.display = 'none';
        } else {
            this.activeWindowId = id;
            const allFrames = fullContainer.querySelectorAll('webview');
            allFrames.forEach(f => f.style.display = 'none');

            const activeFrame = fullContainer.querySelector(`webview[data-id="${id}"]`);
            if (activeFrame) {
                activeFrame.style.display = 'flex';
                fullWin.style.display = 'flex';
            }
        }
        updateTaskbar();
    };
     
      this.addEventListener('go-back', () => {
    if (this.activeWindowId) {
        const activeFrame = fullContainer.querySelector(`webview[data-id="${this.activeWindowId}"]`);
        if (activeFrame && activeFrame.canGoBack()) {
            activeFrame.goBack();
        }
    } else if (panel.style.display === 'flex') {
        if (frame.canGoBack()) frame.goBack();
    }
});

    const updateTaskbar = () => {
        const taskbar = root.getElementById('taskbar');
        if (!taskbar) return;

        taskbar.innerHTML = this.openedWindows.map(win => {
            let domain = "google.com";
            try { domain = new URL(win.url).hostname; } catch(e) {}
            
            const isActive = this.activeWindowId === win.id;
            
            return `
                <div class="taskbar-item ${isActive ? 'active' : ''}" data-id="${win.id}" title="${win.url}">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}">
                    <div class="dot"></div>
                </div>
            `;
        }).join('');

        taskbar.querySelectorAll('.taskbar-item').forEach(el => {
            el.onclick = () => toggleWindow(el.dataset.id);
            el.oncontextmenu = (e) => {
                e.preventDefault();
                closeWindow(el.dataset.id);
            };
        });
    };

    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ СОЗДАНИЯ ОКНА
    const openNewWindow = (url) => {
        const id = btoa(url).slice(-15, -3) + url.length;

        if (this.openedWindows.find(w => w.id === id)) {
            toggleWindow(id);
            return;
        }

        const newFrame = document.createElement('webview');
        newFrame.setAttribute('src', url);
        newFrame.setAttribute('data-id', id);
        newFrame.setAttribute('useragent', desktopUA);
        newFrame.style.width = '100%';
        newFrame.style.height = '100%';

        cleanStyles(newFrame);
        fullContainer.appendChild(newFrame);
        this.openedWindows.push({ id, url });
        toggleWindow(id);
    };

    // СЛУШАЕМ СОБЫТИЕ ИЗ ПОИСК-БАРА
    this.addEventListener('open-link', (e) => {
        openNewWindow(e.detail.url);
    });

    // ЛКМ по ссылкам в категориях
    root.addEventListener('click', (e) => {
        const path = e.composedPath();
        const link = path.find(el => el.tagName === 'A');
        if (!link || e.button !== 0) return;
        if (path.some(el => el.id === 'taskbar')) return;
        
        e.preventDefault();
        openNewWindow(link.href);
    });

    // ПКМ по ссылкам (Превью)
    root.addEventListener('contextmenu', (e) => {
        const path = e.composedPath();
        const link = path.find(el => el.tagName === 'A');
        if (!link || path.some(el => el.id === 'taskbar')) return;
        
        e.preventDefault();
        let url = link.href;

        frame.setAttribute('src', url);
        cleanStyles(frame);
        panel.style.display = 'flex';
        if (btnPreview) btnPreview.style.display = 'block';
    });

    if (btnPreview) {
        btnPreview.onclick = () => {
            panel.style.display = 'none';
            frame.setAttribute('src', 'about:blank');
            btnPreview.style.display = 'none';
        };
    }
  }
}