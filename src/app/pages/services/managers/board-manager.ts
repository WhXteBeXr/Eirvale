import type {
  QBFullData,
  QuestBoard,
  QuestBoardDTO,
  QuestCard,
  QuestCardDTO,
  QuestColumn,
  QuestColumnDTO,
} from '@/app/pages/board-structure/types/board-pages.types.ts';
import type { Id } from '@/shared/types/common.types.ts';
import type { IBoardManager } from '@/app/pages/board-structure/types/board-manager.types.ts';
import type {
  DeletedBoardData,
  DeletedColumnData,
  DeletedQuestData,
  IBoardApi,
} from '@/mocks/board-api.types.ts';
import { withRetry } from '@/shared/utils/with-retry.ts';
import findById from '@/shared/utils/QB-find-by-id.ts';

/** Менеджер для работы с данными досок */
export class BoardManager implements IBoardManager {
  private readonly api: IBoardApi;
  private boardsList: QuestBoard[] | null = null; // Все доски полученные от сервера
  private loadedBoard: QBFullData | null = null; // Текущая выбранная доска

  constructor(api: IBoardApi) {
    this.api = api;
  }

  async loadAllBoards(): Promise<QuestBoard[]> {
    try {
      this.boardsList = await withRetry(() => this.api.getBoards());
      return this.boardsList;
    } catch (e) {
      throw new Error('Unable to load boards', { cause: e });
    }
  }

  async loadNewBoard(id: Id): Promise<QBFullData> {
    try {
      this.loadedBoard = await withRetry(() => this.api.getBoardData(id));
      return this.loadedBoard;
    } catch (e) {
      throw new Error('Failed to load board', { cause: e });
    }
  }

  /* Дополнительные проверки существования для создания доски не требуется.
  Создать доску можно лишь по кнопке которая появляется только при
  загрузке страницы, значит boardsList будет объявлен */

  async createBoard(data: QuestBoardDTO): Promise<QuestBoard> {
    try {
      const board = await withRetry(() => this.api.createBoard(data), {
        maxAttempts: 1,
      });
      this.boardsList?.push(board);
      return board;
    } catch (e) {
      throw new Error('Failed to create board', {
        cause: e,
      });
    }
  }

  /* Методы reateColumn и createQuest могут быть вызваны для создания только, по
  нажатии кнопки и в случае существования доски, проверки существований не требуются */

  async createColumn(data: QuestColumnDTO): Promise<QuestColumn> {
    try {
      const column = await withRetry(() => this.api.createColumn(data), {
        maxAttempts: 1,
      });
      this.loadedBoard?.columns.push(column);
      return column;
    } catch (e) {
      throw new Error('Failed to create column', { cause: e });
    }
  }

  async createQuest(data: QuestCardDTO): Promise<QuestCard> {
    try {
      const quest = await withRetry(() => this.api.createQuest(data), {
        maxAttempts: 1,
      });
      this.loadedBoard?.quests.push(quest);
      return quest;
    } catch (e) {
      throw new Error('Failed to create quest card', {
        cause: e,
      });
    }
  }

  async updateBoard(id: Id, data: QuestBoardDTO): Promise<QuestBoard> {
    try {
      const updatedBoard = await withRetry(() =>
        this.api.updateBoard(id, data),
      );

      if (this.boardsList) {
        const oldBoard = findById(this.boardsList, id, 'board');
        oldBoard.title = updatedBoard.title;
        oldBoard.description = updatedBoard.description;
      }

      // Синхронизируем текущую доску, если обновилась она
      if (this.loadedBoard?.board.id === id) {
        this.loadedBoard.board = updatedBoard;
      }

      return updatedBoard;
    } catch (e) {
      throw new Error('Failed to update board', { cause: e });
    }
  }

  async updateColumn(id: Id, data: QuestColumnDTO): Promise<QuestColumn> {
    if (!this.loadedBoard) {
      return Promise.reject(
        `Current board isn't selected. Unable to update column`,
      );
    }

    try {
      const updatedColumn = await withRetry(() =>
        this.api.updateColumn(id, data),
      );
      const oldColumn = findById(this.loadedBoard.columns, id, 'column');

      oldColumn.boardId = updatedColumn.boardId;
      oldColumn.title = updatedColumn.title;
      oldColumn.description = updatedColumn.description;
      oldColumn.importance = updatedColumn.importance;

      return updatedColumn;
    } catch (e) {
      throw new Error('Failed to update column', { cause: e });
    }
  }

  async updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard> {
    if (!this.loadedBoard) {
      throw new Error(`Current board isn't selected. Unable to update quest`);
    }

    try {
      const updatedQuest = await withRetry(() =>
        this.api.updateQuest(id, data),
      );
      const oldQuest = findById(this.loadedBoard.quests, id, 'column');

      oldQuest.columnId = updatedQuest.columnId;
      oldQuest.title = updatedQuest.title;
      oldQuest.description = updatedQuest.description;
      oldQuest.rewards = updatedQuest.rewards;
      oldQuest.creation = updatedQuest.creation;
      oldQuest.expiration = updatedQuest.expiration;

      return updatedQuest;
    } catch (e) {
      throw new Error('Failed to update quest', { cause: e });
    }
  }

  async deleteBoard(id: Id): Promise<DeletedBoardData> {
    try {
      const result = await withRetry(() => this.api.deleteBoard(id));
      this.boardsList =
        this.boardsList?.filter((board) => board.id !== id) ?? null;

      // Если доска отображена сейчас - синхронизируем
      if (this.loadedBoard?.board.id === result.board.id) {
        this.loadedBoard = null;
      }

      return result;
    } catch (e) {
      throw new Error(`Failed to delete board with id: ${id}`, { cause: e });
    }
  }

  async deleteColumn(id: Id): Promise<DeletedColumnData> {
    try {
      const result = await withRetry(() => this.api.deleteColumn(id));

      /* Удалить колонку возможно только по нажатии кнопки.
      Доска должна быть загружена, значит проводим синхронизацию */

      if (this.loadedBoard) {
        this.loadedBoard.columns = this.loadedBoard.columns.filter(
          (column) => column.id !== id,
        );
        this.loadedBoard.quests = this.loadedBoard.quests.filter(
          (quest) => !result.questIds.includes(quest.id),
        );
      }

      return result;
    } catch (e) {
      throw new Error(`Failed to delete column with id: ${id}`, { cause: e });
    }
  }

  async deleteQuest(id: Id): Promise<DeletedQuestData> {
    try {
      const result = await withRetry(() => this.api.deleteQuest(id));

      /* Удалить квест возможно только по нажатии кнопки в колонке.
      Доска должна быть загружена, значит проводим синхронизацию */

      if (this.loadedBoard) {
        this.loadedBoard.quests = this.loadedBoard.quests.filter(
          (quest) => quest.id !== id,
        );
      }

      return result;
    } catch (e) {
      throw new Error(`Failed to delete quest with id: ${id}`, { cause: e });
    }
  }
}
