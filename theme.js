// Lightweight theme manager: independent from main.js so dark mode works even if main.js has errors
(function(){
    // добавим утилиту для чтения data-theme на html (например, если вставлен inline в <head>)
    function getHtmlAttrTheme() {
        try {
            const t = document && document.documentElement && document.documentElement.getAttribute('data-theme');
            return (t === 'dark' || t === 'light') ? t : null;
        } catch (e) {
            return null;
        }
    }

    function updateIcons(theme) {
        // обновляем саму кнопку и различные варианты иконок внутри неё
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            if (!btn) return;
            try { btn.setAttribute('data-theme', theme); } catch (e) {}
            try { btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'); } catch (e) {}
            const icon = btn.querySelector('i, svg, [data-icon]');
            if (!icon) return;
            if (icon.tagName && icon.tagName.toLowerCase() === 'i') {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            } else if (icon.tagName && icon.tagName.toLowerCase() === 'svg') {
                // SVG — удобнее менять title/aria-label; конкретную графику лучше менять в CSS
                try { icon.setAttribute('aria-hidden', 'true'); } catch (e) {}
                try { btn.title = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'; } catch (e) {}
            } else {
                try { icon.setAttribute('data-icon', theme === 'dark' ? 'sun' : 'moon'); } catch (e) {}
            }
        });
    }

    function getCurrentTheme() {
        const htmlAttr = getHtmlAttrTheme();
        if (htmlAttr) return htmlAttr;
        const body = document.body;
        if (body.classList.contains('dark-theme')) return 'dark';
        if (body.classList.contains('light-theme')) return 'light';
        return localStorage.getItem('theme') || null;
    }

    function applySavedTheme() {
        // выберем тему: data-theme (html) -> localStorage -> prefers-color-scheme -> light
        const htmlAttr = getHtmlAttrTheme();
        const saved = localStorage.getItem('theme');
        const prefersDark = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const theme = htmlAttr || ((saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light'));

        // Применяем и на body, и как data-атрибут на html для CSS
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme + '-theme');
        try { document.documentElement.setAttribute('data-theme', theme); } catch (e) {}
        updateIcons(theme);
    }

    function toggleTheme() {
        const current = getCurrentTheme() || (document.documentElement.getAttribute('data-theme') || 'light');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(newTheme + '-theme');
        try { document.documentElement.setAttribute('data-theme', newTheme); } catch (e) {}
        localStorage.setItem('theme', newTheme);
        updateIcons(newTheme);

        // уведомление для других частей приложения
        try {
            document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: newTheme } }));
        } catch (e) {}
    }

    // Применяем тему немедленно, если body уже доступен; иначе — при DOMContentLoaded
    try {
        if (document && document.body) {
            applySavedTheme();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                try { applySavedTheme(); } catch (e) {}
            });
        }
    } catch (e) {
        // ignore
    }

    // Делегируем клики по документу в режиме capture — это поймает клики, даже если дочерние обработчики остановят всплытие
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest && e.target.closest('.theme-toggle');
        if (btn) {
            try { e.preventDefault(); } catch (err) {}
            toggleTheme();
        }
    }, true); // <-- use capture

    // Наблюдатель: если на страницу динамически добавляются элементы .theme-toggle — обновим иконки
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
            const theme = getCurrentTheme() || document.documentElement.getAttribute('data-theme') || 'light';
            let found = false;
            mutations.forEach(m => {
                if (m.addedNodes && m.addedNodes.length) {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (node.matches('.theme-toggle') || node.querySelector && node.querySelector('.theme-toggle'))) {
                            found = true;
                        }
                    });
                }
            });
            if (found) updateIcons(theme);
        });
        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }

    // Экспортируем для вызова из других скриптов/страниц
    try {
        window.themeToggle = toggleTheme;
        window.applySavedTheme = applySavedTheme;
    } catch (e) {}

})();
