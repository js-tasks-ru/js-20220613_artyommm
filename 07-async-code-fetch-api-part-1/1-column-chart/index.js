import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;

  constructor({
                url = '',
                range = {},
                data = [],
                label = '',
                value = data.reduce((sum, current) => sum + current, 0),
                link = '',
                formatHeading = (data) => data
              } = {}) {
    this.url = url;
    this.range = range;
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.update(range.from, range.to)
  }

  getChartBody(data) { //функция для генерации html кода для колонок chart-а
    const maxValue = Math.max(...data);
    const maxColumnHeight = this.chartHeight;
    const scale = maxColumnHeight / maxValue;

    const columnsHtml = data.map(value => {
      const chartValue = Math.floor(value * scale);
      const percentage = ((value / maxValue) * 100).toFixed(0);
      return `<div style="--value: ${chartValue}" data-tooltip="${percentage}%"></div>`;
    }).join('');

    return columnsHtml;
  }

  getTemplate() {
    const label = this.label;
    const link = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
    const value = this.value;

    const columnsHtml = this.data.length ? this.getChartBody(this.data) : '';

    return `
    <div class="column-chart column-chart_loading" style="--chart-height: 50">
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
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() { //пока нет зависимостей, поэтому просто вызываем remove
    this.remove();
  }

  changeData() {
    const headerContainer = this.subElements.header; //меняем значение в header-е columnChart-а
    headerContainer.innerHTML = this.formatHeading(this.value);

    const chartContainer = this.subElements.body;
    chartContainer.innerHTML = this.getChartBody(this.data);

    const dashboardElement = chartContainer.parentNode.parentNode; //нужно проверить у dashboard класслист

    if (this.data.length) {
      if (dashboardElement.classList.contains('column-chart_loading')) {
        dashboardElement.classList.remove('column-chart_loading');
      }
      this.subElements.body.innerHTML = this.getChartBody(this.data);
    } else {
      dashboardElement.classList.add('column-chart_loading');
      this.subElements.body.innerHTML = '';
    }
  }

  update(startDate, endDate) {
    const params = {'from': startDate, 'to': endDate};
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', params.from);
    url.searchParams.set('to', params.to);

    return fetchJson(url, params)
      .then(json => {
        this.data = Object.values(json);
        this.value = this.data.reduce((sum, current) => sum + current, 0);
        this.changeData();
        return json;
      });
  }
}
