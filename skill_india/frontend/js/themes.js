/**
 * Themes Module - Photo Slideshow Application
 * Handles theme switching and management
 */

const Themes = (function() {
    'use strict';

    // Available themes
    const THEMES = {
        'theme-a': {
            id: 'theme-a',
            name: 'Theme A - Direct',
            description: 'No animation, direct display'
        },
        'theme-b': {
            id: 'theme-b',
            name: 'Theme B - Horizontal',
            description: 'Image slides from left to right'
        },
        'theme-c': {
            id: 'theme-c',
            name: 'Theme C - Vertical',
            description: 'Image slides from bottom to top with word stagger'
        },
        'theme-d': {
            id: 'theme-d',
            name: 'Theme D - Fade',
            description: 'Smooth crossfade transition'
        }
    };

    // Current active theme
    let currentTheme = 'theme-a';

    // Callbacks for theme change
    const changeCallbacks = [];

    /**
     * Initialize themes module
     * @param {string} initialTheme - Theme to start with
     */
    function init(initialTheme) {
        currentTheme = initialTheme || Storage.getTheme() || 'theme-a';
        applyTheme(currentTheme);
    }

    /**
     * Apply a theme to the document
     * @param {string} themeId - Theme identifier
     */
    function applyTheme(themeId) {
        if (!THEMES[themeId]) {
            console.warn(`Theme "${themeId}" not found, defaulting to theme-a`);
            themeId = 'theme-a';
        }

        // Remove all theme classes from body
        Object.keys(THEMES).forEach(id => {
            document.body.classList.remove(id);
        });

        // Add new theme class
        document.body.classList.add(themeId);
        currentTheme = themeId;

        // Update theme buttons in config panel
        updateThemeButtons(themeId);

        // Save to storage
        Storage.setTheme(themeId);

        // Notify callbacks
        changeCallbacks.forEach(callback => callback(themeId));

        console.log(`Theme changed to: ${themeId}`);
    }

    /**
     * Update theme button active states
     * @param {string} activeTheme - Currently active theme
     */
    function updateThemeButtons(activeTheme) {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            const theme = btn.getAttribute('data-theme');
            btn.classList.toggle('active', theme === activeTheme);
        });
    }

    /**
     * Get current theme
     * @returns {string} Current theme ID
     */
    function getCurrentTheme() {
        return currentTheme;
    }

    /**
     * Get theme info
     * @param {string} themeId - Theme identifier
     * @returns {Object} Theme info object
     */
    function getThemeInfo(themeId) {
        return THEMES[themeId] || null;
    }

    /**
     * Get all available themes
     * @returns {Object} All themes
     */
    function getAllThemes() {
        return { ...THEMES };
    }

    /**
     * Cycle to next theme
     * @returns {string} New theme ID
     */
    function nextTheme() {
        const themeIds = Object.keys(THEMES);
        const currentIndex = themeIds.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        const nextThemeId = themeIds[nextIndex];
        applyTheme(nextThemeId);
        return nextThemeId;
    }

    /**
     * Cycle to previous theme
     * @returns {string} New theme ID
     */
    function previousTheme() {
        const themeIds = Object.keys(THEMES);
        const currentIndex = themeIds.indexOf(currentTheme);
        const prevIndex = (currentIndex - 1 + themeIds.length) % themeIds.length;
        const prevThemeId = themeIds[prevIndex];
        applyTheme(prevThemeId);
        return prevThemeId;
    }

    /**
     * Register a callback for theme changes
     * @param {Function} callback - Callback function
     */
    function onChange(callback) {
        if (typeof callback === 'function') {
            changeCallbacks.push(callback);
        }
    }

    /**
     * Set transition speed CSS variable
     * @param {number} speed - Speed in milliseconds
     */
    function setTransitionSpeed(speed) {
        document.documentElement.style.setProperty(
            '--slide-transition-duration',
            `${speed}ms`
        );
        Storage.setTransitionSpeed(speed);
    }

    /**
     * Get current transition speed
     * @returns {number} Speed in milliseconds
     */
    function getTransitionSpeed() {
        return Storage.getTransitionSpeed();
    }

    /**
     * Toggle dark/light mode
     * @returns {boolean} New dark mode state
     */
    function toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const newMode = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', newMode);
        Storage.setDarkMode(!isDark);
        return !isDark;
    }

    /**
     * Set dark mode explicitly
     * @param {boolean} isDark - Dark mode state
     */
    function setDarkMode(isDark) {
        const mode = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', mode);
        Storage.setDarkMode(isDark);
    }

    /**
     * Get current dark mode state
     * @returns {boolean} Is dark mode active
     */
    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // Public API
    return {
        THEMES,
        init,
        apply: applyTheme,
        getCurrent: getCurrentTheme,
        getInfo: getThemeInfo,
        getAll: getAllThemes,
        next: nextTheme,
        previous: previousTheme,
        onChange,
        setTransitionSpeed,
        getTransitionSpeed,
        toggleDarkMode,
        setDarkMode,
        isDarkMode
    };
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Themes;
}
