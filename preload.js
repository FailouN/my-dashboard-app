// Этот скрипт удаляет следы Electron до того, как страница загрузится
window.addEventListener('DOMContentLoaded', () => {
  delete window.process;
  delete window.require;
  delete window.module;
});