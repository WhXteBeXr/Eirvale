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

// TODO: Вынести названия классов
// TODO: Вынести создание тулбара в отдельный класс

/** Базовый класс для страниц с досочной структурой */
export abstract class BoardPage extends Page {
  protected readonly boardManager: IBoardManager; // Менеджер данных на досках

  private boardContainer: HTMLElement | null = null; // Корневой контейнер для монтирования досок
  private selectionContainer: HTMLElement | null = null; // Корневой контейнер выбора досок

  private readonly selectionItems: Map<Id, HTMLLIElement> = new Map<
    Id,
    HTMLLIElement
  >(); // Сохраненные элементы списка выбора досок
  protected boardOnPage: { id: Id; element: HTMLElement } | null = null; // Отрисованная доска на странице
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

  /** Создание дополнительной разметки требуемой конкретной странице */
  protected abstract decorateBoard(
    board: HTMLElement,
    boardData: QuestBoard,
  ): void;

  protected abstract decorateColumn(
    column: HTMLLIElement,
    columnData: QuestColumn,
  ): void;

  protected abstract decorateQuest(
    quest: HTMLLIElement,
    questData: QuestCard,
  ): void;

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
        this.renderSelection();
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

    const board = this.boardOnPage?.element;
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

    if (this.boardManager.isBoardLoaded()) return;
    const renderedBoard = this.boardOnPage?.element;

    if (renderedBoard) {
      this.boardOnPage = null;
      this.columnsOnBoard.clear();
      this.questsOnBoard.clear();

      const allBoards = this.boardManager.getAllLoadedBoards();
      if (allBoards.length === 0) {
        this.getBoardContainer().replaceChildren();
      }

      const nextBoard = allBoards[0];
      if (nextBoard) void this.boardManager.loadNewBoard(nextBoard.id);
    }
  }

  /** Обработка события создания колонки из менеджера */
  private handleColumnCreated(columnData: QuestColumn): void {
    const board = this.boardOnPage?.element;
    const columnsList = board?.querySelector(
      `.${this.QUEST_BOARD_CLASS_NAME}__board-columns`,
    );
    if (!columnsList) return;
    const column = this.createColumn(columnData, []);
    this.columnsOnBoard.set(columnData.id, column);
    columnsList.append(column);
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
    const questList = column?.querySelector(
      `.${this.QUEST_BOARD_CLASS_NAME}__quest-list`,
    );
    if (!questList) return;
    const quest = this.createQuest(questData);
    this.questsOnBoard.set(questData.id, quest);
    questList.appendChild(quest);
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
  protected getBoardContainer(): HTMLElement {
    if (!this.boardContainer) {
      this.boardContainer = document.createElement('section');
      this.boardContainer.classList.add(`${this.QUEST_BOARD_CLASS_NAME}`);
    }
    return this.boardContainer;
  }

  /** Получение/создание корневого контейнера выбора досок */
  protected getSelectionContainer(): HTMLElement {
    if (!this.selectionContainer) {
      this.selectionContainer = document.createElement('section');
      this.selectionContainer.classList.add(
        `${this.BOARDS_SELECTION_CLASS_NAME}`,
      );
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
    button.dataset.action = 'select-board';
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
      const button = target.closest<HTMLButtonElement>('[data-action]');

      if (!button) return;
      if (button.dataset.action === 'select-board') {
        this.handleBoardSelectClick(button);
      }
    });
  }

  private handleBoardSelectClick(button: HTMLButtonElement): void {
    const boardId = button.id;
    if (!boardId) return;
    const board = this.boardManager
      .getAllLoadedBoards()
      .find((board) => board.id === boardId);
    if (!board) return;

    void this.boardManager.loadNewBoard(board.id);
  }

  /** Создание и отрисовка загруженной доски */
  private renderBoard(): void {
    const loadedBoardData = this.boardManager.getLoadedBoard();
    const board = this.getBoardContainer();
    board.replaceChildren();

    const boardHeader = document.createElement('div');
    boardHeader.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__board-header`);

    const title = document.createElement('input');
    title.classList.add('input', `${this.QUEST_BOARD_CLASS_NAME}__board-title`);
    title.type = 'text';
    title.placeholder = 'Board name';
    title.value = loadedBoardData.board.title;
    boardHeader.appendChild(title);

    const description = document.createElement('textarea');
    description.classList.add(
      'textarea',
      `${this.QUEST_BOARD_CLASS_NAME}__board-description`,
    );
    description.placeholder = 'Your board description';

    if (loadedBoardData.board.description) {
      description.value = loadedBoardData.board.description;
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

    this.decorateBoard(board, loadedBoardData.board);

    this.boardOnPage = { id: loadedBoardData.board.id, element: board };
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

    const title = document.createElement('input');
    title.classList.add(
      'input',
      `${this.QUEST_BOARD_CLASS_NAME}__column-title`,
    );
    title.type = 'text';
    title.placeholder = 'Your column name';
    title.value = columnData.title;
    columnHeader.appendChild(title);

    if (columnData.description) {
      const description = document.createElement('textarea');
      description.classList.add(
        'textarea',
        `${this.QUEST_BOARD_CLASS_NAME}__column-description`,
      );
      description.placeholder = 'Your column description';
      description.value = columnData.description;
      columnHeader.appendChild(description);
    }

    const importance = document.createElement('input');
    importance.classList.add(
      'input',
      `${this.QUEST_BOARD_CLASS_NAME}__column-importance`,
    );
    importance.type = 'text';
    importance.placeholder = 'Column importance here';
    importance.value = columnData.importance;
    columnHeader.appendChild(importance);

    column.appendChild(columnHeader);

    const list = document.createElement('ul');
    list.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest-list`);
    questData.forEach((questData) => {
      const quest = this.createQuest(questData);
      list.appendChild(quest);
    });
    column.appendChild(list);

    this.decorateColumn(column, columnData);

    this.columnsOnBoard.set(columnData.id, column);
    return column;
  }

  /** Создание элемента квеста */
  private createQuest(questData: QuestCard): HTMLLIElement {
    const quest = document.createElement('li');
    quest.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest`);
    quest.id = questData.id;
    quest.dataset.columnId = questData.columnId;

    const title = document.createElement('input');
    title.classList.add('input', `${this.QUEST_BOARD_CLASS_NAME}__quest-title`);
    title.type = 'text';
    title.placeholder = 'Your quest title';
    title.value = questData.title;
    quest.append(title);

    if (questData.description) {
      const description = document.createElement('textarea');
      description.classList.add(
        'textarea',
        `${this.QUEST_BOARD_CLASS_NAME}__quest-description`,
      );
      description.placeholder = 'Your quest description here';
      description.value = questData.description;
      quest.appendChild(description);
    }

    if (questData.rewards.length > 0) {
      const rewards = document.createElement('ul');
      rewards.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__rewards-list`);
      questData.rewards.forEach((rewardData) => {
        const reward = document.createElement('li');
        reward.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__reward`);
        const rewardField = document.createElement('input');
        rewardField.classList.add(
          'input',
          `${this.QUEST_BOARD_CLASS_NAME}__reward-field`,
        );
        rewardField.type = 'text';
        rewardField.placeholder = 'Quest reward';
        rewardField.value = rewardData;
        reward.append(rewardField);
        rewards.appendChild(reward);
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
        dates.appendChild(date);
      });
      quest.appendChild(dates);
    }

    this.decorateQuest(quest, questData);

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
    const dateFormat = `${day}/${month}/${year}`;
    return kind === 'creation'
      ? `Was created on: ${dateFormat}`
      : `Expire on: ${dateFormat}`;
  }
}
