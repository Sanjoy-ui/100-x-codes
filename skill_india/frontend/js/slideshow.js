/**
 * Slideshow Module - Photo Slideshow Application
 * Core slideshow logic: manual, auto-play, and random modes
 */

const Slideshow = (function() {
    'use strict';

    // Slideshow modes
    const MODES = {
        MANUAL: 'manual',
        AUTO: 'auto',
        RANDOM: 'random'
    };

    // State
    let photos = [];
    let currentIndex = 0;
    let currentMode = MODES.MANUAL;
    let isPlaying = false;
    let intervalId = null;
    let progressIntervalId = null;
    let slideDuration = 5; // seconds
    let progressStartTime = null;

    // DOM Elements (cached)
    let elements = {};

    // Callbacks
    const changeCallbacks = [];

    /**
     * Initialize slideshow module
     * @param {Object} options - Configuration options
     */
    function init(options = {}) {
        // Cache DOM elements
        cacheElements();

        // Set initial values
        slideDuration = options.duration || Storage.getDuration() || 5;
        currentMode = options.mode || Storage.getMode() || MODES.MANUAL;

        // Bind navigation events
        bindNavigationEvents();

        // Update mode UI
        updateModeRadioButtons();

        console.log('Slideshow initialized with mode:', currentMode);
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheElements() {
        elements = {
            container: document.getElementById('slideshow-container'),
            display: document.getElementById('slideshow-display'),
            dropZone: document.getElementById('drop-zone'),
            slideImage: document.getElementById('slide-image'),
            currentSlide: document.getElementById('current-slide'),
            captionContainer: document.getElementById('caption-container'),
            captionText: document.getElementById('caption-text'),
            currentIndexEl: document.getElementById('current-index'),
            totalSlidesEl: document.getElementById('total-slides'),
            navPrev: document.getElementById('nav-prev'),
            navNext: document.getElementById('nav-next'),
            btnPlay: document.getElementById('btn-play'),
            btnPause: document.getElementById('btn-pause'),
            progressBar: document.getElementById('progress-bar'),
            progressFill: document.getElementById('progress-fill'),
            thumbnailStrip: document.getElementById('thumbnail-strip'),
            thumbnailsContainer: document.getElementById('thumbnails-container')
        };
    }

    /**
     * Bind navigation events
     */
    function bindNavigationEvents() {
        // Navigation buttons
        if (elements.navPrev) {
            elements.navPrev.addEventListener('click', () => goToPrevious());
        }
        if (elements.navNext) {
            elements.navNext.addEventListener('click', () => goToNext());
        }

        // Play/Pause buttons
        if (elements.btnPlay) {
            elements.btnPlay.addEventListener('click', () => play());
        }
        if (elements.btnPause) {
            elements.btnPause.addEventListener('click', () => pause());
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event
     */
    function handleKeyboardNavigation(event) {
        // Don't handle if command bar is open or in input field
        if (CommandBar && CommandBar.isOpen()) return;
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                goToPrevious();
                break;
            case 'ArrowRight':
                event.preventDefault();
                goToNext();
                break;
            case ' ':
                event.preventDefault();
                togglePlayPause();
                break;
        }
    }

    /**
     * Load photos into slideshow
     * @param {Array} photoArray - Array of photo objects
     */
    function loadPhotos(photoArray) {
        photos = photoArray;
        currentIndex = 0;

        if (photos.length > 0) {
            // Show slideshow display
            if (elements.dropZone) elements.dropZone.hidden = true;
            if (elements.display) elements.display.hidden = false;
            if (elements.thumbnailStrip) elements.thumbnailStrip.hidden = false;

            // Display first photo
            displayPhoto(0);

            // Generate thumbnails
            generateThumbnails();

            // Update counter
            updateCounter();
        } else {
            // Show drop zone
            if (elements.dropZone) elements.dropZone.hidden = false;
            if (elements.display) elements.display.hidden = true;
            if (elements.thumbnailStrip) elements.thumbnailStrip.hidden = true;
        }
    }

    /**
     * Display a photo at given index
     * @param {number} index - Photo index
     * @param {string} direction - Animation direction ('next' or 'prev')
     */
    function displayPhoto(index, direction = 'next') {
        if (photos.length === 0) return;

        // Ensure valid index
        index = Math.max(0, Math.min(index, photos.length - 1));

        const photo = photos[index];
        const oldIndex = currentIndex;
        currentIndex = index;

        // Get current theme
        const theme = Themes.getCurrent();

        // Hide caption first
        if (elements.captionContainer) {
            elements.captionContainer.classList.remove('visible', 'animating');
        }

        // Apply animation classes based on theme
        if (elements.currentSlide) {
            // Mark as exiting
            elements.currentSlide.classList.remove('active', 'entering', 'entering-reverse');
            elements.currentSlide.classList.add(direction === 'prev' ? 'exiting-reverse' : 'exiting');

            // After transition, update image and show
            const transitionDuration = Themes.getTransitionSpeed();
            
            setTimeout(() => {
                // Update image
                if (elements.slideImage) {
                    elements.slideImage.src = photo.src;
                    elements.slideImage.alt = photo.caption || photo.name;
                }

                // Remove exit classes and add enter
                elements.currentSlide.classList.remove('exiting', 'exiting-reverse');
                elements.currentSlide.classList.add(
                    direction === 'prev' ? 'entering-reverse' : 'entering'
                );

                // After enter animation
                setTimeout(() => {
                    elements.currentSlide.classList.remove('entering', 'entering-reverse');
                    elements.currentSlide.classList.add('active');

                    // Show caption
                    showCaption(photo);
                }, transitionDuration);

            }, transitionDuration);
        } else {
            // Fallback if no slide element
            if (elements.slideImage) {
                elements.slideImage.src = photo.src;
                elements.slideImage.alt = photo.caption || photo.name;
            }
            showCaption(photo);
        }

        // Update counter
        updateCounter();

        // Update thumbnails
        updateThumbnailActive();

        // Notify callbacks
        changeCallbacks.forEach(cb => cb(index, photo));

        // Reset progress if auto-playing
        if (isPlaying && (currentMode === MODES.AUTO || currentMode === MODES.RANDOM)) {
            startProgressAnimation();
        }
    }

    /**
     * Show caption with animation based on theme
     * @param {Object} photo - Photo object
     */
    function showCaption(photo) {
        if (!elements.captionText || !elements.captionContainer) return;

        const caption = photo.caption || generateCaptionFromFilename(photo.name);
        const theme = Themes.getCurrent();

        // For Theme C, wrap each word in a span for stagger animation
        if (theme === 'theme-c') {
            const words = caption.split(' ');
            elements.captionText.innerHTML = words
                .map(word => `<span class="caption-word">${word}</span>`)
                .join('');
        } else {
            elements.captionText.textContent = caption;
        }

        // Show caption with animation
        elements.captionContainer.classList.add('visible', 'animating');
    }

    /**
     * Generate caption from filename
     * @param {string} filename - File name
     * @returns {string} Generated caption
     */
    function generateCaptionFromFilename(filename) {
        // Remove extension
        let caption = filename.replace(/\.[^/.]+$/, '');
        
        // Replace hyphens and underscores with spaces
        caption = caption.replace(/[-_]/g, ' ');
        
        // Capitalize each word
        caption = caption.replace(/\b\w/g, char => char.toUpperCase());
        
        return caption;
    }

    /**
     * Update counter display
     */
    function updateCounter() {
        if (elements.currentIndexEl) {
            elements.currentIndexEl.textContent = currentIndex + 1;
        }
        if (elements.totalSlidesEl) {
            elements.totalSlidesEl.textContent = photos.length;
        }
    }

    /**
     * Go to next photo
     */
    function goToNext() {
        if (photos.length === 0) return;

        if (currentMode === MODES.RANDOM) {
            goToRandom();
        } else {
            const nextIndex = (currentIndex + 1) % photos.length;
            displayPhoto(nextIndex, 'next');
        }
    }

    /**
     * Go to previous photo
     */
    function goToPrevious() {
        if (photos.length === 0) return;

        const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
        displayPhoto(prevIndex, 'prev');
    }

    /**
     * Go to a random photo
     */
    function goToRandom() {
        if (photos.length <= 1) return;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * photos.length);
        } while (randomIndex === currentIndex);

        displayPhoto(randomIndex, 'next');
    }

    /**
     * Go to specific index
     * @param {number} index - Photo index
     */
    function goToIndex(index) {
        if (index < 0 || index >= photos.length) return;

        const direction = index > currentIndex ? 'next' : 'prev';
        displayPhoto(index, direction);
    }

    /**
     * Set slideshow mode
     * @param {string} mode - Mode (manual, auto, random)
     */
    function setMode(mode) {
        if (!Object.values(MODES).includes(mode)) {
            console.warn(`Invalid mode: ${mode}`);
            return;
        }

        // Stop current playback
        stop();

        currentMode = mode;
        Storage.setMode(mode);

        // Update UI
        updateModeRadioButtons();

        console.log('Slideshow mode set to:', mode);
    }

    /**
     * Update mode radio buttons
     */
    function updateModeRadioButtons() {
        const radios = document.querySelectorAll('input[name="slideshow-mode"]');
        radios.forEach(radio => {
            radio.checked = radio.value === currentMode;
        });
    }

    /**
     * Set slide duration
     * @param {number} seconds - Duration in seconds
     */
    function setDuration(seconds) {
        slideDuration = Math.max(1, Math.min(30, seconds));
        Storage.setDuration(slideDuration);

        // Restart auto-play if playing
        if (isPlaying) {
            stop();
            play();
        }
    }

    /**
     * Get current duration
     * @returns {number} Duration in seconds
     */
    function getDuration() {
        return slideDuration;
    }

    /**
     * Start auto-play or random mode
     */
    function play() {
        if (photos.length === 0) return;

        isPlaying = true;

        // Update play/pause buttons
        if (elements.btnPlay) elements.btnPlay.hidden = true;
        if (elements.btnPause) elements.btnPause.hidden = false;

        // Start progress animation
        startProgressAnimation();

        // Set interval for slide changes
        intervalId = setInterval(() => {
            if (currentMode === MODES.RANDOM) {
                goToRandom();
            } else {
                goToNext();
            }
        }, slideDuration * 1000);

        console.log('Slideshow playing');
    }

    /**
     * Pause slideshow
     */
    function pause() {
        isPlaying = false;

        // Update play/pause buttons
        if (elements.btnPlay) elements.btnPlay.hidden = false;
        if (elements.btnPause) elements.btnPause.hidden = true;

        // Stop progress animation
        stopProgressAnimation();

        // Clear interval
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }

        console.log('Slideshow paused');
    }

    /**
     * Stop slideshow (same as pause but resets)
     */
    function stop() {
        pause();
        resetProgress();
    }

    /**
     * Toggle play/pause
     */
    function togglePlayPause() {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }

    /**
     * Start progress bar animation
     */
    function startProgressAnimation() {
        stopProgressAnimation();
        resetProgress();

        if (!elements.progressFill) return;

        progressStartTime = Date.now();
        const duration = slideDuration * 1000;

        elements.progressFill.style.transition = `width ${duration}ms linear`;
        
        // Force reflow
        elements.progressFill.offsetWidth;
        
        elements.progressFill.style.width = '100%';
    }

    /**
     * Stop progress bar animation
     */
    function stopProgressAnimation() {
        if (!elements.progressFill) return;

        // Get current width
        const computed = window.getComputedStyle(elements.progressFill);
        const currentWidth = computed.width;

        elements.progressFill.style.transition = 'none';
        elements.progressFill.style.width = currentWidth;
    }

    /**
     * Reset progress bar
     */
    function resetProgress() {
        if (!elements.progressFill) return;

        elements.progressFill.style.transition = 'none';
        elements.progressFill.style.width = '0%';
    }

    /**
     * Generate thumbnails
     */
    function generateThumbnails() {
        if (!elements.thumbnailsContainer) return;

        elements.thumbnailsContainer.innerHTML = '';

        photos.forEach((photo, index) => {
            const thumb = document.createElement('img');
            thumb.src = photo.src;
            thumb.alt = photo.name;
            thumb.className = 'thumbnail';
            thumb.dataset.index = index;

            if (index === currentIndex) {
                thumb.classList.add('active');
            }

            thumb.addEventListener('click', () => goToIndex(index));

            elements.thumbnailsContainer.appendChild(thumb);
        });
    }

    /**
     * Update active thumbnail
     */
    function updateThumbnailActive() {
        if (!elements.thumbnailsContainer) return;

        const thumbs = elements.thumbnailsContainer.querySelectorAll('.thumbnail');
        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentIndex);
        });
    }

    /**
     * Shuffle photos array
     */
    function shuffle() {
        if (photos.length <= 1) return;

        // Fisher-Yates shuffle
        for (let i = photos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [photos[i], photos[j]] = [photos[j], photos[i]];
        }

        // Regenerate thumbnails and display first
        generateThumbnails();
        displayPhoto(0);

        console.log('Photos shuffled');
    }

    /**
     * Get current mode
     * @returns {string} Current mode
     */
    function getMode() {
        return currentMode;
    }

    /**
     * Get current photo index
     * @returns {number} Current index
     */
    function getCurrentIndex() {
        return currentIndex;
    }

    /**
     * Get all photos
     * @returns {Array} Photos array
     */
    function getPhotos() {
        return [...photos];
    }

    /**
     * Get current photo
     * @returns {Object} Current photo object
     */
    function getCurrentPhoto() {
        return photos[currentIndex] || null;
    }

    /**
     * Check if slideshow is playing
     * @returns {boolean} Is playing
     */
    function getIsPlaying() {
        return isPlaying;
    }

    /**
     * Register callback for slide change
     * @param {Function} callback
     */
    function onChange(callback) {
        if (typeof callback === 'function') {
            changeCallbacks.push(callback);
        }
    }

    /**
     * Update photo order (after drag and drop)
     * @param {Array} newOrder - New order of photos
     */
    function updateOrder(newOrder) {
        photos = newOrder;
        generateThumbnails();
    }

    /**
     * Update caption for a photo
     * @param {number} index - Photo index
     * @param {string} caption - New caption
     */
    function updateCaption(index, caption) {
        if (photos[index]) {
            photos[index].caption = caption;
            Storage.setCaption(photos[index].name, caption);

            // If current photo, update display
            if (index === currentIndex) {
                showCaption(photos[index]);
            }
        }
    }

    // Public API
    return {
        MODES,
        init,
        loadPhotos,
        displayPhoto,
        goToNext,
        goToPrevious,
        goToRandom,
        goToIndex,
        setMode,
        getMode,
        setDuration,
        getDuration,
        play,
        pause,
        stop,
        togglePlayPause,
        shuffle,
        getCurrentIndex,
        getPhotos,
        getCurrentPhoto,
        isPlaying: getIsPlaying,
        onChange,
        updateOrder,
        updateCaption,
        generateCaptionFromFilename
    };
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Slideshow;
}
