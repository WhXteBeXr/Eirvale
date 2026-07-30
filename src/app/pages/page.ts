export abstract class Page {
  // Слушатели на всех элементах страницы
  private handlers: Array<{
    element: Element;
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  // Корневой родительский контейнер
  private readonly mountContainer: HTMLElement;

  // Монтируемый элемент страницы
  private rootElement: HTMLElement | null = null;

  protected constructor(mountContainer: HTMLElement) {
    this.mountContainer = mountContainer;
  }

  // Монтирование страницы
  public mount(): void {
    this.rootElement = this.createPageLayout();
    this.mountContainer.appendChild(this.rootElement);
  }

  // Размонтирование страницы
  public unmount(): void {
    if (!this.rootElement) {
      return;
    }

    this.removeListeners();
    this.mountContainer.removeChild(this.rootElement);
    this.rootElement = null;
  }

  // Метод для добавления новых обработчиков на элементы
  protected addListener(
    element: Element,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    element.addEventListener(type, listener, options);
    this.handlers.push({ element, type, listener, options });
    // TODO: Можно реализовать частичное удаление обработчиков
  }

  // Снятие всех обработчиков
  private removeListeners(): void {
    this.handlers.forEach(({ element, type, listener, options }) => {
      element.removeEventListener(type, listener, options);
    });
    this.handlers = [];
  }

  // Метод создающий всю разметку выбранной страницы
  abstract createPageLayout(): HTMLElement;
}
