import { Page } from '@/app/pages/page.ts';
import { BoardManager } from '@/app/pages/board-structure/board-manager.ts';
import type {
  DateKind,
  QBoardNode,
  QuestBoard,
  QuestCard,
  QuestColumn,
} from '@/types/board-pages/board-pages.types.ts';
import type { ISODate, DescriptionNode, TitleNode, Id, ToolbarAction} from '@/types/board-pages/common.types.ts';

// Базовый класс для страниц со структурой досок
export abstract class BoardPage extends Page {
  private readonly DATE_KINDS: DateKind[] = ['creation', 'expiration'] as const; // Род поля даты квеста
  private readonly QUEST_BOARD_CLASS_NAME: string = 'quest-board';
  private readonly BOARDS_SELECTION_CLASS_NAME: string = 'board-selection';
  private boardContainer: HTMLElement | null = null; // Контейнер для досок
  private boardsSelectionContainer: HTMLElement | null = null;
  private currentBoard: QuestBoard | null = null; // Доска выбранная в текущий момент
  private readonly boardManager: BoardManager;

  protected constructor(
    boardManager: BoardManager,
    mountContainer: HTMLElement,
    toolbarActions: ToolbarAction[],
  ) {
    super(mountContainer, toolbarActions);
    this.boardManager = BoardManager;
  }

  // Дополнительная логика выбора первой доски при монтировании
  public override mount() {
    this.selectBoardOnPageLoad();
    super.mount();
  }

  // Добавление делегата на родительский элемент для элемента выбора досок
  private attachSelectionDeligation(selectionContainer: HTMLElement): void {
    this.addListener(selectionContainer, 'click', (event): void => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest<HTMLButtonElement>(
        `.${this.BOARDS_SELECTION_CLASS_NAME}__list-item-button`,
      );
      if (!button) {
        return;
      }

      this.handleSelectionAction(button);
    });
  }

  // Обработчик клика по кнопке выбора доски
  private handleSelectionAction(button: HTMLButtonElement): void {
    const boardId = Number(button.dataset.boardId);
    if (!(typeof boardId === 'number')) {
      return;
    }

    this.switchCurrentBoard(boardId);
  }

  // Метод замены текущей доски
  private switchCurrentBoard(boardId: Id): void {
    this.currentBoard = this.getBoardById(boardId);

    this.getBoardContainer().replaceChildren(...this.createBoard());
  }

  // При монтировании страницы (первой загрузки) производится выбор первой доски для отображения
  protected selectBoardOnPageLoad(): void {
    if (this.currentBoard) {
      throw new Error('Board already selected');
    }

    const firstBoard = this.boardsList[0];
    if (!firstBoard) {
      throw new Error('First board not found');
    }

    this.currentBoard = firstBoard;
  }

  // Получение контейнера (точки) монтирования досок
  protected getBoardContainer(): HTMLElement {
    if (!this.boardContainer) {
      this.boardContainer = document.createElement('section');
      this.boardContainer.classList.add(`${this.QUEST_BOARD_CLASS_NAME}`);
    }

    return this.boardContainer;
  }

  // Получение контейнера (точки) монтирования выбора досок
  protected getSelectionContainer(): HTMLElement {
    if (!this.boardsSelectionContainer) {
      this.boardsSelectionContainer = document.createElement('section');
      this.boardsSelectionContainer.classList.add(
        `${this.BOARDS_SELECTION_CLASS_NAME}`,
      );

      // Вешаем слушатель на родительский контейнер для элементов в нем
      this.attachSelectionDeligation(this.boardsSelectionContainer);
    }

    return this.boardsSelectionContainer;
  }

  // Получение выбранной в данный момент доски
  private getCurrentBoard(): QuestBoard {
    if (!this.currentBoard) {
      throw new Error('No current board! Select it first');
    }

    return this.currentBoard;
  }

  // Создание списка с выбором всех доступных досок
  protected createBoardsSelection(): HTMLUListElement {
    const boardsList = document.createElement('ul');
    boardsList.classList.add(
      `${this.BOARDS_SELECTION_CLASS_NAME}__boards-list`,
    );
    this.boardsList.forEach((board) => {
      const listItem = this.createSelectionItem(board);
      boardsList.appendChild(listItem);
    });

    return boardsList;
  }

  // Создание элемента доски для их списка
  private createSelectionItem(board: QuestBoard): HTMLLIElement {
    const listItem = document.createElement('li');
    listItem.classList.add(`${this.BOARDS_SELECTION_CLASS_NAME}__list-item`);
    const buttonItem = document.createElement('button');
    buttonItem.classList.add(
      `${this.BOARDS_SELECTION_CLASS_NAME}__list-item-button`,
    );
    buttonItem.dataset.boardId = board.id.toString();
    buttonItem.textContent = board.title;
    listItem.appendChild(buttonItem);
    return listItem;
  }

  // Создание базовой структуры для каждого элемента квест доски
  private createBaseNode(
    nodeName: keyof HTMLElementTagNameMap,
    dataset: QBoardNode,
    titleTag: TitleNode,
    descriptionTag: DescriptionNode = 'p',
  ): HTMLElement {
    const element = document.createElement(nodeName);

    if (dataset.title) {
      const title = document.createElement(titleTag);
      title.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__title`);
      title.textContent = dataset.title;
      element.appendChild(title);
    }

    if (dataset.description) {
      const description = document.createElement(descriptionTag);
      description.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__description`);
      description.textContent = dataset.description;
      element.appendChild(description);
    }

    return element;
  }

  // Создание разметки выбранной в данный момент доски квестов
  protected createBoard(): HTMLElement[] {
    const currentBoard = this.getCurrentBoard();
    // const board = this.createBaseNode('div', currentBoard, 'h2');
    // board.classList.add('quest-board');

    const title = document.createElement('h2');
    title.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__title`);
    title.textContent = currentBoard.title;

    const totalColumns = document.createElement('p');
    totalColumns.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__total-columns`);
    totalColumns.textContent = `Колонок на доске: ${currentBoard.columns.length.toString()}`;
    // board.appendChild(totalColumns);

    const groupedQuests = this.groupQuestsByColumn(currentBoard.quests);
    const columnNodes: HTMLElement[] = currentBoard.columns.map((column) => {
      return this.createColumn(column, groupedQuests.get(column.id) ?? []);
    });
    // board.append(...columnNodes);

    return [title, totalColumns, ...columnNodes];
  }

  // Создание контейнера колонки для квестов
  private createColumn(dataset: QuestColumn, quests: QuestCard[]): HTMLElement {
    const column = this.createBaseNode('div', dataset, 'h3');
    column.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__column`);

    const importance = document.createElement('span');
    importance.classList.add(
      `${this.QUEST_BOARD_CLASS_NAME}__column-importance`,
    );
    importance.textContent = dataset.importance;
    column.appendChild(importance);

    if (quests.length > 0) {
      const questCardContainer = document.createElement('ul');
      questCardContainer.classList.add(
        `${this.QUEST_BOARD_CLASS_NAME}__questCard`,
      );
      quests.forEach((quest) => {
        const questCard = this.createQuestCard(quest);
        questCardContainer.appendChild(questCard);
      });
      column.appendChild(questCardContainer);
    }

    return column;
  }

  // Группировка квестов по колонкам к которым они привязаны
  private groupQuestsByColumn(quests: QuestCard[]): Map<Id, QuestCard[]> {
    const grouped = new Map<Id, QuestCard[]>();

    quests.forEach((quest: QuestCard) => {
      const existingQuests = grouped.get(quest.columnId) ?? [];
      existingQuests.push(quest);
      grouped.set(quest.columnId, existingQuests);
    });

    return grouped;
  }

  // Создание элемента карточки квеста
  private createQuestCard(dataset: QuestCard): HTMLElement {
    const questCard = this.createBaseNode('li', dataset, 'h4');
    questCard.classList.add(`${this.QUEST_BOARD_CLASS_NAME}__quest-card`);

    if (dataset.rewards.length > 0) {
      const rewards = document.createElement('ul');
      rewards.classList.add(
        `${this.QUEST_BOARD_CLASS_NAME}__quest-rewards-list`,
      );
      dataset.rewards.forEach((reward) => {
        const questReward = document.createElement('li');
        questReward.classList.add(
          `${this.QUEST_BOARD_CLASS_NAME}__quest-reward`,
        );
        questReward.textContent = reward;
        rewards.appendChild(questReward);
      });
      questCard.appendChild(rewards);
    }

    if (dataset.creation || dataset.expiration) {
      const questDates = document.createElement('ul');
      questDates.classList.add(`${this.QUEST_BOARD_CLASS_NAME}quest-dates`);
      this.DATE_KINDS.forEach((kind) => {
        const date = dataset[kind];
        if (!date) {
          return;
        }

        const dateNode = document.createElement('li');
        dateNode.classList.add(`${this.QUEST_BOARD_CLASS_NAME}quest-date`);
        dateNode.textContent = this.formatDate(kind, date);
        questDates.appendChild(dateNode);
      });
      questCard.appendChild(questDates);
    }

    return questCard;
  }

  // Форматирование даты
  private formatDate(kind: DateKind, date: ISODate): string {
    const [day, month, year] = date.split('-');
    const dateFormat = `${day}/${month}/${year}`;
    return kind === 'creation'
      ? `Was created on: ${dateFormat}`
      : `Expire on: ${dateFormat}`;
  }
}
