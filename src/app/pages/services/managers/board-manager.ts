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
import type {
  ChangeEvent,
  IBoardManager,
} from '@/app/pages/services/managers/board-manager.types.ts';
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
  private readonly api: IBoardApi; // Прослойка для обращения к api сервера
  private readonly listeners: Set<(listener: ChangeEvent) => void> = new Set(); // Коллекция слушателей подписанных на менеджер
  private boardsList: QuestBoard[] | null = null; // Все доски полученные от сервера
  private loadedBoard: QBFullData | null = null; // Текущая выбранная доска

  constructor(api: IBoardApi) {
    this.api = api;
  }

  subscribe(listener: (event: ChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async loadAllBoards(): Promise<QuestBoard[]> {
    try {
      this.boardsList = await withRetry(() => this.api.getBoards());
      this.notify({ type: 'boardListLoaded' });
      return structuredClone(this.boardsList);
    } catch (e) {
      throw new Error('Unable to load boards', { cause: e });
    }
  }

  async loadNewBoard(id: Id): Promise<QBFullData> {
    try {
      if (this.loadedBoard?.board.id !== id) {
        this.loadedBoard = await withRetry(() => this.api.getBoardData(id));
      }
      const loadedBoardClone = structuredClone(this.loadedBoard);
      this.notify({ type: 'newBoardLoaded', element: loadedBoardClone });
      return loadedBoardClone;
    } catch (e) {
      throw new Error('Failed to load board', { cause: e });
    }
  }

  isBoardLoaded(): boolean {
    return !!this.loadedBoard;
  }

  getAllLoadedBoards(): QuestBoard[] {
    if (this.boardsList === null) {
      throw new Error('Boards is not loaded');
    }
    return structuredClone(this.boardsList);
  }

  getLoadedBoard(): QBFullData {
    if (!this.loadedBoard) {
      throw new Error('Current board is not loaded');
    }
    return structuredClone(this.loadedBoard);
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
      const boardClone = structuredClone(board);
      this.notify({ type: 'boardCreated', element: boardClone });
      return boardClone;
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
      const columnClone = structuredClone(column);
      this.notify({ type: 'columnCreated', element: columnClone });
      return columnClone;
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
      const questClone = structuredClone(quest);
      this.notify({ type: 'questCreated', element: questClone });
      return questClone;
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

      this.notify({ type: 'boardUpdated', element: updatedBoard });
      return updatedBoard;
    } catch (e) {
      throw new Error('Failed to update board', { cause: e });
    }
  }

  async updateColumn(id: Id, data: QuestColumnDTO): Promise<QuestColumn> {
    const board = this.loadedBoard;

    if (!board) {
      throw new Error(`Current board isn't selected. Unable to update column`);
    }

    try {
      const updatedColumn = await withRetry(() =>
        this.api.updateColumn(id, data),
      );
      const oldColumn = findById(board.columns, id, 'column');

      oldColumn.boardId = updatedColumn.boardId;
      oldColumn.title = updatedColumn.title;
      oldColumn.description = updatedColumn.description;
      oldColumn.importance = updatedColumn.importance;

      this.notify({ type: 'columnUpdated', element: updatedColumn });
      return updatedColumn;
    } catch (e) {
      throw new Error('Failed to update column', { cause: e });
    }
  }

  async updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard> {
    const board = this.loadedBoard;

    if (!board) {
      throw new Error(`Current board isn't selected. Unable to update quest`);
    }

    try {
      const updatedQuest = await withRetry(() =>
        this.api.updateQuest(id, data),
      );
      const oldQuest = findById(board.quests, id, 'quest');

      oldQuest.columnId = updatedQuest.columnId;
      oldQuest.title = updatedQuest.title;
      oldQuest.description = updatedQuest.description;
      oldQuest.rewards = updatedQuest.rewards;
      oldQuest.creation = updatedQuest.creation;
      oldQuest.expiration = updatedQuest.expiration;

      this.notify({ type: 'questUpdated', element: updatedQuest });
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

      this.notify({ type: 'boardDeleted', element: result.board });
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

      this.notify({ type: 'columnDeleted', element: result.column });
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

      this.notify({ type: 'questDeleted', element: result.quest });
      return result;
    } catch (e) {
      throw new Error(`Failed to delete quest with id: ${id}`, { cause: e });
    }
  }

  /** Оповещение подписанных элементов об изменениях */
  private notify(event: ChangeEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
