export default class SortableTable {
  subElements = {}

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  getTableHeader() {
    const tableHeader = this.headerConfig.map(item => {
      return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable}>
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
      `;
    }).join('');

    return tableHeader;
  }

  getTableRow(item) {
    const tableRow = this.headerConfig.map(columnConfig => {
      return Object.keys(columnConfig).includes('template') ?
        `${columnConfig.template(item[columnConfig.id])}` :
        `<div class="sortable-table__cell">${item[columnConfig.id]}</div>`;
    }).join('');

    return tableRow;
  }

  getTableBody() {
    const tableBody = this.data.map(item => {
      const tableRow = this.getTableRow(item);
      return `<a href="" class="sortable-table__row">${tableRow}</a>`;
    }).join('');
    return tableBody;
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

  getTemplate() {
    const tableHeader = this.getTableHeader();
    const tableBody = this.getTableBody();

    return `
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">${tableHeader}</div>
      <div data-element="body" class="sortable-table__body">${tableBody}</div>
    </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
  }

  updateTableBody() {
    const tableBody = this.subElements.body;
    tableBody.innerHTML = this.getTableBody();
  }

  sort(fieldValue, orderValue) {
    const locales = 'ru-en';
    let direction = null;
    if (orderValue === 'asc') {
      direction = 1;
    } else if (orderValue === 'desc') {
      direction = -1;
    }

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    // NOTE: Remove sorting arrow from other columns
    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = orderValue;


    let sortType = null; //ищем sortType в хедере
    for (const header of this.headerConfig) {
      if (header.id === fieldValue) {
        sortType = header.sortType;
      }
    }

    switch (sortType) {
      case 'number':
        this.data = [...this.data].sort((a, b) => direction * (a[fieldValue] - b[fieldValue]));
        break;

      case 'string':
        this.data = [...this.data].sort((a, b) => {
          return direction * a[fieldValue].localeCompare(b[fieldValue], locales, {caseFirst: 'upper'});
        });
        break;

      default:
        return;
    }
    this.updateTableBody(); //перерендерим только тело таблицы
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

