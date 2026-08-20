import { BoardPage } from '@/app/pages/board-structure/board-page.ts';
import type { BoardManager } from '@/app/pages/services/managers/board-manager.ts';
import type { ToolbarAction } from '@/shared/types/common.types.ts';
import type {
  ParentName,
  QuestBoard,
  QuestCard,
  QuestColumn,
} from '@/app/pages/board-structure/types/board-pages.types.ts';
import { QB_TOOLBAR_ACTIONS } from '@/app/pages/board-structure/quest-boards/quest-boards-data.ts';

// TODO: Переработать систему имен

export class QuestBoardPage extends BoardPage {
  constructor(boardsManager: BoardManager, mountContainer: HTMLElement) {
    super(boardsManager, mountContainer, QB_TOOLBAR_ACTIONS);
  }

  /** Создание всей разметки страницы */
  protected createPageLayout(): HTMLElement[] {
    const selectionContainer = this.getSelectionContainer();
    const boardContainer = this.getBoardContainer();
    return [selectionContainer, boardContainer];
  }

  /** Обработчик действий по клику кнопки внутри тулбара */
  protected handleToolbarAction(
    button: HTMLButtonElement,
    actionData: ToolbarAction,
  ) {
    switch (actionData.id) {
      case '0':
        this.handleCreateBoardClick();
        break;
      case '1':
        this.handleDeleteBoardClick();
        break;
      default:
        console.log(button, actionData);
    }
  }

  private handleCreateBoardClick(): void {
    this.boardManager
      .createBoard({
        title: 'Your new board!',
      })
      .then((board) => {
        void this.boardManager.loadNewBoard(board.id);
      });
  }

  private handleDeleteBoardClick(): void {
    const renderedBoard = this.boardOnPage;
    if (renderedBoard) void this.boardManager.deleteBoard(renderedBoard.id);
  }

  protected decorateBoard(board: HTMLElement, boardData: QuestBoard): void {
    const createButton = this.createNewButton('board', boardData.id);
    const updateButton = this.createUpdateButton('board');

    board.append(createButton, updateButton);
  }

  protected decorateColumn(
    column: HTMLLIElement,
    columnData: QuestColumn,
  ): void {
    const createButton = this.createNewButton('column', columnData.id);
    const updateButton = this.createUpdateButton('column');
    const deleteButton = this.createDeleteButton('column', columnData.id);

    column.append(createButton, updateButton, deleteButton);
  }

  protected decorateQuest(quest: HTMLLIElement, questData: QuestCard): void {
    const updateButton = this.createUpdateButton('quest');
    const deleteButton = this.createDeleteButton('quest', questData.id);

    quest.append(updateButton, deleteButton);
  }

  private createNewButton(
    parent: Exclude<ParentName, 'quest'>,
    parentId: string,
    buttonText?: string,
    className: string = 'create-button',
  ) {
    const button = document.createElement('button');
    button.classList.add(className);

    if (parent === 'column') {
      buttonText = buttonText || 'New quest';
      button.addEventListener('click', () => {
        void this.boardManager.createQuest({
          columnId: parentId,
          title: 'New quest!',
          rewards: ['No rewards!'],
        });
      });
    } else {
      buttonText = buttonText || 'New column';
      button.addEventListener('click', () => {
        void this.boardManager.createColumn({
          boardId: parentId,
          title: 'New column!',
          importance: 'Column importance',
        });
      });
    }

    button.textContent = buttonText;
    return button;
  }

  private createUpdateButton(
    parent: ParentName,
    buttonText?: string,
    className: string = 'update-button',
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add(className);
    button.addEventListener('click', () => {});

    if (parent === 'quest') {
      buttonText = buttonText || 'Update quest';
    } else if (parent === 'column') {
      buttonText = buttonText || 'Update column';
    } else {
      buttonText = buttonText || 'Update board';
    }

    button.textContent = buttonText;
    return button;
  }

  private createDeleteButton(
    parent: ParentName,
    parentId: string,
    buttonText?: string,
    className: string = 'delete-button',
  ) {
    const button = document.createElement('button');
    button.classList.add(className);
    button.addEventListener('click', () => {});

    if (parent === 'quest') {
      buttonText = buttonText || 'Delete quest';
      button.addEventListener('click', () => {
        void this.boardManager.deleteQuest(parentId);
      });
    } else if (parent === 'column') {
      buttonText = buttonText || 'Delete column';
      button.addEventListener('click', () => {
        void this.boardManager.deleteColumn(parentId);
      });
    } else {
      buttonText = buttonText || 'Delete board';
      button.addEventListener('click', () => {
        void this.boardManager.deleteBoard(parentId);
      });
    }

    button.textContent = buttonText;
    return button;
  }
}
