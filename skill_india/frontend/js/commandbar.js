/**
 * Command Bar Module - Photo Slideshow Application
 * Keyboard-driven command palette (CTRL+K or /)
 */

const CommandBar = (function() {
    'use strict';

    // State
    let isOpen = false;
    let selectedIndex = 0;
    let filteredCommands = [];

    // DOM Elements
    let elements = {};

    // Available commands
    const commands = [
        // Mode commands
        {
            id: 'mode-manual',
            label: 'Switch to Manual Mode',
            category: 'Mode',
            icon: '🎮',
            action: () => {
                Slideshow.setMode('manual');
                App.showNotification('Switched to Manual Mode');
            }
        },
        {
            id: 'mode-auto',
            label: 'Switch to Auto-Play Mode',
            category: 'Mode',
            icon: '▶️',
            action: () => {
                Slideshow.setMode('auto');
                Slideshow.play();
                App.showNotification('Switched to Auto-Play Mode');
            }
        },
        {
            id: 'mode-random',
            label: 'Switch to Random Mode',
            category: 'Mode',
            icon: '🔀',
            action: () => {
                Slideshow.setMode('random');
                Slideshow.play();
                App.showNotification('Switched to Random Mode');
            }
        },

        // Theme commands
        {
            id: 'theme-a',
            label: 'Theme A - Direct Display',
            category: 'Theme',
            icon: '🎨',
            action: () => {
                Themes.apply('theme-a');
                App.showNotification('Theme A Applied');
            }
        },
        {
            id: 'theme-b',
            label: 'Theme B - Horizontal Slide',
            category: 'Theme',
            icon: '🎨',
            action: () => {
                Themes.apply('theme-b');
                App.showNotification('Theme B Applied');
            }
        },
        {
            id: 'theme-c',
            label: 'Theme C - Vertical Slide',
            category: 'Theme',
            icon: '🎨',
            action: () => {
                Themes.apply('theme-c');
                App.showNotification('Theme C Applied');
            }
        },
        {
            id: 'theme-d',
            label: 'Theme D - Fade Effect',
            category: 'Theme',
            icon: '🎨',
            action: () => {
                Themes.apply('theme-d');
                App.showNotification('Theme D Applied');
            }
        },

        // Playback commands
        {
            id: 'play',
            label: 'Play Slideshow',
            category: 'Playback',
            icon: '▶️',
            shortcut: 'Space',
            action: () => {
                Slideshow.play();
                App.showNotification('Slideshow Playing');
            }
        },
        {
            id: 'pause',
            label: 'Pause Slideshow',
            category: 'Playback',
            icon: '⏸️',
            shortcut: 'Space',
            action: () => {
                Slideshow.pause();
                App.showNotification('Slideshow Paused');
            }
        },

        // Photo management
        {
            id: 'shuffle',
            label: 'Shuffle Photos',
            category: 'Photos',
            icon: '🔀',
            action: () => {
                Slideshow.shuffle();
                App.showNotification('Photos Shuffled');
            }
        },
        {
            id: 'load-samples',
            label: 'Load Sample Photos',
            category: 'Photos',
            icon: '📷',
            action: () => {
                App.loadSamplePhotos();
            }
        },

        // Display commands
        {
            id: 'toggle-dark-mode',
            label: 'Toggle Dark/Light Mode',
            category: 'Display',
            icon: '🌓',
            action: () => {
                const isDark = Themes.toggleDarkMode();
                App.showNotification(isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled');
            }
        },
        {
            id: 'open-settings',
            label: 'Open Settings Panel',
            category: 'Display',
            icon: '⚙️',
            action: () => {
                App.toggleConfigPanel(true);
            }
        },

        // Navigation commands
        {
            id: 'next-slide',
            label: 'Next Slide',
            category: 'Navigation',
            icon: '➡️',
            shortcut: '→',
            action: () => {
                Slideshow.goToNext();
            }
        },
        {
            id: 'prev-slide',
            label: 'Previous Slide',
            category: 'Navigation',
            icon: '⬅️',
            shortcut: '←',
            action: () => {
                Slideshow.goToPrevious();
            }
        }
    ];

    /**
     * Initialize command bar
     */
    function init() {
        cacheElements();
        bindEvents();
        renderCommands(commands);

        console.log('Command Bar initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements = {
            overlay: document.getElementById('command-bar-overlay'),
            commandBar: document.getElementById('command-bar'),
            input: document.getElementById('command-input'),
            list: document.getElementById('command-list')
        };
    }

    /**
     * Bind keyboard and click events
     */
    function bindEvents() {
        // Global keyboard shortcut to open
        document.addEventListener('keydown', handleGlobalKeydown);

        // Input events
        if (elements.input) {
            elements.input.addEventListener('input', handleInput);
            elements.input.addEventListener('keydown', handleInputKeydown);
        }

        // Close on overlay click
        if (elements.overlay) {
            elements.overlay.addEventListener('click', (e) => {
                if (e.target === elements.overlay) {
                    close();
                }
            });
        }
    }

    /**
     * Handle global keydown for opening command bar
     * @param {KeyboardEvent} event
     */
    function handleGlobalKeydown(event) {
        // Skip if already in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            // But allow ESC to close
            if (event.key === 'Escape' && isOpen) {
                close();
            }
            return;
        }

        // Open with Ctrl+K or /
        if ((event.ctrlKey && event.key === 'k') || (event.key === '/' && !isOpen)) {
            event.preventDefault();
            open();
            return;
        }

        // Close with Escape
        if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            close();
        }
    }

    /**
     * Handle input in search field
     * @param {Event} event
     */
    function handleInput(event) {
        const query = event.target.value.toLowerCase().trim();
        filterCommands(query);
    }

    /**
     * Handle keydown in input field
     * @param {KeyboardEvent} event
     */
    function handleInputKeydown(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                selectNext();
                break;
            case 'ArrowUp':
                event.preventDefault();
                selectPrevious();
                break;
            case 'Enter':
                event.preventDefault();
                executeSelected();
                break;
            case 'Escape':
                event.preventDefault();
                close();
                break;
        }
    }

    /**
     * Filter commands based on query
     * @param {string} query - Search query
     */
    function filterCommands(query) {
        if (!query) {
            filteredCommands = [...commands];
        } else {
            filteredCommands = commands.filter(cmd => 
                cmd.label.toLowerCase().includes(query) ||
                cmd.category.toLowerCase().includes(query)
            );
        }

        selectedIndex = 0;
        renderCommands(filteredCommands);
    }

    /**
     * Render commands to list
     * @param {Array} commandList - Commands to render
     */
    function renderCommands(commandList) {
        if (!elements.list) return;

        if (commandList.length === 0) {
            elements.list.innerHTML = `
                <li class="command-item no-results">
                    <span class="command-label">No commands found</span>
                </li>
            `;
            return;
        }

        elements.list.innerHTML = commandList.map((cmd, index) => `
            <li class="command-item ${index === selectedIndex ? 'selected' : ''}" 
                data-index="${index}" 
                data-id="${cmd.id}">
                <span class="command-icon">${cmd.icon}</span>
                <span class="command-label">${cmd.label}</span>
                ${cmd.shortcut ? `<span class="command-shortcut">${cmd.shortcut}</span>` : ''}
                <span class="command-category">${cmd.category}</span>
            </li>
        `).join('');

        // Bind click events
        elements.list.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index, 10);
                selectedIndex = index;
                executeSelected();
            });

            item.addEventListener('mouseenter', () => {
                const index = parseInt(item.dataset.index, 10);
                selectedIndex = index;
                updateSelectedUI();
            });
        });
    }

    /**
     * Select next command
     */
    function selectNext() {
        if (filteredCommands.length === 0) return;
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        updateSelectedUI();
        scrollToSelected();
    }

    /**
     * Select previous command
     */
    function selectPrevious() {
        if (filteredCommands.length === 0) return;
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
        updateSelectedUI();
        scrollToSelected();
    }

    /**
     * Update selected item UI
     */
    function updateSelectedUI() {
        if (!elements.list) return;

        elements.list.querySelectorAll('.command-item').forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    /**
     * Scroll to keep selected item visible
     */
    function scrollToSelected() {
        if (!elements.list) return;

        const selectedItem = elements.list.querySelector('.command-item.selected');
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * Execute the selected command
     */
    function executeSelected() {
        const command = filteredCommands[selectedIndex];
        if (command && typeof command.action === 'function') {
            close();
            // Small delay to allow UI to update
            setTimeout(() => {
                command.action();
            }, 100);
        }
    }

    /**
     * Open command bar
     */
    function open() {
        if (isOpen) return;

        isOpen = true;
        selectedIndex = 0;
        filteredCommands = [...commands];

        if (elements.overlay) {
            elements.overlay.hidden = false;
        }

        if (elements.input) {
            elements.input.value = '';
            // Focus after transition
            setTimeout(() => {
                elements.input.focus();
            }, 50);
        }

        renderCommands(commands);
    }

    /**
     * Close command bar
     */
    function close() {
        if (!isOpen) return;

        isOpen = false;

        if (elements.overlay) {
            elements.overlay.hidden = true;
        }

        if (elements.input) {
            elements.input.value = '';
            elements.input.blur();
        }
    }

    /**
     * Toggle command bar
     */
    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    /**
     * Check if command bar is open
     * @returns {boolean}
     */
    function getIsOpen() {
        return isOpen;
    }

    /**
     * Add a custom command
     * @param {Object} command - Command object
     */
    function addCommand(command) {
        if (command && command.id && command.label && command.action) {
            commands.push(command);
        }
    }

    /**
     * Remove a command by ID
     * @param {string} id - Command ID
     */
    function removeCommand(id) {
        const index = commands.findIndex(cmd => cmd.id === id);
        if (index !== -1) {
            commands.splice(index, 1);
        }
    }

    // Public API
    return {
        init,
        open,
        close,
        toggle,
        isOpen: getIsOpen,
        addCommand,
        removeCommand
    };
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommandBar;
}
