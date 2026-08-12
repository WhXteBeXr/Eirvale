import { BoardPage } from '@/app/pages/board-structure/board-page.ts';
import type { QuestBoard } from '@/types/board-pages/board-pages.types.ts';
import type { ToolbarAction } from '@/types/board-pages/common.types.ts';

// TODO: Переработать систему имен
// TODO: Продумать систему удаления и добавления элементов доски
//  Возможно использовать замыкание, в таком случае может переписать созданные обработчика на него тоже

export class QuestBoardPage extends BoardPage {
  constructor(
    mountContainer: HTMLElement,
    boardsList: QuestBoard[],
    toolbarActions: ToolbarAction[],
  ) {
    super(mountContainer, boardsList, toolbarActions);
  }

  // Создание всей разметки страницы
  protected createPageLayout(): HTMLElement[] {
    const boardContainer = this.getBoardContainer();
    const board = this.createBoard();
    boardContainer.append(...board);

    const boardsSelectionContainer = this.getSelectionContainer();
    const boardsSelection = this.createBoardsSelection();
    boardsSelectionContainer.appendChild(boardsSelection);

    return [boardsSelectionContainer, boardContainer];
  }

  // Обработчик действий по клику кнопки внутри тулбара
  protected handleToolbarAction(button: HTMLButtonElement) {
    console.log(button);
  }
}
