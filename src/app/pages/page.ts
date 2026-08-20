import type { ToolbarAction } from '@/shared/types/common.types.ts';

/** Базовый класс для всех возможных страниц */
export abstract class Page {
  private readonly toolbarActions: ToolbarAction[]; // Доступные действия из тулбара
  private readonly pageMountContainer: HTMLElement; // Корневой родительский контейнер
  private readonly abortController: AbortController;
  private page: HTMLElement[] | null = null; // Монтируемая страница
  private toolbar: HTMLElement | null = null; // Элемент тулбара страницы
  private readonly TOOLBAR_CLASS_NAME: string = 'toolbar-container'; // Класс тулбар контейнера

  protected constructor(
    mountContainer: HTMLElement,
    toolbarActions: ToolbarAction[],
  ) {
    this.abortController = new AbortController();
    this.pageMountContainer = mountContainer;
    this.toolbarActions = toolbarActions;
  }

  /** Инициализация, исполнение необходимого при монтировании страницы */
  protected abstract onMount(signal: AbortSignal): Promise<void>;

  /** Метод создающий всю разметку страницы */
  protected abstract createPageLayout(): HTMLElement[];

  /** Обработчик кликов по кнопкам. Обработка события по id из датасета кнопки */
  protected abstract handleToolbarAction(
    button: HTMLButtonElement,
    actionInfo: ToolbarAction,
  ): void;

  /** Монтирование страницы */
  public mount(): void {
    if (this.page) {
      throw new Error('Page is already mounted');
    }
    this.page = this.createPageLayout();
    this.toolbar = this.createToolbar();
    this.pageMountContainer.append(...this.page, this.toolbar);
    void this.onMount(this.abortController.signal);
  }

  /** Размонтирование страницы */
  public unmount(): void {
    if (!this.page) {
      throw new Error('Page is not mounted');
    }
    this.abortController?.abort();
    this.clearMountContainer();
  }

  /** Метод для добавления нового обработчика на элемент */
  protected addListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void {
    if (!this.abortController) {
      throw new Error('Cannot add listener before page is mounted');
    }

    element.addEventListener(type, listener, {
      once: options?.once,
      passive: options?.passive,
      capture: options?.capture,
      signal: this.abortController.signal,
    });
  }

  /** Очистка всего родительского контейнера */
  private clearMountContainer(): void {
    this.pageMountContainer.replaceChildren();
    this.page = null;
    this.toolbar = null;
  }

  /** Создание контейнера тулбара для страницы */
  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('ul');
    toolbar.classList.add(this.TOOLBAR_CLASS_NAME);
    this.addActionsToToolbar(toolbar, this.toolbarActions);
    return toolbar;
  }

  /** Метод наполняющий панель действий */
  private addActionsToToolbar(
    toolbar: HTMLElement,
    toolbarActions: ToolbarAction[],
  ): void {
    toolbarActions.forEach((actionInfo) => {
      const button = this.createToolbarButton(actionInfo);
      toolbar.appendChild(button);
    });
    this.attachToolbarDelegate(toolbar);
  }

  /** Создание кнопки тулбара */
  private createToolbarButton(actionInfo: ToolbarAction): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add(`${this.TOOLBAR_CLASS_NAME}__action-button`);
    button.textContent = actionInfo.name;
    button.dataset.actionId = String(actionInfo.id);
    button.dataset.action = actionInfo.name;
    return button;
  }

  /** Вешаем слушатель на родительский тулбар */
  private attachToolbarDelegate(toolbar: HTMLElement): void {
    this.addListener(toolbar, 'click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const button = target.closest<HTMLButtonElement>(
        `.${this.TOOLBAR_CLASS_NAME}__action-button`,
      );
      if (!button) return;

      const actionId: string | undefined = button.dataset.actionId;
      const name: string | undefined = button.dataset.action;
      if (!name || !actionId) return;

      this.handleToolbarAction(button, { id: actionId, name: name });
    });
  }
}
