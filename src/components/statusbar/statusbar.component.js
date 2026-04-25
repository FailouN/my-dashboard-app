class Statusbar extends Component {
  externalRefs = {};

  refs = {
    categories: ".categories ul",
    tabs: "#tabs ul li",
    indicator: ".indicator",
    fastlink: ".fastlink",
  };

  currentTabIndex = 0;

  constructor() {
    super();

    this.setDependencies();
  }

  setDependencies() {
    this.externalRefs = {
      categories: this.parentNode.querySelectorAll(this.refs.categories),
    };
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material,
      this.resources.libs.awoo,
    ];
  }

  style() {
    return `
      *:not(:defined) { display: none; }

      #tabs,
      #tabs .widgets,
      #tabs ul li:last-child {
          position: absolute;
      }

      #tabs {
    width: 100%;
    height: 100%;
    background: transparent !important; /* Убираем дублирующий фон */
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    box-sizing: border-box;
}

      #tabs ul {
          counter-reset: tabs;
          height: 100%;
          position: relative;
          list-style: none;
          margin-left: 1em;
      }

      #tabs ul li:not(:last-child)::after {
          content: counter(tabs, cjk-ideographic);
          counter-increment: tabs;
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
          align-items: center;
          text-align: center;
          justify-content: center;
      }

      #tabs ul li:not(:last-child) {
          width: 35px;
          text-align: center;
          font: 700 13px 'Yu Gothic', serif;
          color: rgba(212, 190, 152, 0.5);
          padding: 6px 0;
          transition: all .1s;
          cursor: pointer;
          line-height: 0;
          height: 100%;
      }

      #tabs ul li:not(:last-child):hover {
    background: rgba(255, 255, 255, 0.1); /* Прозрачный ховер */
}

      #tabs ul li:last-child {
          --flavour: var(--accent);
          width: 35px;
          height: 3px;
          background: var(--flavour);
          bottom: 0;
          transition: all .3s;
      }

      #tabs ul li[active]:not(:last-child) {
          color: #d4be98;
          font-size: 13px;
          padding: 6px 0;
      }

      #tabs ul li[active]:nth-child(2) ~ li:last-child { margin: 0 0 0 35px; }
      #tabs ul li[active]:nth-child(3) ~ li:last-child { margin: 0 0 0 70px; }
      #tabs ul li[active]:nth-child(4) ~ li:last-child { margin: 0 0 0 105px; }
      #tabs ul li[active]:nth-child(5) ~ li:last-child { margin: 0 0 0 140px; }
      #tabs ul li[active]:nth-child(6) ~ li:last-child { margin: 0 0 0 175px; }
      #tabs ul li[active]:nth-child(7) ~ li:last-child { margin: 0 0 0 210px; }
      #tabs ul li[active]:nth-child(8) ~ li:last-child { margin: 0 0 0 245px; }
      #tabs ul li[active]:nth-child(9) ~ li:last-child { margin: 0 0 0 280px; }
      #tabs ul li[active]:nth-child(10) ~ li:last-child { margin: 0 0 0 315px; }
      #tabs ul li[active]:nth-child(11) ~ li:last-child { margin: 0 0 0 350px; }
      #tabs ul li[active]:nth-child(12) ~ li:last-child { margin: 0 0 0 385px; }

      #tabs ul li[active]:nth-child(2) ~ li:last-child {
          --flavour: #e78a4e;
      }

      #tabs ul li[active]:nth-child(3) ~ li:last-child {
          --flavour: #ea6962;
      }

      #tabs ul li[active]:nth-child(4) ~ li:last-child {
          --flavour: #7daea3;
      }

      #tabs ul li[active]:nth-child(5) ~ li:last-child {
          --flavour: #d3869b;
      }

      #tabs ul li[active]:nth-child(6) ~ li:last-child {
          --flavour: #89b482;
      }

      #tabs ul li[active]:nth-child(7) ~ li:last-child {
          --flavour: #a9b665;
      }

      #tabs ul li[active]:nth-child(8) ~ li:last-child {
          --flavour: #e78a4e;
      }

      #tabs ul li[active]:nth-child(9) ~ li:last-child {
          --flavour: #ea6962;
      }

      #tabs ul li[active]:nth-child(10) ~ li:last-child {
          --flavour: #7daea3;
      }

      #tabs ul li[active]:nth-child(11) ~ li:last-child {
          --flavour: #d3869b;
      }

      #tabs ul li[active]:nth-child(12) ~ li:last-child {
          --flavour: #89b482;
      }

      .widgets {
          right: 0;
          margin: auto;
          height: 32px;
          color: #fff;
          font-size: 12px;
      }

      .widgets:hover .edit {
          margin: 0;
      }

      .widget {
          position: relative;
          height: 100%;
          padding: 0 1em;
      }

      .widget:first-child {
          padding-left: 2em;
      }

      .widget:last-child {
          padding-right: 2em;
      }

      .widget:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08); /* Мягкий ховер для часов/погоды */
}

      #tabs > cols {
          position: relative;
          grid-template-columns: [chat-tab] 35px [tabs] auto [widgets] auto;
      }

      #tabs .time span {
          font-weight: 400;
      }

      #tabs i {
          font-size: 14pt !important;
      }

      .widget:not(:first-child)::before {
          content: '';
          position: absolute;
          display: block;
          left: 0;
          height: calc(100% - 15px);
          width: 1px;
          background: rgb(255 255 255 / 10%);
      }

     .fastlink {
    border: 0;
    background: rgba(255, 255, 255, 0.05);
    color: #d4be98; /* Цвет под твою тему */
    cursor: pointer;
    border-radius: 0; /* Сделаем её более квадратной или оставь как было */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 100%;
}
 
    .fastlink i {
    font-size: 18px !important;
}

      .fastlink:hover {
    background: rgba(255, 255, 255, 0.1);
    filter: none; /* Убираем яркость, лучше просто менять прозрачность */
}

      .fastlink-icon {
	      width: 70%;
      }
      cols {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 10px;
}

.col-end {
    margin-left: auto; /* Это магическая строка, которая толкает блок вправо */
    display: flex;
    align-items: center;
    gap: 15px; /* Расстояние между иконкой закладок и часами */
}

.bookmark-trigger {
    display: flex;
    align-items: center;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.bookmark-trigger:hover {
    opacity: 1;
}
    `;
  }

 template() {
  return `
      <div id="tabs">
          <cols>
              <button class="+ fastlink" title="Назад">
                <i class="material-icons">arrow_back</i>
              </button>
              <ul class="- indicator"></ul>
              <div class="+ widgets col-end">
                 <button class="widget bookmark-trigger" title="Закладки" style="background:none; border:none; color:inherit; cursor:pointer;">
    <i class="material-icons">bookmarks</i>
</button>
                  <current-time class="+ widget"></current-time>
                  <weather-forecast class="+ widget weather"></weather-forecast>
              </div>
          </cols>
      </div>`;
}

  setEvents() {
    this.refs.tabs.forEach((tab) =>
      tab.onclick = ({ target }) => this.handleTabChange(target)
    );
    const btn = this.shadowRoot.querySelector('.bookmark-trigger');
if (btn) {
    btn.onclick = () => {
        this.dispatchEvent(new CustomEvent('toggle-bookmarks', {
            bubbles: true,
            composed: true
        }));
    };
}

    document.onkeydown = (e) => this.handleKeyPress(e);
    document.onwheel = (e) => this.handleWheelScroll(e);
    this.refs.fastlink.onclick = () => {
  // Отправляем сигнал "назад", который поймает tabs.component.js
  this.dispatchEvent(new CustomEvent('go-back', {
    bubbles: true,
    composed: true
  }));
}

    if (CONFIG.openLastVisitedTab) {
      window.onbeforeunload = () => this.saveCurrentTab();
    }
  }

  saveCurrentTab() {
  // Сохраняем имя активной вкладки (например, "Dev", "Social")
  const activeTab = this.tabs[this.currentTabIndex];
  if (activeTab) {
    localStorage.setItem("lastTabKey", activeTab.name);
  }
}

  openLastVisitedTab() {
    if (!CONFIG.openLastVisitedTab) return;

    // 1. Сначала достаем ключ последней вкладки из хранилища (localStorage)
    const lastTabKey = localStorage.getItem("lastTabKey"); 

    // 2. Если ключ нашелся, запускаем таймер
    if (lastTabKey) {
        setTimeout(() => {
            this.activateByKey(lastTabKey);
        }, 100);
    }
}

  handleTabChange(tab) {
    this.activateByKey(Number(tab.getAttribute("tab-index")));
  }

  handleWheelScroll(event) {
    if (!event) return;

    let { target, wheelDelta } = event;

    if (target.shadow && target.shadow.activeElement) return;

    let activeTab = -1;
    this.refs.tabs.forEach((tab, index) => {
      if (tab.getAttribute("active") === "") {
        activeTab = index;
      }
    });

    if (wheelDelta > 0) {
      this.activateByKey((activeTab + 1) % (this.refs.tabs.length - 1));
    } else {
      this.activateByKey(
        (activeTab - 1) < 0 ? this.refs.tabs.length - 2 : activeTab - 1,
      );
    }
  }

  handleKeyPress(event) {
    if (!event) return;

    let { target, key } = event;

    if (target.shadow && target.shadow.activeElement) return;

    if (
      Number.isInteger(parseInt(key)) &&
      key <= this.externalRefs.categories.length
    ) {
      this.activateByKey(key - 1);
    }
  }

  activateByKey(key) {
    if (key < 0) return;
    this.currentTabIndex = key;

    this.activate(this.refs.tabs, this.refs.tabs[key]);
    this.activate(
      this.externalRefs.categories,
      this.externalRefs.categories[key],
    );
  }

  createTabs() {
    const categoriesCount = this.externalRefs.categories.length;

    for (let i = 0; i <= categoriesCount; i++) {
      this.refs.indicator.innerHTML += `<li tab-index=${i} ${
        i == 0 ? "active" : ""
      }></li>`;
    }
  }

  activate(target, item) {
    // 1. Проверяем, существует ли target и является ли он массивом/списком
    if (target && typeof target.forEach === 'function') {
        target.forEach((i) => {
            if (i) i.removeAttribute("active");
        });
    }

    // 2. Самая важная проверка: существует ли сам элемент, который мы хотим активировать
    if (item) {
        item.setAttribute("active", "");
    } else {
        // Это поможет тебе увидеть в консоли, когда именно item теряется
        console.warn("Statusbar: Попытка активировать несуществующий элемент (item is undefined)");
    }
}

  connectedCallback() {
    this.render().then(() => {
      this.createTabs();
      this.setEvents();
      this.openLastVisitedTab();
    });
  }
}
