
class TooltipSystem {
    constructor() {
        this.activeTooltips = new Map();
        this.init();
    }

    init() {
        // Buscar todos los elementos con tooltip
        const tooltipElements = document.querySelectorAll('[data-tooltip-content]');
        tooltipElements.forEach(el => this.setupTooltip(el));
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

            setTimeout(() => {
                if (tooltipData.element.parentNode) {
                    tooltipData.element.parentNode.removeChild(tooltipData.element);
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

    // Ocultar tooltips al hacer scroll
    window.addEventListener('scroll', () => {
        tooltipSystem.hideAllTooltips();
    });

    // Reposicionar tooltips al cambiar el tamaño de ventana
    window.addEventListener('resize', () => {
        tooltipSystem.hideAllTooltips();
    });
});