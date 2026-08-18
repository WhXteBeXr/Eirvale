import { Page } from '@/app/pages/page.ts';
import type {
  ChangeEvent,
  IBoardManager,
} from '@/app/pages/services/managers/board-manager.types.ts';
import type {
  DateKind,
  QuestBoard,
  QuestCard,
  QuestColumn,
} from '@/app/pages/board-structure/types/board-pages.types.ts';
import type {
  ISODate,
  Id,
  ToolbarAction,
} from '@/shared/types/common.types.ts';

// TODO: Вынести создание тулбара в отдельный класс

/** Базовый класс для страниц с досочной структурой */
export abstract class BoardPage extends Page {
  protected readonly boardManager: IBoardManager; // Менеджер данных на досках

  private boardContainer: HTMLElement | null = null; // Корневой контейнер для монтирования досок
  private selectionContainer: HTMLElement | null = null; // Корневой контейнер выбора досок

  private readonly selectionItems: Map<Id, HTMLLIElement> = new Map<
    Id,
    HTMLLIElement
  >();
  private readonly boardsOnPage: Map<Id, HTMLElement> = new Map<
    Id,
    HTMLLIElement
  >();
  private readonly columnsOnBoard: Map<Id, HTMLLIElement> = new Map<
    Id,
    HTMLLIElement
  >(); // Сохраненные ссылки на элементы колонок на доске
  private readonly questsOnBoard: Map<Id, HTMLLIElement> = new Map<
    Id,
    HTMLLIElement
  >(); //Сохраненные ссылки на элементы квестов на доске

  // TODO: Вынести константы из класса
  private readonly DATE_KINDS: DateKind[] = ['creation', 'expiration'] as const; // Род поля даты квеста
  private readonly QUEST_BOARD_CLASS_NAME = 'quest-board' as const;
  private readonly BOARDS_SELECTION_CLASS_NAME = 'board-selection' as const;

  protected constructor(
    boardManager: IBoardManager,
    mountContainer: HTMLElement,
    toolbarActions: ToolbarAction[],
  ) {
    super(mountContainer, toolbarActions);
    this.boardManager = boardManager;
  }

  // TODO: Разобраться с return. Разделить ответственности загрузки и подписки
  /** Подписка на изменения. Загрузка первой доски*/
  protected async onMount(signal: AbortSignal): Promise<void> {
    const unsubscribe = this.boardManager.subscribe((event) => {
      this.handleChangeEvent(event);
    });
    signal.addEventListener('abort', unsubscribe);

    const loadedBoards = await this.boardManager.loadAllBoards();
    if (signal.aborted) return;

    const isLoaded = this.boardManager.isBoardLoaded();
    if (!isLoaded) {
      const first = loadedBoards[0];
      if (first && !signal.aborted) {
        await this.boardManager.loadNewBoard(first.id);
      }
    }
  }

  // TODO: Проверить смогут ли ивенты, требующие нескольких хэндлеров, их вызвать
  //  (например создание доски - обновление и создание элемента)

  /** Передача произошедшего ивента нужному обработчику */
  private handleChangeEvent(event: ChangeEvent): void {
    switch (event.type) {
      case 'boardListLoaded':
        this.handleBoardsLoaded();
        return;
      case 'newBoardLoaded':
        this.renderBoard();
        return;
      case 'boardCreated':
        this.handleBoardCreated(event.element);
        return;
      case 'boardUpdated':
        this.handleBoardUpdated(event.element);
        return;
      case 'boardDeleted':
        this.handleBoardDeleted(event.element);
        return;
      case 'columnCreated':
        this.handleColumnCreated(event.element);
        return;
      case 'columnUpdated':
        this.handleColumnUpdated(event.element);
        return;
      case 'columnDeleted':
        this.handleColumnDeleted(event.element);
        return;
      case 'questCreated':
        this.handleQuestCreated(event.element);
        return;
      case 'questUpdated':
        this.handleQuestUpdated(event.element);
        return;
      case 'questDeleted':
        this.handleQuestDeleted(event.element);
        return;
      default:
        throw new Error(`Unhandled event: ${event}`);
    }
  }

  private handleBoardsLoaded(): void {}

  /** Обработка события создания доски из менеджера */
  private handleBoardCreated(boardData: QuestBoard): void {
    const selectionContainer = this.getSelectionContainer();
    const list = selectionContainer.querySelector<HTMLElement>(
      `.${this.BOARDS_SELECTION_CLASS_NAME}__list`,
    );
    if (!list) return;
    const item = this.createSelectionItem(boardData);
    list.appendChild(item);
  }

  /** Обработка события обновления доски из менеджера */
  private handleBoardUpdated(boardData: QuestBoard): void {
    const selectionItem = this.selectionItems.get(boardData.id);
    const button = selectionItem?.querySelector(
      `.${this.BOARDS_SELECTION_CLASS_NAME}__selection-button`,
    );
    if (!button) return;
    button.textContent = boardData.title;

    if (!this.boardManager.isBoardLoaded()) return;

    const loadedBoardData = this.boardManager.getLoadedBoard();
    if (loadedBoardData.board.id !== boardData.id) return;

    const board = this.boardsOnPage.get(boardData.id);
    if (!board) return;

    const title = board.querySelector<HTMLHeadingElement>(
      `.${this.QUEST_BOARD_CLASS_NAME}__board-header`,
    );
    if (title) title.textContent = boardData.title;

    if (!boardData.description) return;
    const description = board.querySelector<HTMLParagraphElement>(
      `.${this.QUEST_BOARD_CLASS_NAME}__board-description`,
    );
    if (description) description.textContent = boardData.description;
  }

  /** Обработка события удаления доски из менеджера */
  private handleBoardDeleted(boardData: QuestBoard): void {
    this.selectionItems.get(boardData.id)?.remove();
    this.selectionItems.delete(boardData.id);

    if (!this.boardManager.isBoardLoaded()) return;

    const loadedBoardData = this.boardManager.getLoadedBoard();
    if (loadedBoardData.board.id !== boardData.id) return;

    this.boardsOnPage.get(boardData.id)?.remove();
    this.selectionItems.delete(boardData.id);
    this.columnsOnBoard.clear();
    this.questsOnBoard.clear();

    const next = this.boardManager.getAllLoadedBoards()[0];
    if (next) void this.boardManager.loadNewBoard(next.id);
  }

  /** Обработка события создания колонки из менеджера */
  private handleColumnCreated(columnData: QuestColumn): void {
    const board = this.boardsOnPage.get(columnData.boardId);
    if (!board) return;
    const column = this.createColumn(columnData, []);
    this.columnsOnBoard.set(columnData.id, column);
    board.append(column);
  }

  /** Обработка события обновления колонки из менеджера */
  private handleColumnUpdated(columnData: QuestColumn): void {
    const oldColumn = this.columnsOnBoard.get(columnData.id);
    if (!oldColumn) return;
    // Сбор квестов, которые были колонке до изменения
    const existingQuests = this.boardManager
      .getLoadedBoard()
      .quests.filter((quest) => quest.columnId === columnData.id); // Стоит попробовать найти более оптимальный вариант
    const newColumn = this.createColumn(columnData, existingQuests);
    this.columnsOnBoard.set(columnData.id, newColumn);
    oldColumn.replaceWith(newColumn);
  }

  /** Обработка события удаления колонки из менеджера */
  private handleColumnDeleted(columnData: QuestColumn): void {
    this.columnsOnBoard.get(columnData.id)?.remove();
    this.columnsOnBoard.delete(columnData.id);
  }

  /** Обработка события создания квеста из менеджера */
  private handleQuestCreated(questData: QuestCard): void {
    const column = this.columnsOnBoard.get(questData.columnId);
    if (!column) return;
    const quest = this.createQuest(questData);
    this.questsOnBoard.set(questData.id, quest);
    column.appendChild(quest);
  }

  /** Обработка события обновления квеста из менеджера */
  private handleQuestUpdated(questData: QuestCard): void {
    const oldQuest = this.questsOnBoard.get(questData.id);
    if (!oldQuest) return;
    const newQuest = this.createQuest(questData);
    oldQuest.replaceWith(newQuest);
    this.questsOnBoard.set(questData.id, newQuest);
  }

  /** Обработка события удаления квеста из менеджера */
  private handleQuestDeleted(questData: QuestCard): void {
    if (!this.questsOnBoard.has(questData.id)) return;
    this.questsOnBoard.get(questData.id)?.remove();
    this.questsOnBoard.delete(questData.id);
  }

  /** Получение/создание корневого контейнера доски */
  private getBoardContainer(): HTMLElement {
    if (!this.boardContainer) {
      this.boardContainer = document.createElement('section');
      this.boardContainer.classList.add(`${this.QUEST_BOARD_CLASS_NAME}`);
    }
    return this.boardContainer;
  }

  /** Получение/создание корневого контейнера выбора досок */
  private getSelectionContainer(): HTMLElement {
    if (!this.selectionContainer) {
      this.selectionContainer = document.createElement('section');
      this.selectionContainer.classList.add(`${this.QUEST_BOARD_CLASS_NAME}`);
      this.attachSelectionDelegate(this.selectionContainer);
    }
    return this.selectionContainer;
  }

  /** Создание и отрисовка выбора досок */
  private renderSelection(): void {
    const selectionContainer = this.getSelectionContainer();
    const loadedBoardsData = this.boardManager.getAllLoadedBoards();

    const title = document.createElement('h2');
    title.classList.add(`${this.BOARDS_SELECTION_CLASS_NAME}__title`);
    title.textContent = 'Boards selection';
    selectionContainer.appendChild(title);

    const selection = document.createElement('ul');
    selection.classList.add(`${this.BOARDS_SELECTION_CLASS_NAME}__list`);
    loadedBoardsData.forEach((boardData) => {
      const item = this.createSelectionItem(boardData);
      selection.appendChild(item);
    });
    selectionContainer.appendChild(selection);
  }

  /** Создание элемента списка выбора досок */
  private createSelectionItem(boardData: QuestBoard): HTMLLIElement {
    const listItem = document.createElement('li');
    listItem.classList.add(
      `${this.BOARDS_SELECTION_CLASS_NAME}__selection-item`,
    );
    const button = document.createElement('button');
    button.classList.add(
      `${this.BOARDS_SELECTION_CLASS_NAME}__selection-button`,
    );
    button.id = boardData.id;
    button.textContent = boardData.title;
    listItem.appendChild(button);
    this.selectionItems.set(boardData.id, listItem);
    return listItem;
  }

  /** Добавление делегирующего слушателя на контейнер с выбором досок */
  private attachSelectionDelegate(container: HTMLElement): void {
    this.addListener(container, 'click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest<HTMLButtonElement>(
        `.${this.QUEST_BOARD_CLASS_NAME}__selection-button`,
      );
      const boardId = button?.dataset.id;
      if (!boardId) return;
      const board = this.boardManager
        .getAllLoadedBoards()
        .find((board) => board.id === boardId);
      if (!board) return;

      void this.boardManager.loadNewBoard(board.id);
    });
  }

  /** Создание и отрисовка загруженной доски */
  private renderBoard(): void {
    const loadedBoardData = this.boardManager.getLoadedBoard();
    const board = this.getBoardContainer();

    const boardHeader = document.createElement('div');
    boardHeader.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__board-header`);

    const title = document.createElement('h2');
    title.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__board-title`);
    title.textContent = loadedBoardData.board.title;
    boardHeader.appendChild(title);

    const description = document.createElement('p');
    description.classList.add(
      `${this.QUEST_BOARD_CLASS_NAME}__board-description`,
    );
    if (loadedBoardData.board.description) {
      description.textContent = loadedBoardData.board.description;
    }
    boardHeader.appendChild(description);

    board.appendChild(boardHeader);

    const columns = document.createElement('ul');
    columns.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__board-columns`);
    const groupedQuests = this.groupQuestsByColumn(loadedBoardData.quests);
    loadedBoardData.columns.forEach((columnData) => {
      const column = this.createColumn(
        columnData,
        groupedQuests.get(columnData.id) ?? [],
      );
      columns.appendChild(column);
    });
    board.appendChild(columns);

    this.boardsOnPage.set(loadedBoardData.board.id, board);
  }

  /** Создание элемента колонки и всех квестов в ней */
  private createColumn(
    columnData: QuestColumn,
    questData: QuestCard[],
  ): HTMLLIElement {
    const column = document.createElement('li');
    column.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__column`);
    column.id = columnData.id;
    column.dataset.boardId = columnData.boardId;

    const columnHeader = document.createElement('div');
    columnHeader.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__column-header`);

    const title = document.createElement('h3');
    title.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__column-title`);
    title.textContent = columnData.title;
    columnHeader.appendChild(title);

    if (columnData.description) {
      const description = document.createElement('p');
      description.classList.add(
        `${this.QUEST_BOARD_CLASS_NAME}__column-description`,
      );
      if (columnData.description) {
        description.textContent = columnData.description;
      }
      columnHeader.appendChild(description);
    }

    const importance = document.createElement('p');
    importance.classList.add(
      `${this.QUEST_BOARD_CLASS_NAME}__column-importance`,
    );
    importance.textContent = columnData.importance;
    columnHeader.appendChild(importance);

    column.appendChild(columnHeader);

    const list = document.createElement('ul');
    list.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest-list`);
    questData.forEach((questData) => {
      const quest = this.createQuest(questData);
      list.appendChild(quest);
    });
    column.appendChild(list);

    this.columnsOnBoard.set(columnData.id, column);
    return column;
  }

  /** Создание элемента квеста */
  private createQuest(questData: QuestCard): HTMLLIElement {
    const quest = document.createElement('li');
    quest.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest`);
    quest.id = questData.id;
    quest.dataset.columnId = questData.columnId;

    const title = document.createElement('h4');
    title.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest-title`);
    title.textContent = questData.title;
    quest.append(title);

    if (questData.description) {
      const description = document.createElement('p');
      description.classList.add(
        `${this.QUEST_BOARD_CLASS_NAME}__quest-description`,
      );
      description.textContent = questData.description;
      quest.appendChild(description);
    }

    if (questData.rewards.length > 0) {
      const rewards = document.createElement('ul');
      rewards.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__rewards-list`);
      questData.rewards.forEach((reward) => {
        const node = document.createElement('li');
        node.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__reward`);
        node.textContent = reward;
        rewards.appendChild(node);
      });
      quest.appendChild(rewards);
    }

    if (questData.creation || questData.expiration) {
      const dates = document.createElement('ul');
      dates.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest-dates-list`);
      this.DATE_KINDS.forEach((kind) => {
        const ISODate = questData[kind];
        if (!ISODate) return;
        const date = document.createElement(`li`);
        date.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest-date`);
        date.textContent = this.formatDate(kind, ISODate);
        date.appendChild(date);
      });
      quest.appendChild(dates);
    }

    this.questsOnBoard.set(questData.id, quest);
    return quest;
  }

  /** Сортировка квестов по колонкам к которым они привязаны. Ключ - id колонки */
  private groupQuestsByColumn(questsData: QuestCard[]): Map<Id, QuestCard[]> {
    const grouped = new Map<Id, QuestCard[]>();
    questsData.forEach((quest) => {
      const existing = grouped.get(quest.columnId) ?? [];
      existing.push(quest);
      grouped.set(quest.columnId, existing);
    });
    return grouped;
  }

  /** Форматирование ISO даты. На данный момент обрабатывается лишь дата */
  private formatDate(kind: DateKind, ISODate: ISODate): string {
    // const [date, time] = ISODate.split('T');
    const [year, month, day] = ISODate.split('-');
    const dateFormat = `${day}/${month}/${year};`;
    return kind === 'creation'
      ? `Was created on: ${dateFormat}`
      : `Expire on: ${dateFormat}`;
  }
}
