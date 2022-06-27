export default class ColumnChart {
  constructor(object = { data: [],
    label: '',
    value: 0,
    link: '',
    formatHeading: (data) => data}) { //не знаю что тут с функцией придумать даже
    this.data = object.data;
    this.label = object.label;
    this.value = object.value;
    this.link = object.link;
    this.formatHeading = object.formatHeading; //function
    this.chartHeight = 50;
    this.render();
  }

  fillData(data) { //функция для генерации html кода для колонок chart-а
    const maxValue = Math.max(...data);
    const maxColumnHeight = this.chartHeight;
    const scale = maxColumnHeight / maxValue;
    let columnsHtml = '';

    for (const value of data) {
      let chartValue = Math.floor(value * scale);
      let percentage = ((value / maxValue) * 100).toFixed(0);
      columnsHtml += `<div style="--value: ${chartValue}" data-tooltip="${percentage}%"></div>`;
    }

    return columnsHtml;
  }

  getTemplate() {
    const isEmptyCard = !this.data.length ? 'column-chart_loading' : '';
    const label = this.label;
    const link = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
    const value = this.formatHeading ? this.formatHeading(this.value) : this.value;

    let columnsHtml = this.data ? this.fillData(this.data) : '';

    return `
    <div class="column-chart ${isEmptyCard}" style="--chart-height: 50">
      <div class="column-chart__title">
        ${label}
        ${link}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${value}</div>
        <div data-element="body" class="column-chart__chart">
        ${columnsHtml}
        </div>
       </div>
     </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() { //пока нет зависимостей, поэтому просто вызываем remove
    this.remove();
  }

  update(data) {
    const chartContainer = this.element.querySelector('.column-chart__chart');
    const dashboardElement = chartContainer.parentNode.parentNode; //нужно проверить у dashboard класслист

    if (data.length) {
      if (dashboardElement.classList.contains('column-chart_loading')) {
        dashboardElement.classList.remove('column-chart_loading');
      }
      chartContainer.innerHTML = this.fillData(data);
    } else {
      dashboardElement.classList.add('column-chart_loading');
      chartContainer.innerHTML = '';
    }
  }
}
