import type { ToolbarAction } from '@/app/pages/quest-boards.config.ts';

export abstract class Page {
  private handlers: Array<{
    element: Element;
    type: string;
    listener: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = []; // Слушатели на всех элементах страницы
  private readonly mountContainer: HTMLElement; // Корневой родительский контейнер
  private readonly toolbarContainer: HTMLElement; // Контейнер toolbar
  private toolbarActions: Array<ToolbarAction> = []; // Доступные действия тулбара на странице
  private rootElement: HTMLElement | null = null; // Монтируемый элемент страницы

  protected constructor(
    mountContainer: HTMLElement,
    toolbarContainer: HTMLElement,
    toolbarActions: Array<ToolbarAction>,
  ) {
    this.mountContainer = mountContainer;
    this.toolbarContainer = toolbarContainer;
    this.toolbarActions = toolbarActions;
  }

  // Метод создающий всю разметку выбранной страницы
  protected abstract createPageLayout(): HTMLElement;

  // Обработчик кликов по кнопкам. Обрабатываются события по id из датасета кнопки
  protected abstract handleToolbarAction(button: HTMLButtonElement): void;

  // Монтирование страницы
  public mount(): void {
    this.rootElement = this.createPageLayout();
    this.mountContainer.appendChild(this.rootElement);
    this.displayActions();
    this.attachToolbarDelegation();
  }

  // Размонтирование страницы
  public unmount(): void {
    if (!this.rootElement) {
      return;
    }

    this.removeListeners();
    this.clearToolbar();
    this.mountContainer.removeChild(this.rootElement);
    this.rootElement = null;
  }

  // Метод для добавления нового обработчика на элемент
  protected addListener<K extends keyof HTMLElementEventMap>(
    element: Element,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    element.addEventListener(type, listener as EventListener, options);
    this.handlers.push({
      element,
      type,
      listener: listener as EventListener, // Стоит пересмотреть хранение
      options,
    });
  }

  // Снятие всех обработчиков
  private removeListeners(): void {
    this.handlers.forEach(({ element, type, listener, options }) => {
      element.removeEventListener(type, listener, options);
    });

    this.handlers = [];
  }

  // Создание кнопок тулбара
  private createButton(action: ToolbarAction): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('content-container__action-button');
    button.dataset.actionId = String(action.id);
    button.dataset.actionName = action.name;
    return button;
  }

  // Метод наполняющий экшен панель
  private displayActions(): void {
    this.toolbarActions.forEach((action) => {
      const button = this.createButton(action);
      this.toolbarContainer.appendChild(button);
    });
  }

  // Вешаем слушатель на родительский тулбар, сохраняем слушатель для последующего удаления
  private attachToolbarDelegation(): void {
    this.addListener(this.toolbarContainer, 'click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest<HTMLButtonElement>(
        '.content-container__action-button',
      );
      if (!button) {
        return;
      }

      this.handleToolbarAction(button);
    });
  }

  private clearToolbar(): void {
    this.toolbarContainer.innerHTML = '';
  }
}
