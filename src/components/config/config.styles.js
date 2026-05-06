
window.ConfigStyles = `
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

/* Стили для кастомного выбора цвета */
.color-picker-wrapper {
    display: flex;
    align-items: center;
    background: #32302f;
    border: 1px solid #504945;
    border-radius: 4px;
    padding: 2px 5px;
}

.cfg-link-color {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-right: 5px;
}

.cfg-link-color::-webkit-color-swatch {
    border-radius: 3px;
    border: 1px solid rgba(255,255,255,0.1);
}

/* СТИЛИ ДЛЯ ЖИВОГО ПОИСКА ИКОНОК */
      .icon-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #3c3836;
          border: 1px solid #504945;
          z-index: 1000;
          max-height: 150px;
          overflow-y: auto;
          border-radius: 0 0 4px 4px;
          display: none;
      }

      .icon-suggestion-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s;
      }

      .icon-suggestion-item:hover { background: #504945; }
      .icon-suggestion-item i { font-size: 18px; }
    `;