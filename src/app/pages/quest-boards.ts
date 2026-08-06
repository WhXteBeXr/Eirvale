import { Page } from '@/app/pages/page.ts';
import type {
  QuestCard,
  QuestColumn,
  QuestBoard,
  ToolbarAction,
  QBoardNode,
  TitleNode,
  DescriptionNode,
  Id,
  DateFormat,
  DateKind,
} from '@/app/pages/quest-boards.config.ts';

// TODO: Переработать систему имен

export class QuestBoardPage extends Page {
  private readonly DATE_KINDS: DateKind[] = ['creation', 'expiration'];
  private currentBoardId: number | null = null;
  private previousBoardId: number | null = null;
  private boardsList: QuestBoard[];

  constructor(
    mountContainer: HTMLElement,
    toolbarContainer: HTMLElement,
    boardsList: Array<QuestBoard>,
    toolbarActions: Array<ToolbarAction>,
  ) {
    super(mountContainer, toolbarContainer, toolbarActions);
    this.boardsList = boardsList;
  }

  /* TODO: Реализовать смену контента без замены и удаления слушателей на элементах.
      Просто сделать один на родительском контейнере доски и принимать через него всплытием события */
  // TODO: Проверить стоит ли переписать хэндлеры на функциональные выражения
  // TODO: Первым делом реализовать логику выбора досок через делегирование

  // Создание всей разметки страницы
  protected renderPageLayout(): HTMLElement {
    // TODO: Пройтись по классам дочерних элементов, может стоит переназвать
    const page = document.createElement('div');
    page.classList.add('quest-boards__page');

    const boardsSelection = this.renderBoardsSelection(this.boardsList);
    // TODO: Создать логику отображения начальной доски
    const board = this.renderBoard(this.boardsList[0]);

    page.append(boardsSelection, board);
    return page;
  }

  // Обработчик действий по клику кнопки внутри тулбара
  protected handleToolbarAction(button: HTMLButtonElement) {}

  // Обработчик клика для выбора доски
  private handleBoardSelectionClick() {}

  // Отображение выбора досок
  private renderBoardsSelection(boards: QuestBoard[]): HTMLElement {
    // return document.createElement('div');
  }

  // Добавление слушателя выбора доски на родительский элемент
  private attachSelectionDelegate() {}

  // Обработчик клика по доске из списка
  private handleBoardSeletion(): Id {}

  // TODO: Возможно реализовать логику замены контента доски
  // Замена доски
  private switchBoard(boardId: Id): QuestBoard {}

  // Очистка контейнера с текущей доской
  private clearCurentBoard() {}

  private groupQuestsByColumn(quests: QuestCard[]): Map<Id, QuestCard[]> {
    const grouped = new Map<Id, QuestCard[]>();

    quests.forEach((quest: QuestCard) => {
      const existingQuests = grouped.get(quest.columnId) ?? [];
      existingQuests.push(quest);
      grouped.set(quest.columnId, existingQuests);
    });

    return grouped;
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
      title.classList.add('quest-board__element-title');
      title.textContent = dataset.title;
      element.appendChild(title);
    }

    if (dataset.description) {
      const description = document.createElement(descriptionTag);
      description.classList.add('quest-board__element-description');
      description.textContent = dataset.description;
      element.appendChild(description);
    }

    return element;
  }

  // Создание и добавление в DOM доски квестов
  private renderBoard(dataset: QuestBoard | undefined): HTMLElement {
    if (!dataset) {
      throw new Error('Board was not provided');
    }

    const board = this.createBaseNode('div', dataset, 'h2');
    board.classList.add('quest-board');

    const totalColumns = document.createElement('p');
    totalColumns.classList.add('quest-board__total-columns');
    totalColumns.textContent = `Колонок на доске: ${dataset.columns.length.toString()}`;
    board.appendChild(totalColumns);

    const groupedQuests = this.groupQuestsByColumn(dataset.quests);

    const columnNodes: HTMLElement[] = dataset.columns.map((column) => {
      return this.createColumn(column, groupedQuests.get(column.id) ?? []);
    });
    board.append(...columnNodes);

    return board;
  }

  // Создание контейнера колонки для квестов
  private createColumn(dataset: QuestColumn, quests: QuestCard[]): HTMLElement {
    const column = this.createBaseNode('ul', dataset, 'h3');
    column.classList.add('quest-board__column');

    const importance = document.createElement('span');
    importance.classList.add('quest-board__column-importance');
    importance.textContent = dataset.importance;
    column.appendChild(importance);

    quests.forEach((quest) => {
      const questCard = this.createQuestCard(quest);
      column.appendChild(questCard);
    });

    return column;
  }

  // Создание элемента карточки квеста
  private createQuestCard(dataset: QuestCard): HTMLElement {
    const questCard = this.createBaseNode('li', dataset, 'h4');
    questCard.classList.add('quest-board__quest-card');

    const rewards = document.createElement('ul');
    rewards.classList.add('quest-board__quest-rewards-list');
    dataset.rewards.forEach((reward) => {
      const questReward = document.createElement('li');
      questReward.classList.add('quest-board__quest-reward');
      questReward.textContent = reward;
      rewards.appendChild(questReward);
    });

    const questDates = document.createElement('ul');
    questDates.classList.add('quest-board__quest-dates');
    this.DATE_KINDS.forEach((kind) => {
      if (!dataset[kind]) {
        return;
      }

      const dateNode = document.createElement('li');
      dateNode.classList.add('quest-board__quest-date');
      dateNode.textContent = this.formatDate(kind, dataset[kind]);
      questDates.appendChild(dateNode);
    });
    questCard.appendChild(questDates);

    return questCard;
  }

  // Форматирование даты
  private formatDate(kind: string, date: DateFormat | undefined): string {
    if (date) {
      const { day, month, year } = date;
      const dateFormat = `${day}/${month}/${year}`;
      return kind === 'creation'
        ? `Was created on: ${dateFormat}`
        : `Expire on: ${dateFormat}`;
    }

    return ''; // TODO: Пересмотреть return
  }
}
