import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};

  defaultFormData = { //взял из тестов
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  onSubmit = event => {
    event.preventDefault(); //предотвращаем перезагрузку
    this.save();
  }

  constructor(productId) {
    this.productId = productId;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async getCategories() {
    const categoriesURL = new URL(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
    const categories = await fetchJson(categoriesURL);

    const categoriesOptions = categories.map(cat => {
      return cat.subcategories.map(subcat => {
        return `<option value=\"${subcat.id}\">${cat.title} &gt; ${subcat.title}</option>`;
      }).join('');
    }).join('');

    return categoriesOptions;
  }

  async getProduct() {
    const productURL = new URL(`${BACKEND_URL}/api/rest/products`);
    productURL.searchParams.set('id', this.productId);
    const [productInfo] = await fetchJson(productURL);
    return productInfo;
  }

  getTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">${this.getProductImagesList()}</div>
        <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        ${this.getCategoriesSelect()}
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" required="" type="number" name="price" class="form-control" placeholder="${this.defaultFormData.price}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${this.defaultFormData.quantity}">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`;
  }

  async render() {
    // this.categoriesOptions = await this.getCategories(); //получаем категории
    // this.productInfo = await this.getProduct(); //получаем данные продукта

    [this.categoriesOptions, this.productInfo] = await Promise.all([this.getCategories(), this.getProduct()]);

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(wrapper);

    if (this.productId) {this.fillFormValues();} //если это запрос на редактирование, заполняем форму
    this.initEventListeners();

    return this.element;
  }

  fillFormValues() {
    this.element.querySelector('[name="title"]').value = this.productInfo.title;

    this.element.querySelector('[name="description"]').value = this.productInfo.description;

    this.element.querySelector('[name="price"]').value = this.productInfo.price;

    this.element.querySelector('[name="discount"]').value = this.productInfo.discount;

    this.element.querySelector('[name="quantity"]').value = this.productInfo.quantity;

    this.element.querySelector('select[name="status"]').value = this.productInfo.status;
  }

  getProductImagesList() {
    const wrapper = document.createElement('div');

    const images = this.productInfo.images.map(image => {
      return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
        <span>${image.source}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
    }).join('');

    wrapper.innerHTML = `<ul class="sortable-list">${images}</ul>`;

    const imagesList = wrapper.firstElementChild;

    return imagesList.outerHTML;
  }

  getCategoriesSelect() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" name="subcategory" id="subcategory">${this.categoriesOptions}</select>`;

    const catSelect = wrapper.firstElementChild;

    return catSelect.outerHTML;
  }

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    });

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  initEventListeners() {
    console.log(this.subElements)
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit)
    uploadImage.addEventListener('click', this.uploadImage);
  }

  removeEventListeners() {
    this.element.removeEventListener('submit', this.onSubmit)
  }

  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  async save() {
    //TODO:POST запрос

    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('something went wrong', error);
    }
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id }) // new CustomEvent('click')
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }

}
