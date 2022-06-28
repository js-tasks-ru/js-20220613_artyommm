export default class SortableTable {
  subElements = {}

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.headerDict = headerConfig.map(item => item.id); //get headers
    //console.log(this.headerDict);
    this.render();
  }

  getTableHeader() {
    const tableHeader = this.headerConfig.map(item => {
      return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order="asc">
        <span>${item.title}</span>
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

  getTable() {
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

    wrapper.innerHTML = this.getTable();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
  }

  updateTableBody() {
    const tableBody = this.subElements.body;
    tableBody.innerHTML = this.getTableBody();
  }

  sort(fieldValue, orderValue) {
    const locales = 'ru-en';
    const direction = orderValue === 'asc' ? 1 : -1;

    let sortType = null;
    for (const header of this.headerConfig) {
      if (header.id === fieldValue) {
        if(!header.sortable) return;
        sortType = header.sortType;
      }
    }

    if(!sortType) return;

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
    this.updateTableBody();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }


}

