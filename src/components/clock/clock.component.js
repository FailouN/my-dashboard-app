class Clock extends Component {
  refs = {
    clock: '.clock-time',
    icon: '.clock-icon'
  };

  constructor() {
    super();
    this._intervalId = null; // Храним ID таймера
}

  imports() {
    return [
      this.resources.icons.material,
      this.resources.fonts.roboto
    ];
  }

  style() {
    return `
        .clock-time {
            white-space: nowrap;
            font: 300 9pt 'Roboto', sans-serif;
            color: #d4be98;
            letter-spacing: .5px;
        }

        .clock-icon {
            color: #ea6962;
            font-size: 10pt;
            margin-right: 10px;
        }
    `;
  }

  template() {
    return `
        <span class="material-icons clock-icon">schedule</span>
        <p class="clock-time"></p>
    `;
  }

  setIconColor() {
    this.refs.icon.style.color = CONFIG.clock.iconColor;
  }

  setTime() {
    const date = new Date();
    
    // Вместо strftime используем стандартные методы:
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Если тебе нужен формат HH:MM:SS
    this.refs.clock.textContent = `${hours}:${minutes}`;
  }

  connectedCallback() {
    this.render().then(() => {
        this.setTime();
        this.setIconColor();
        // Очищаем старый интервал перед созданием нового, если он был
        if (this._intervalId) clearInterval(this._intervalId);
        this._intervalId = setInterval(() => this.setTime(), 1000);
    });
  }

  // Добавь этот метод, чтобы таймер останавливался при закрытии компонента
  disconnectedCallback() {
    if (this._intervalId) clearInterval(this._intervalId);
  }

}
