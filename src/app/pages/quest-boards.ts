import { AVAILABLE_ACTIONS } from '@/app/pages/quest-boards.config.ts';
import type {
  QuestDate,
  QuestCard,
  QuestColumn,
  QuestBoard,
} from '@/app/pages/quest-boards.config.ts';
import type { ToolbarAction } from '@/app/pages/quest-boards.config.ts';
import { Page } from '@/app/pages/page.ts';

// TODO: Расширить класс. Сейчас вместо полноценной страницы он работает только с доской
export class QuestBoardsPage extends Page {
  private questBoard: QuestBoard;
  private mountContainer: HTMLElement;
  private rootElement: HTMLElement | null = null;

  constructor(mountContainer: HTMLElement, questBoard: QuestBoard) {
    super();
    this.mountContainer = mountContainer;
    this.questBoard = questBoard;
  }

  mountPage(): void {
    this.rootElement = this.renderBoard();
    this.mountContainer.appendChild(this.rootElement);
    // TODO: Метод добавляющий листенеры событий
  }

  unmountPage(): void {
    // TODO: Очистка листенеров
    if (this.rootElement) {
      this.rootElement.remove();
      this.rootElement = null;
    }
  }

  switchBoard(questBoard: QuestBoard): void {
    if (!this.rootElement) {
      return;
    }

    this.mountContainer.removeChild(this.rootElement);
    this.questBoard = questBoard;
    this.rootElement = this.renderBoard();
    this.mountContainer.appendChild(this.rootElement);
  }

  clearBoard(): void {}

  private renderBoard(): HTMLElement {
    const boardElement = document.createElement('section');
    boardElement.classList.add('quest-board');

    const boardTitle = document.createElement('h2');
    boardTitle.textContent = this.questBoard.title;
    boardTitle.classList.add('quest-board__title');
    boardElement.appendChild(boardTitle);

    this.questBoard.questColumns.forEach((column: QuestColumn) => {
      const columnElement = this.renderColumn(column);
      boardElement.appendChild(columnElement);
    });

    return boardElement;
  }

  private renderColumn(column: QuestColumn): HTMLElement {
    const columnElement = document.createElement('ul');
    columnElement.classList.add('quest-board__column'); // TODO: Пересмотреть названия по БЭМ

    const columnTitle = document.createElement('h3');
    columnTitle.textContent = column.title;
    columnTitle.classList.add('quest-board__column-title');
    columnElement.appendChild(columnTitle);

    column.listedQuests.forEach((quest: QuestCard) => {
      const questCardElement = this.renderQuestCard(quest);
      columnElement.appendChild(questCardElement);
    });

    return columnElement;
  }

  private renderQuestCard(questCard: QuestCard): HTMLElement {
    const questElement = document.createElement('li'); // TODO: Подобрать семантический тэг
    questElement.classList.add('quest-board__quest-card');

    questElement.append(
      this.renderTitle(questCard.title),
      this.renderDescription(questCard.description),
      this.renderQuestRewards(questCard.rewards),
      this.renderQuestDate('creation', questCard.creationDate),
      this.renderQuestDate('expiry', questCard.expiryDate),
    );

    return questElement;
  }

  private renderTitle(title: string): HTMLElement {
    const questTitle = document.createElement('h4');
    questTitle.textContent = title;
    questTitle.classList.add('quest-board__quest-card-title'); // TODO: Проверить БЭМ

    return questTitle;
  }

  private renderDescription(description: string): HTMLElement {
    const questDescription = document.createElement('p');
    questDescription.textContent = description;
    questDescription.classList.add('quest-board__quest-card-description');

    return questDescription;
  }

  private renderQuestRewards(rewards: string[]): HTMLElement {
    const questRewards = document.createElement('ul');
    questRewards.classList.add('quest-board__quest-card-rewards');
    rewards.forEach((reward) => {
      const rewardElement = document.createElement('li');
      rewardElement.textContent = reward;
      questRewards.appendChild(rewardElement);
    });

    return questRewards;
  }

  private renderQuestDate(
    dateType: 'creation' | 'expiry',
    date?: QuestDate,
  ): HTMLElement {
    const questDate = document.createElement('p');
    questDate.classList.add(`quest-board__quest-${dateType}-date`);

    if (date) {
      const { day, month, year } = date;
      const label = dateType === 'creation' ? 'Created on' : 'Expire on';
      questDate.textContent = `${label}: ${day}/${month}/${year}`;
    } else {
      questDate.textContent =
        dateType === 'creation' ? 'No creation date' : 'No expiration date';
    }

    return questDate;
  }
}
