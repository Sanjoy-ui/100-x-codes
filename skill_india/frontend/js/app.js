/**
 * App Module - Photo Slideshow Application
 * Main application initialization, drag-drop, and event binding
 */

const App = (function() {
    'use strict';

    // State
    let photos = [];
    let draggedItem = null;
    let notificationTimeout = null;

    // Sample photos for demo (using placeholder images)
    const SAMPLE_PHOTOS = [
        { name: 'mountain-sunrise.jpg', src: 'https://picsum.photos/seed/mountain/800/600' },
        { name: 'ocean-waves.jpg', src: 'https://picsum.photos/seed/ocean/800/600' },
        { name: 'forest-path.jpg', src: 'https://picsum.photos/seed/forest/800/600' },
        { name: 'city-skyline.jpg', src: 'https://picsum.photos/seed/city/800/600' },
        { name: 'desert-sunset.jpg', src: 'https://picsum.photos/seed/desert/800/600' },
        { name: 'snowy-peaks.jpg', src: 'https://picsum.photos/seed/snow/800/600' },
        { name: 'tropical-beach.jpg', src: 'https://picsum.photos/seed/beach/800/600' },
        { name: 'autumn-leaves.jpg', src: 'https://picsum.photos/seed/autumn/800/600' }
    ];

    // DOM Elements
    let elements = {};

    /**
     * Initialize the application
     */
    function init() {
        console.log('Photo Slideshow Application Initializing...');

        // Cache DOM elements
        cacheElements();

        // Restore settings from storage
        restoreSettings();

        // Initialize modules
        initModules();

        // Bind all event listeners
        bindEvents();

        // Check for existing photos in storage (future enhancement)
        // For now, show drop zone

        console.log('Photo Slideshow Application Ready!');
    }

    /**
     * Cache frequently used DOM elements
     */
    function cacheElements() {
        elements = {
            // Drop zone
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'),
            loadSamplesBtn: document.getElementById('load-samples'),

            // Config panel
            configPanel: document.getElementById('config-panel'),
            toggleConfig: document.getElementById('toggle-config'),
            closeConfig: document.getElementById('close-config'),

            // Theme mode toggle
            toggleThemeMode: document.getElementById('toggle-theme-mode'),

            // Slideshow mode radios
            modeRadios: document.querySelectorAll('input[name="slideshow-mode"]'),

            // Theme buttons
            themeButtons: document.querySelectorAll('.theme-btn'),

            // Sliders
            durationSlider: document.getElementById('slide-duration'),
            durationValue: document.getElementById('duration-value'),
            transitionSlider: document.getElementById('transition-speed'),
            transitionValue: document.getElementById('transition-value'),

            // Photo management
            shuffleBtn: document.getElementById('shuffle-photos'),
            clearBtn: document.getElementById('clear-photos'),
            photoList: document.getElementById('photo-list'),

            // Caption editor
            captionSelect: document.getElementById('caption-photo-select'),
            captionInput: document.getElementById('caption-input'),
            saveCaptionBtn: document.getElementById('save-caption')
        };
    }

    /**
     * Restore settings from localStorage
     */
    function restoreSettings() {
        // Dark mode
        const isDark = Storage.getDarkMode();
        Themes.setDarkMode(isDark);

        // Theme
        const theme = Storage.getTheme();
        Themes.apply(theme);

        // Transition speed
        const transitionSpeed = Storage.getTransitionSpeed();
        Themes.setTransitionSpeed(transitionSpeed);
        if (elements.transitionSlider) {
            elements.transitionSlider.value = transitionSpeed;
        }
        if (elements.transitionValue) {
            elements.transitionValue.textContent = transitionSpeed;
        }

        // Duration
        const duration = Storage.getDuration();
        if (elements.durationSlider) {
            elements.durationSlider.value = duration;
        }
        if (elements.durationValue) {
            elements.durationValue.textContent = duration;
        }
    }

    /**
     * Initialize all modules
     */
    function initModules() {
        // Initialize Themes
        Themes.init();

        // Initialize Slideshow
        Slideshow.init({
            duration: Storage.getDuration(),
            mode: Storage.getMode()
        });

        // Initialize Command Bar
        CommandBar.init();
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // Drop zone events
        bindDropZoneEvents();

        // Config panel events
        bindConfigPanelEvents();

        // Slider events
        bindSliderEvents();

        // Photo management events
        bindPhotoManagementEvents();

        // Caption editor events
        bindCaptionEditorEvents();
    }

    /**
     * Bind drop zone events for drag and drop
     */
    function bindDropZoneEvents() {
        const dropZone = elements.dropZone;
        const fileInput = elements.fileInput;

        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop zone on drag over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });

        // Remove highlight on drag leave or drop
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);

        // Click to select files
        dropZone.addEventListener('click', (e) => {
            if (e.target !== elements.loadSamplesBtn) {
                fileInput.click();
            }
        });

        // Handle file input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
            });
        }

        // Load samples button
        if (elements.loadSamplesBtn) {
            elements.loadSamplesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadSamplePhotos();
            });
        }
    }

    /**
     * Prevent default browser behavior
     * @param {Event} e
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handle dropped files
     * @param {DragEvent} e
     */
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    /**
     * Handle selected/dropped files
     * @param {FileList} files
     */
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            return file.type.startsWith('image/');
        });

        if (validFiles.length === 0) {
            showNotification('Please select valid image files', 'error');
            return;
        }

        const existingNames = photos.map(p => p.name);
        let addedCount = 0;
        let duplicateCount = 0;

        const filePromises = validFiles.map(file => {
            return new Promise((resolve) => {
                // Check for duplicates by filename
                if (existingNames.includes(file.name)) {
                    duplicateCount++;
                    resolve(null);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const caption = Storage.getCaption(file.name) || null;
                    resolve({
                        name: file.name,
                        src: e.target.result,
                        caption: caption
                    });
                    addedCount++;
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then(results => {
            const newPhotos = results.filter(p => p !== null);
            photos = [...photos, ...newPhotos];

            // Load into slideshow
            Slideshow.loadPhotos(photos);

            // Update photo list in config panel
            updatePhotoList();
            updateCaptionSelect();

            // Show notification
            let message = `${addedCount} photo(s) added`;
            if (duplicateCount > 0) {
                message += `, ${duplicateCount} duplicate(s) skipped`;
            }
            showNotification(message);
        });
    }

    /**
     * Load sample photos
     */
    function loadSamplePhotos() {
        showNotification('Loading sample photos...');

        // Generate photo objects from samples
        photos = SAMPLE_PHOTOS.map(sample => ({
            name: sample.name,
            src: sample.src,
            caption: Storage.getCaption(sample.name) || null
        }));

        // Load into slideshow
        Slideshow.loadPhotos(photos);

        // Update UI
        updatePhotoList();
        updateCaptionSelect();

        showNotification(`${photos.length} sample photos loaded`);
    }

    /**
     * Bind config panel events
     */
    function bindConfigPanelEvents() {
        // Toggle config panel
        if (elements.toggleConfig) {
            elements.toggleConfig.addEventListener('click', () => {
                toggleConfigPanel();
            });
        }

        // Close config panel
        if (elements.closeConfig) {
            elements.closeConfig.addEventListener('click', () => {
                toggleConfigPanel(false);
            });
        }

        // Theme mode toggle (dark/light)
        if (elements.toggleThemeMode) {
            elements.toggleThemeMode.addEventListener('click', () => {
                Themes.toggleDarkMode();
            });
        }

        // Slideshow mode radios
        elements.modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const mode = e.target.value;
                Slideshow.setMode(mode);
                
                // Auto-start if auto or random
                if (mode === 'auto' || mode === 'random') {
                    Slideshow.play();
                }
            });
        });

        // Theme buttons
        elements.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                Themes.apply(theme);
            });
        });
    }

    /**
     * Toggle config panel visibility
     * @param {boolean} [forceState] - Force open or close
     */
    function toggleConfigPanel(forceState) {
        if (!elements.configPanel) return;

        const isHidden = elements.configPanel.hidden;
        const shouldShow = forceState !== undefined ? forceState : isHidden;

        elements.configPanel.hidden = !shouldShow;
    }

    /**
     * Bind slider events
     */
    function bindSliderEvents() {
        // Duration slider
        if (elements.durationSlider) {
            elements.durationSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                if (elements.durationValue) {
                    elements.durationValue.textContent = value;
                }
                Slideshow.setDuration(parseInt(value, 10));
            });
        }

        // Transition speed slider
        if (elements.transitionSlider) {
            elements.transitionSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                if (elements.transitionValue) {
                    elements.transitionValue.textContent = value;
                }
                Themes.setTransitionSpeed(parseInt(value, 10));
            });
        }
    }

    /**
     * Bind photo management events
     */
    function bindPhotoManagementEvents() {
        // Shuffle button
        if (elements.shuffleBtn) {
            elements.shuffleBtn.addEventListener('click', () => {
                Slideshow.shuffle();
                photos = Slideshow.getPhotos();
                updatePhotoList();
                showNotification('Photos shuffled');
            });
        }

        // Clear all button
        if (elements.clearBtn) {
            elements.clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all photos?')) {
                    photos = [];
                    Slideshow.loadPhotos([]);
                    updatePhotoList();
                    updateCaptionSelect();
                    showNotification('All photos cleared');
                }
            });
        }
    }

    /**
     * Update photo list in config panel (with drag reorder)
     */
    function updatePhotoList() {
        if (!elements.photoList) return;

        if (photos.length === 0) {
            elements.photoList.innerHTML = '<li class="photo-list-item">No photos loaded</li>';
            return;
        }

        elements.photoList.innerHTML = photos.map((photo, index) => `
            <li class="photo-list-item" draggable="true" data-index="${index}">
                <span class="drag-handle">☰</span>
                <img src="${photo.src}" alt="${photo.name}" class="photo-thumbnail">
                <span class="photo-name">${photo.name}</span>
            </li>
        `).join('');

        // Bind drag events for reordering
        bindPhotoListDragEvents();
    }

    /**
     * Bind drag events for photo list reordering
     */
    function bindPhotoListDragEvents() {
        const items = elements.photoList.querySelectorAll('.photo-list-item');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                draggedItem = null;
                item.classList.remove('dragging');
                
                // Update photos array based on new order
                const newOrder = Array.from(elements.photoList.querySelectorAll('.photo-list-item'))
                    .map(li => parseInt(li.dataset.index, 10))
                    .filter(i => !isNaN(i));

                const reorderedPhotos = newOrder.map(i => photos[i]);
                photos = reorderedPhotos;
                
                // Update slideshow
                Slideshow.updateOrder(photos);
                
                // Re-render with new indices
                updatePhotoList();
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            item.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (draggedItem && item !== draggedItem) {
                    const rect = item.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    
                    if (e.clientY < midY) {
                        item.parentNode.insertBefore(draggedItem, item);
                    } else {
                        item.parentNode.insertBefore(draggedItem, item.nextSibling);
                    }
                }
            });
        });
    }

    /**
     * Bind caption editor events
     */
    function bindCaptionEditorEvents() {
        // Caption select change
        if (elements.captionSelect) {
            elements.captionSelect.addEventListener('change', (e) => {
                const index = parseInt(e.target.value, 10);
                if (!isNaN(index) && photos[index]) {
                    const photo = photos[index];
                    elements.captionInput.value = photo.caption || 
                        Slideshow.generateCaptionFromFilename(photo.name);
                }
            });
        }

        // Save caption button
        if (elements.saveCaptionBtn) {
            elements.saveCaptionBtn.addEventListener('click', () => {
                const index = parseInt(elements.captionSelect.value, 10);
                const caption = elements.captionInput.value.trim();

                if (isNaN(index)) {
                    showNotification('Please select a photo first', 'error');
                    return;
                }

                if (!caption) {
                    showNotification('Please enter a caption', 'error');
                    return;
                }

                // Update photo caption
                photos[index].caption = caption;
                Slideshow.updateCaption(index, caption);
                
                showNotification('Caption saved');
            });
        }
    }

    /**
     * Update caption select dropdown
     */
    function updateCaptionSelect() {
        if (!elements.captionSelect) return;

        const options = ['<option value="">Select a photo...</option>'];
        
        photos.forEach((photo, index) => {
            options.push(`<option value="${index}">${photo.name}</option>`);
        });

        elements.captionSelect.innerHTML = options.join('');
        elements.captionInput.value = '';
    }

    /**
     * Show notification toast
     * @param {string} message - Notification message
     * @param {string} type - 'success' | 'error' | 'info'
     */
    function showNotification(message, type = 'success') {
        // Clear existing notification timeout
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }

        // Remove existing notification
        let notification = document.querySelector('.notification');
        if (notification) {
            notification.remove();
        }

        // Create notification element
        notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background-color: ${type === 'error' ? 'var(--color-danger)' : 'var(--color-success)'};
            color: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideUp 300ms ease;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        notificationTimeout = setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(20px)';
            notification.style.transition = 'all 300ms ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Get current photos
     * @returns {Array} Photos array
     */
    function getPhotos() {
        return [...photos];
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        init,
        loadSamplePhotos,
        showNotification,
        toggleConfigPanel,
        getPhotos
    };
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
