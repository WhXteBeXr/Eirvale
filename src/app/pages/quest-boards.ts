import { Page } from '@/app/pages/page.ts';
import type {
  QuestDate,
  QuestCard,
  QuestColumn,
  QuestBoard,
  QBElementInfo,
  ToolbarAction,
  KindOfDate,
  QBPageElement,
} from '@/app/pages/quest-boards.config.ts';

export class QuestBoardPage extends Page {
  constructor(
    mountContainer: HTMLElement,
    toolbarContainer: HTMLElement,
    toolbarActions: Array<ToolbarAction>,
  ) {
    super(mountContainer, toolbarContainer, toolbarActions);
  }

  // Создание всего лэйаута страницы
  protected createPageLayout(): HTMLElement {
    return undefined;
  }

  // Обработчик действий по клику кнопки внутри тулбара
  protected handleToolbarAction(button: HTMLButtonElement) {}

  // TODO: Пересмотреть метод. Может стоит сделать рекурсию, которая разворачивалась бы от списка элементов до одного простого
  // Универсальный метод создания элемента
  private createElement<K extends keyof HTMLElementTagNameMap>(
    elementName: K,
    elementData: QBPageElement,
  ): HTMLElement {
    const element: HTMLElement = document.createElement(elementName);

    return element;
  }

  private createQuestCard(questCardData: QuestCard): HTMLElement {
    return this.createElement('li', questCardData);
  }

  private createColumn(columnData: QuestColumn): HTMLElement {
    const column = this.createElement('ul', columnData);
    columnData.children.forEach((child) => {
      column.appendChild(this.createQuestCard(child));
    });
    return column;
  }

  // Основной метод, создающий доску квестов
  private createBoard(elementData: QuestBoard): HTMLElement {
    const board = this.createElement('section', elementData);
    elementData.children.forEach((child) => {
      board.appendChild(this.createColumn(child));
    });
    return board;
  } // TODO: Пересмотреть создание доски. Возможно переделать на рекурсию

  // Вложение данных в переданный контейнер
  // private fillElement(element: HTMLElement, elementInfo: QBElementInfo): void {
  //   element.classList.add(`quest-board__${elementInfo.className}`);
  // }

  // Форматирование даты
  private formatDate(kind: KindOfDate, date: QuestDate | undefined): string {
    if (date) {
      const { day, month, year } = date;
      return kind === 'creation'
        ? `Was created on: ${day}/${month}/${year}`
        : `Expire on:: ${day}/${month}/${year}`;
    } else {
      return kind === 'creation'
        ? `Doesn't have creation date`
        : `Doesn't have expiration date`;
    }
  }

  // TODO: Реализовать прослойки для создания элементов страницы (зависит от выбора подхода создания)
}
