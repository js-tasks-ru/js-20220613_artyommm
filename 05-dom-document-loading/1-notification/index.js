export default class NotificationMessage {
  static notificationMessageRef = null;

  constructor(text = '', {
    duration = 1,
    type = ''
  } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    this.render();
    if (NotificationMessage.notificationMessageRef) { //если уже есть уведомление, затираем ссылку на его
      NotificationMessage.notificationMessageRef.remove();
    }
    NotificationMessage.notificationMessageRef = this;
  }

  getTemplate() {

    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.text}
      </div>
    </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }

  remove() {
    this.element.remove();
    NotificationMessage.notificationMessageRef = null;
  }

  destroy() {
    this.remove();
  }

  show(containerForMessage) {
    document.body.append(this.element);

    if (containerForMessage) { // сначала долго не мог понять зачем это нужно
      containerForMessage.append(this.element); //помещение нашего message в какой-то элемент на странице?
    }

    setTimeout(() => this.remove(), this.duration);
  }

}
