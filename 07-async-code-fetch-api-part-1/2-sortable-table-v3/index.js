import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {}
  start = 0
  productsCountStep = 30
  loading = false

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  initEventListeners() {
    window.addEventListener('scroll', this.addProducts);
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  getTableHeader() {
    const tableHeader = this.headerConfig.map(item => {
      return `
       <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order="">
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

  getTableBody(data) {
    const tableBody = data.map(item => {
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
    const tableBody = this.getTableBody(this.data);

    return `
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">${tableHeader}</div>
      <div data-element="body" class="sortable-table__body">${tableBody}</div>
    </div>
    `;
  }

  onSortClick = event => {
    const header = event.target.closest('[data-sortable="true"]');
    const {id, sortable} = header.dataset;
    const sortFunc = (id, order) => this.isSortLocally ? this.sortOnClient(id, order) : this.sortOnServer(id, order);
    if (sortable === 'true'){
      if (this.sorted.id === id && this.sorted.order === 'asc') {
        sortFunc(id, 'desc');
        this.sorted.order = 'desc';
      } else if (this.sorted.id === id) {
        sortFunc(id, 'asc');
        this.sorted.order = 'asc';
      } else {
        this.sorted.id = id;
        this.sorted.order = 'desc';
        sortFunc(this.sorted.id, this.sorted.order);
      }
    }
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();


    //эту логику я вынес из функции update() и тест "should render loaded data correctly" прошёл
    const {id, order} = this.sorted;
    const data = await this.getProducts(id, order, this.start, this.start+this.productsCountStep);
    this.data = data;
    this.subElements.body.innerHTML = this.getTableBody(data);
    this.start += this.productsCountStep;
    //можно закомментировать кусок 121-125 и раскомментировать 128

    //this.update(); //-> тест валится, но работает всё аналогично

    this.initEventListeners();
  }

  async getProducts(id, order, start = this.start, end = this.start+this.productsCountStep) {
    const url = new URL('/api/rest/products', 'https://course-js.javascript.ru');
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);
    const data = await fetchJson(url);
    return data;
  }

  updateTableBody() {
    const tableBody = this.subElements.body;
    tableBody.innerHTML = this.getTableBody(this.data);
  }

  appendTableData(data) {
    const rows = document.createElement('div'); //div - wrapper вокруг rows

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableBody(data);

    this.subElements.body.append(...rows.childNodes); //отсюда берём тока rows без обёртки
    //сначала делал this.subElements.body.innerHTML+=this.getTableBody(data), но думаю через append получше
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
          return direction * a[fieldValue].localeCompare(b[fieldValue], locales);
        });
        break;

      default:
        this.data = [...this.data].sort((a, b) => direction * (a[fieldValue] - b[fieldValue]));
        break;
    }

    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    window.removeEventListener('scroll', this.addProducts);
    this.subElements.header.removeEventListener('pointerdown', this.sortOnClick);
  }

  update() {
    const {id, order} = this.sorted;
    this.getProducts(id, order, this.start, this.start + this.productsCountStep)
      .then((data) => {
        this.data = data;
        this.updateTableBody();
        this.start += this.productsCountStep;
      });
  }

  addProducts = () => {
    const {bottom} = this.element.getBoundingClientRect();
    const {id, order} = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading) {

      this.loading = true;

      this.getProducts(id, order, this.start, this.start + this.productsCountStep)
        .then((data) => {
          this.data = [...this.data, ...data];
          this.appendTableData(data);
          this.start += this.productsCountStep;
          this.loading = false;
        });
    }
  }

  sortOnClient(id, order) {
    this.sort(id, order);
    this.updateTableBody(); //перерендерим только тело таблицы
  }

  async sortOnServer(id, order) {
    const start = 0;
    const end = start + this.productsCountStep;
    const data = await this.getProducts(id, order, start, end);

    this.data = data;
    console.log(this.data);
    this.updateTableBody(); //перерендерим только тело таблицы
  }
}
