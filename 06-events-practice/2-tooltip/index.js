class Tooltip {
  static tooltipInstance; //undefined по умолчанию
  tooltipText = '';

  constructor() {
    if (Tooltip.tooltipInstance) {
      return Tooltip.tooltipInstance;
    }
    Tooltip.tooltipInstance = this;
  }


  initialize() {
    Tooltip.tooltipInstance = this;
    document.addEventListener('pointerover', event => {
      if (event.target.dataset.tooltip !== undefined) {
        this.tooltipText = event.target.dataset.tooltip;
        this.render();
      }
    });

    document.addEventListener('pointerout', event => {
      if (event.target.dataset.tooltip !== undefined) {
        this.tooltipText = '';
        this.remove();
      }
    });

    document.addEventListener('pointermove', event => {
      if (event.target.dataset.tooltip !== undefined) {
        const tooltip = document.querySelector('.tooltip');
        tooltip.style.top = event.clientY + 10 + 'px';
        tooltip.style.left = event.clientX + 10 + 'px';
      }
    });

  }

  getTemplate() {
    return `<div class="tooltip">${this.tooltipText}</div>`;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    Tooltip.tooltipInstance = null;
  }
}

export default Tooltip;
