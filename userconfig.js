let saved_config = JSON.parse(localStorage.getItem("CONFIG"));

const default_config = {
  overrideStorage: true,
  temperature: {
    location: 'Novosibirsk',
    scale: "C",
  },
  clock: {
    format: "h:i p",
    iconColor: "#ea6962",
  },
  search: {
    engines: {
      g: ["https://google.com/search?q=", "Google"],
      d: ["https://duckduckgo.com/html?q=", "DuckDuckGo"],
      y: ["https://youtube.com/results?search_query=", "Youtube"],
      r: ["https://www.reddit.com/search/?q=", "Reddit"],
      p: ["https://www.pinterest.es/search/pins/?q=", "Pinterest"],
    },
  },
  keybindings: {
    "s": "search-bar",
    "ы": "search-bar",
    "q": "config-tab",
    "й": "config-tab"
  },
  disabled: [],
  localIcons: false,
  fastlink: "https://chat.openai.com/",
  openLastVisitedTab: true,
  tabs: [
    {
      name: "chi ll",
      background_url: "src/img/banners/leat-banner.jpg",
      links_background: "src/img/banners/right-banner.jpg",
      links_blur: 3,
      links_opacity: 0.5,
      categories: [{
                    name: "Messenger",
                    links: [
                        {
                            name: "telegram",
                            url: "https://web.telegram.org/",
                            icon: "brand-telegram",
                            icon_color: "#229ED9",
                        },
                        
                        {
                            name: "discord",
                            url: "https://discord.com/app",
                            icon: "brand-discord",
                            icon_color: "#5865F2",
                        },
                        {
                            name: "vkontakte",
                            url: "https://vk.com/",
                            icon: "brand-vk",
                            icon_color: "#0077FF",
                        },
                    
        ],
      }, 
{
        name: "Media",
        links: [
          {
            name: "youtube",
                            url: "https://www.youtube.com/",
                            icon: "brand-youtube",
                            icon_color: "#FF0000",
          },
          {
            name: "yandex-music",
                            url: "https://music.yandex.ru/",
                            icon: "music",
                            icon_color: "#FFCC00",
          },
          {
            name: "kinopoisk",
                            url: "https://www.kinopoisk.ru/",
                            icon: "device-tv-old",
                            icon_color: "#FF6600",
          },
          {
            name: "animedia",
                            url: "https://amd.online/",
                            icon: "brand-netflix", // Используем как символ кино/сериалов
                            icon_color: "#E50914",
          },
        ],
      }, {
        name: "AI Tools",
        links: [
          {
           name: "chat gpt",
                            url: "https://chatgpt.com/",
                            icon: "brand-openai",
                            icon_color: "#74aa9c",
          },
          {
            name: "google gemini",
                            url: "https://gemini.google.com/",
                            icon: "brand-google-filled",
                            icon_color: "#4285F4",
          },
          {
                            name: "claude",
                            url: "https://claude.ai/",
                            icon: "brain", 
                            icon_color: "#D97757",
                        },
        ],
      }],
    },
    {
      name: "design",
      background_url: "src/img/banners/leat-banner.jpg",
      links_background: "src/img/banners/right-banner.jpg",
      links_blur: 3,
      links_opacity: 0.5,
      categories: [
        {
          name: "inspiration",
          links: [
            {
              name: "pinterest",
              url: "https://www.pinterest.es/",
              icon: "brand-pinterest",
              icon_color: "#ea6962",
            },
            {
              name: "artstation",
              url: "https://www.artstation.com/?sort_by=community",
              icon: "chart-area",
              icon_color: "#7daea3",
            },
            {
              name: "leonardo ai",
              url: "https://app.leonardo.ai/",
              icon: "brand-openai",
              icon_color: "#89b482",
            },
            {
              name: "dribble",
              url: "https://dribbble.com/following",
              icon: "brand-dribbble-filled",
              icon_color: "#d3869b",
            },
          ],
        },
        {
          name: "resources",
          links: [
            
            {
              name: "colorhunt",
              url: "https://colorhunt.co/",
              icon: "color-picker",
              icon_color: "#ea6962",
            },
            {
              name: "adobe color",
              url: "https://color.adobe.com/es/create/color-wheel",
              icon: "brand-adobe",
              icon_color: "#7daea3",
            },
            {
              name: "terminalsexy",
              url: "https://terminal.sexy",
              icon: "prompt",
              icon_color: "#e78a4e",
            },
          ],
        },
        {
          name: "resources 3d",
          links: [
            {
              name: "thingiverse",
              url: "https://www.thingiverse.com/",
              icon: "circle-letter-t",
              icon_color: "#7daea3",
            },
          ],
        },
      ],
    },
    {
      name: "dev",
      background_url: "src/img/banners/leat-banner.jpg",
      links_background: "src/img/banners/right-banner.jpg",
      links_blur: 3,
      links_opacity: 0.5,
      categories: [
        {
          name: "repositories",
          links: [
            {
              name: "github",
              url: "https://github.com/",
              icon: "brand-github",
              icon_color: "#7daea3",
            },
            {
              name: "gitlab",
              url: "https://gitlab.com/",
              icon: "brand-gitlab",
              icon_color: "#e78a4e",
            },
          ],
        },
        {
          name: "resources",
          links: [
            {
              name: "hacktricks",
              url: "https://book.hacktricks.xyz/welcome/readme",
              icon: "biohazard",
              icon_color: "#ea6962",
            },
            {
              name: "vscode",
              url: "https://vscode.dev/",
              icon: "brand-vscode",
              icon_color: "#7daea3",
            },
          ],
        },
        {
          name: "challenges",
          links: [
            {
              name: "hackthebox",
              url: "https://app.hackthebox.com",
              icon: "box",
              icon_color: "#a9b665",
            },
            {
              name: "cryptohack",
              url: "https://cryptohack.org/challenges/",
              icon: "brain",
              icon_color: "#e78a4e",
            },
            {
              name: "tryhackme",
              url: "https://tryhackme.com/dashboard",
              icon: "brand-onedrive",
              icon_color: "#ea6962",
            },
            {
              name: "hackerrank",
              url: "https://www.hackerrank.com/dashboard",
              icon: "code-asterix",
              icon_color: "#a9b665",
            },
          ],
        },
      ],
    },
    {
      name: "myself",
      background_url: "src/img/banners/leat-banner.jpg",
      links_background: "src/img/banners/right-banner.jpg",
      links_blur: 3,
      links_opacity: 0.5,
      categories: [
        {
                    name: "Mails",
                    links: [
                        {
                            name: "yandex mail",
                            url: "https://mail.yandex.ru/",
                            icon: "brand-yandex",
                            icon_color: "#ff0000",
                        },
                        {
                            name: "gmail",
                            url: "https://mail.google.com/",
                            icon: "brand-gmail",
                            icon_color: "#ea4335",
                        },
                        {
                            name: "mail.ru",
                            url: "https://e.mail.ru/",
                            icon: "mail",
                            icon_color: "#005ff9",
                        },
                    ],
                },
       {
                    name: "Storage",
                    links: [
                        {
                            name: "google drive",
                            url: "https://drive.google.com/",
                            icon: "brand-google-drive",
                            icon_color: "#34A853",
                        },
                        {
                            name: "yandex disk",
                            url: "https://disk.yandex.ru/",
                            icon: "cloud",
                            icon_color: "#FFCC00",
                        },
                        {
                            name: "cloud mail.ru",
                            url: "https://cloud.mail.ru/",
                            icon: "database",
                            icon_color: "#005FF9",
                        },
                    ],
                },
        {
                    name: "Gallery",
                    links: [
                        {
                            name: "google photos",
                            url: "https://photos.google.com/",
                            icon: "photo",
                            icon_color: "#FBBC05",
                        },
                        {
                            name: "icloud",
                            url: "https://www.icloud.com/photos/",
                            icon: "brand-apple",
                            icon_color: "#FFFFFF",
                        },
                    ],
                },
      ],
    },
  ],
};

const CONFIG = new Config(saved_config ?? default_config);
// const CONFIG = new Config(default_config);

(function applyGlobalBackground() {
    const saved = localStorage.getItem("CONFIG");
    const currentConfig = saved ? JSON.parse(saved) : CONFIG.config;
    const bgImage = currentConfig.image || 'src/img/background-2.png';
    
    const tabsList = document.querySelector('tabs-list');
    
    if (tabsList) {
        // Добавлены кавычки для url("")
        tabsList.style.backgroundImage = `url("${bgImage}")`;
        tabsList.style.backgroundSize = 'cover';
        tabsList.style.backgroundPosition = 'center';
    } else {
        const style = document.createElement('style');
        // Добавлены кавычки для url("")
        style.innerHTML = `tabs-list { background-image: url("${bgImage}") !important; background-size: cover !important; }`;
        document.head.appendChild(style);
    }
})();

(function() {
  var css = document.createElement('link');
  css.href = 'src/css/tabler-icons.min.css';
  css.rel = 'stylesheet';
  css.type = 'text/css';
  if (!CONFIG.config.localIcons)
    document.getElementsByTagName('head')[0].appendChild(css);
})();
