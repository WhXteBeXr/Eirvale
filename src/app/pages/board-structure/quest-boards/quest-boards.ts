import { BoardPage } from '@/app/pages/board-structure/board-page.ts';
import type { BoardManager } from '@/app/pages/services/managers/board-manager.ts';
import type { Id, ToolbarAction } from '@/shared/types/common.types.ts';

// TODO: Переработать систему имен

export class QuestBoardPage extends BoardPage {
  constructor(
    boardsManager: BoardManager,
    mountContainer: HTMLElement,
    toolbarActions: ToolbarAction[],
  ) {
    super(boardsManager, mountContainer, toolbarActions);
  }

  // Создание всей разметки страницы
  protected createPageLayout(): HTMLElement[] {}

  // Обработчик действий по клику кнопки внутри тулбара
  protected handleToolbarAction(
    actionId: Id,
    action: string,
    button: HTMLButtonElement,
  ) {
    console.log(actionId, action, button);
  }
}
