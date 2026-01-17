
class TooltipSystem {
    constructor() {
        this.activeTooltips = new Map();
        // Bind methods in constructor to avoid context issues
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.hideAllTooltips = this.hideAllTooltips.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.init();
    }

    init() {
        // Buscar todos los elementos con tooltip
        const tooltipElements = document.querySelectorAll('[data-tooltip-content]');
        tooltipElements.forEach(el => this.setupTooltip(el));
        
        // Add keyboard support for Escape key
        document.addEventListener('keydown', this.handleEscape);
        
        // Add scroll and resize listeners with passive option
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize, { passive: true });
    }
    
    handleEscape(e) {
        if (e.key === 'Escape') {
            this.hideAllTooltips();
        }
    }
    
    handleScroll() {
        this.hideAllTooltips();
    }
    
    handleResize() {
        this.hideAllTooltips();
    }

    setupTooltip(element) {
        const contentId = element.getAttribute('data-tooltip-content');
        const trigger = element.getAttribute('data-tooltip-trigger') || 'hover';
        const position = element.getAttribute('data-tooltip-position') || 'top';

        const contentElement = document.getElementById(contentId);
        if (!contentElement) {
            console.warn(`Tooltip content element with id "${contentId}" not found`);
            return;
        }

        if (trigger === 'hover') {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(element, contentElement, position);
            });

            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip(element);
            });
            
            // Add focus/blur support for keyboard accessibility
            element.addEventListener('focus', (e) => {
                this.showTooltip(element, contentElement, position);
            });
            
            element.addEventListener('blur', (e) => {
                this.hideTooltip(element);
            });
        } else if (trigger === 'click') {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTooltip(element, contentElement, position);
            });
        }
    }

    showTooltip(triggerElement, contentElement, position) {
        // Ocultar otros tooltips de hover
        this.hideAllTooltips('hover');

        const tooltip = this.createTooltip(contentElement, position);
        
        // Add aria-describedby for screen readers
        const tooltipId = `tooltip-${Date.now()}`;
        tooltip.id = tooltipId;
        triggerElement.setAttribute('aria-describedby', tooltipId);
        
        document.body.appendChild(tooltip);

        this.positionTooltip(tooltip, triggerElement, position);

        // Mostrar tooltip con animación
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });

        this.activeTooltips.set(triggerElement, { element: tooltip, type: 'hover' });
    }

    toggleTooltip(triggerElement, contentElement, position) {
        if (this.activeTooltips.has(triggerElement)) {
            this.hideTooltip(triggerElement);
        } else {
            // Ocultar otros tooltips de click
            this.hideAllTooltips('click');
            this.showTooltip(triggerElement, contentElement, position);
            this.activeTooltips.get(triggerElement).type = 'click';
        }
    }

    createTooltip(contentElement, position) {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip ${position}`;
        tooltip.setAttribute('role', 'tooltip');

        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        tooltipContent.innerHTML = contentElement.innerHTML;

        const arrow = document.createElement('div');
        arrow.className = 'tooltip-arrow';

        tooltip.appendChild(tooltipContent);
        tooltip.appendChild(arrow);

        return tooltip;
    }

    positionTooltip(tooltip, triggerElement, position) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (position) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - 12;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = triggerRect.bottom + 12;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.left - tooltipRect.width - 12;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.right + 12;
                break;
        }

        // Ajustar para mantener dentro de la ventana
        const margin = 10;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
    }

    hideTooltip(triggerElement) {
        if (this.activeTooltips.has(triggerElement)) {
            const tooltipData = this.activeTooltips.get(triggerElement);
            tooltipData.element.classList.remove('show');
            
            // Remove aria-describedby
            triggerElement.removeAttribute('aria-describedby');

            setTimeout(() => {
                if (tooltipData.element.parentNode) {
                    tooltipData.element.remove();
                }
            }, 300);

            this.activeTooltips.delete(triggerElement);
        }
    }

    hideAllTooltips(type = null) {
        for (const [triggerElement, tooltipData] of this.activeTooltips) {
            if (!type || tooltipData.type === type) {
                this.hideTooltip(triggerElement);
            }
        }
    }
    
    destroy() {
        // Clean up all tooltips
        this.hideAllTooltips();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleEscape);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Inicializar el sistema de tooltips
document.addEventListener('DOMContentLoaded', () => {
    const tooltipSystem = new TooltipSystem();

    // Add tabindex to all tooltip trigger elements for keyboard accessibility
    document.querySelectorAll('[data-tooltip-content]').forEach(el => {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        
        // Add keyboard support (Enter/Space)
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });

    // Cerrar tooltips de click cuando se hace click fuera
    document.addEventListener('click', (e) => {
        const clickedTooltip = e.target.closest('.tooltip');
        if (!clickedTooltip) {
            tooltipSystem.hideAllTooltips('click');
        }
    });
});