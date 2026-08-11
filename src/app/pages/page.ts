import type { ToolbarAction } from '@/app/pages/quest boards/quest-boards.types.ts';

// Базовый класс для всех возможных страниц
export abstract class Page {
  private readonly TOOLBAR_CLASS_NAME: string = 'toolbar-container'; // Класс тулбар контейнера
  private handlers: Array<{
    element: Element;
    type: string;
    listener: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = []; // Слушатели всех элементов страницы
  private page: HTMLElement[] | null = null; // Монтируемая страница
  private toolbar: HTMLElement | null = null; // Элемент тулбара страницы
  private readonly toolbarActions: ToolbarAction[]; // Доступные действия из тулбара
  private readonly pageMountContainer: HTMLElement; // Корневой родительский контейнер

  protected constructor(
    mountContainer: HTMLElement,
    toolbarActions: ToolbarAction[],
  ) {
    this.pageMountContainer = mountContainer;
    this.toolbarActions = toolbarActions;
  }

  // Метод создающий всю разметку страницы
  protected abstract createPageLayout(): HTMLElement[];

  // Обработчик кликов по кнопкам. Обработка события по id из датасета кнопки
  protected abstract handleToolbarAction(button: HTMLButtonElement): void;

  // Монтирование страницы
  public mount(): void {
    if (this.page || this.toolbar) {
      throw new Error('Page is already mounted');
    }

    this.page = this.createPageLayout();
    this.toolbar = this.createToolbar();
    this.pageMountContainer.append(...this.page, this.toolbar);
  }

  // Размонтирование страницы
  public unmount(): void {
    this.removeAllListeners();
    this.clearMountContainer();
  }

  // TODO: Переделать систему на aborController
  // Метод для добавления нового обработчика на элемент
  protected addListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    element.addEventListener(type, listener as EventListener, options);
    this.handlers.push({
      element,
      type,
      listener: listener as EventListener, // TODO: Стоит пересмотреть хранение
      options,
    });
  }

  // Снятие всех обработчиков
  private removeAllListeners(): void {
    this.handlers.forEach(({ element, type, listener, options }) => {
      element.removeEventListener(type, listener, options);
    });

    this.handlers = [];
  }

  // Очистка всего родительского контейнера
  private clearMountContainer(): void {
    this.pageMountContainer.replaceChildren();
    this.page = null;
    this.toolbar = null;
  }

  // Создание контейнера тулбара для страницы
  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('ul');
    toolbar.classList.add(this.TOOLBAR_CLASS_NAME);
    this.addActionsToToolbar(toolbar, this.toolbarActions);
    return toolbar;
  }

  // Метод наполняющий панель действий
  private addActionsToToolbar(
    toolbar: HTMLElement,
    toolbarActions: ToolbarAction[],
  ): void {
    toolbarActions.forEach((action) => {
      const button = this.createButton(action);
      toolbar.appendChild(button);
    });
    this.attachToolbarDelegation(toolbar);
  }

  // Создание кнопки тулбара
  private createButton(action: ToolbarAction): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add(`${this.TOOLBAR_CLASS_NAME}__action-button`);
    button.dataset.actionId = String(action.id);
    button.dataset.action = action.action;
    return button;
  }

  // Вешаем слушатель на родительский тулбар
  private attachToolbarDelegation(toolbar: HTMLElement): void {
    // Сохраняем слушатель для последующего удаления
    this.addListener(toolbar, 'click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest<HTMLButtonElement>(
        '.toolbar-container__action-button',
      );
      if (!button) {
        return;
      }

      this.handleToolbarAction(button);
    });
  }
}
