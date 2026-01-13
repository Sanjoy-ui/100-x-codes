/**
 * Storage Module - Photo Slideshow Application
 * Handles localStorage persistence for all settings
 */

const Storage = (function() {
    'use strict';

    // Storage keys
    const KEYS = {
        MODE: 'slideshow_mode',
        THEME: 'slideshow_theme',
        DURATION: 'slideshow_duration',
        TRANSITION_SPEED: 'slideshow_transition_speed',
        DARK_MODE: 'slideshow_dark_mode',
        PHOTOS: 'slideshow_photos',
        CAPTIONS: 'slideshow_captions'
    };

    // Default values
    const DEFAULTS = {
        mode: 'manual',
        theme: 'theme-a',
        duration: 5,
        transitionSpeed: 500,
        darkMode: false,
        photos: [],
        captions: {}
    };

    /**
     * Get a value from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Stored value or default
     */
    function get(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error(`Storage.get error for key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Set a value in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    function set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Storage.set error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Remove a value from localStorage
     * @param {string} key - Storage key
     */
    function remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Storage.remove error for key "${key}":`, error);
        }
    }

    /**
     * Clear all slideshow-related storage
     */
    function clearAll() {
        Object.values(KEYS).forEach(key => remove(key));
    }

    // Public API for specific settings
    return {
        // Keys reference
        KEYS,
        DEFAULTS,

        // Generic methods
        get,
        set,
        remove,
        clearAll,

        // Slideshow Mode
        getMode: () => get(KEYS.MODE, DEFAULTS.mode),
        setMode: (mode) => set(KEYS.MODE, mode),

        // Theme
        getTheme: () => get(KEYS.THEME, DEFAULTS.theme),
        setTheme: (theme) => set(KEYS.THEME, theme),

        // Slide Duration (seconds)
        getDuration: () => get(KEYS.DURATION, DEFAULTS.duration),
        setDuration: (duration) => set(KEYS.DURATION, parseInt(duration, 10)),

        // Transition Speed (milliseconds)
        getTransitionSpeed: () => get(KEYS.TRANSITION_SPEED, DEFAULTS.transitionSpeed),
        setTransitionSpeed: (speed) => set(KEYS.TRANSITION_SPEED, parseInt(speed, 10)),

        // Dark Mode
        getDarkMode: () => get(KEYS.DARK_MODE, DEFAULTS.darkMode),
        setDarkMode: (isDark) => set(KEYS.DARK_MODE, Boolean(isDark)),

        // Photos (stores metadata, not actual image data)
        getPhotos: () => get(KEYS.PHOTOS, DEFAULTS.photos),
        setPhotos: (photos) => set(KEYS.PHOTOS, photos),

        // Captions (object mapping filename to custom caption)
        getCaptions: () => get(KEYS.CAPTIONS, DEFAULTS.captions),
        setCaptions: (captions) => set(KEYS.CAPTIONS, captions),

        /**
         * Get caption for a specific photo
         * @param {string} filename - Photo filename
         * @returns {string|null} Custom caption or null
         */
        getCaption: function(filename) {
            const captions = this.getCaptions();
            return captions[filename] || null;
        },

        /**
         * Set caption for a specific photo
         * @param {string} filename - Photo filename
         * @param {string} caption - Custom caption
         */
        setCaption: function(filename, caption) {
            const captions = this.getCaptions();
            captions[filename] = caption;
            this.setCaptions(captions);
        },

        /**
         * Get all settings as an object
         * @returns {Object} All settings
         */
        getAllSettings: function() {
            return {
                mode: this.getMode(),
                theme: this.getTheme(),
                duration: this.getDuration(),
                transitionSpeed: this.getTransitionSpeed(),
                darkMode: this.getDarkMode()
            };
        },

        /**
         * Restore all settings from an object
         * @param {Object} settings - Settings object
         */
        restoreSettings: function(settings) {
            if (settings.mode) this.setMode(settings.mode);
            if (settings.theme) this.setTheme(settings.theme);
            if (settings.duration) this.setDuration(settings.duration);
            if (settings.transitionSpeed) this.setTransitionSpeed(settings.transitionSpeed);
            if (typeof settings.darkMode === 'boolean') this.setDarkMode(settings.darkMode);
        }
    };
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
