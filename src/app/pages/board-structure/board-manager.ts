import type { QuestBoard } from '@/types/board-pages/board-pages.types.ts';
import type { Id } from '@/types/board-pages/common.types.ts';

// Менеджер работы с данными досок
export class BoardManager {
  protected boardsList: QuestBoard[]; // Список всех созданных досок

  constructor(boardsList: QuestBoard[]) {
    this.boardsList = boardsList;
  }

  public createNewBoard(title: string, description?: string): void {
    const board = {
      id,
      title,
      description,
      columns: [],
      quests: [],
    };

    this.boardsList.push(board);
  }

  public removeBoard(id: Id): void {}

  public createNewColumn(): void {}

  public deleteBoard(id: Id): void {}

  public createNewQuest(): void {}

  public deleteQuest(id: Id): void {}
}
