export default class NotificationMessage {
  static notificationMessageRef = null;
  timerId = null; //храним идентификатор таймера

  constructor(text = '', {
    duration = 0,
    type = ''
  } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    if (NotificationMessage.notificationMessageRef) { //если уже есть уведомление, затираем ссылку на его
      NotificationMessage.notificationMessageRef.remove();
    }

    this.render();

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
    NotificationMessage.notificationMessageRef = null;
    clearTimeout(this.timerId);
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  show(containerForNotification) {
    document.body.append(this.element);

    if (containerForNotification) {
      containerForNotification.append(this.element);
    }

    this.timerId = setTimeout(() => this.remove(), this.duration);
  }
}
