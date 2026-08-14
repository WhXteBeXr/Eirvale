import type {
  DeletedBoardData,
  DeletedColumnData,
  DeletedQuestData,
  IBoardApi,
} from '@/mocks/board-api.types.ts';
import type {
  QuestBoard,
  QuestColumn,
  QuestCard,
  QuestBoardDTO,
  QuestColumnDTO,
  QuestCardDTO,
  QBFullData,
} from '@/app/pages/board-structure/types/board-pages.types.ts';
import type { Id } from '@/shared/types/common.types.ts';
import deleteById from '@/shared/utils/QB-delete-by-id.ts';
import findById from '@/shared/utils/QB-find-by-id.ts';
import questBoardsData from '@/mocks/data/quest-boards-data.json';
import { ApiError } from '@/shared/errors/api-errors.ts';

/** Класс имитирующий работу с сервером для страниц со структурами досок */
class MockBoardApi implements IBoardApi {
  private readonly BOARD_ENTITY_NAME = 'board' as const;
  private readonly COLUMN_ENTITY_NAME = 'column' as const;
  private readonly QUEST_ENTITY_NAME = 'quest' as const;
  private boards: QuestBoard[] = structuredClone(questBoardsData.boards);
  private columns: QuestColumn[] = structuredClone(questBoardsData.columns);
  private quests: QuestCard[] = structuredClone(questBoardsData.quests);
  private readonly delayMs: number = 200; // Default 200 ms
  private readonly failureChance: number = 0.05; // Default: 0.05

  async getBoards(): Promise<QuestBoard[]> {
    await this.imitateRequest();
    return structuredClone(this.boards);
  }

  async getColumns(): Promise<QuestColumn[]> {
    await this.imitateRequest();
    return structuredClone(this.columns);
  }

  async getQuests(): Promise<QuestCard[]> {
    await this.imitateRequest();
    return structuredClone(this.quests);
  }

  async getBoardData(id: Id): Promise<QBFullData> {
    await this.imitateRequest();

    const board = findById(this.boards, id, this.BOARD_ENTITY_NAME);
    const columns = this.columns.filter((column) => column.boardId === id);
    const columnIds = columns.map((column) => column.id);
    const quests = this.quests.filter((quest) =>
      columnIds.includes(quest.columnId),
    );

    return structuredClone({ board, columns, quests });
  }

  async getBoardById(id: Id): Promise<QuestBoard> {
    await this.imitateRequest();
    const board = findById(this.boards, id, this.BOARD_ENTITY_NAME);
    return structuredClone(board);
  }

  async createBoard(data: QuestBoardDTO): Promise<QuestBoard> {
    await this.imitateRequest();

    const board: QuestBoard = {
      id: this.generateNewId(),
      title: data.title,
      description: data.description,
    };
    this.boards.push(board);

    return structuredClone(board);
  }

  async createColumn(data: QuestColumnDTO): Promise<QuestColumn> {
    await this.imitateRequest();

    const column: QuestColumn = {
      id: this.generateNewId(),
      boardId: data.boardId,
      title: data.title,
      description: data.description,
      importance: data.importance,
    };
    this.columns.push(column);

    return structuredClone(column);
  }

  async createQuest(data: QuestCardDTO): Promise<QuestCard> {
    await this.imitateRequest();

    const quest: QuestCard = {
      id: this.generateNewId(),
      columnId: data.columnId,
      title: data.title,
      description: data.description,
      rewards: data.rewards,
      creation: data.creation,
      expiration: data.expiration,
    };
    this.quests.push(quest);

    return structuredClone(quest);
  }

  async updateBoard(id: Id, data: QuestBoardDTO): Promise<QuestBoard> {
    await this.imitateRequest();
    const board = findById(this.boards, id, this.BOARD_ENTITY_NAME);

    board.title = data.title;
    board.description = data.description;

    return structuredClone(board);
  }

  async updateColumn(columnId: Id, data: QuestColumnDTO): Promise<QuestColumn> {
    await this.imitateRequest();

    const column = findById(this.columns, columnId, this.COLUMN_ENTITY_NAME);
    column.boardId = data.boardId;
    column.title = data.title;
    column.description = data.description;
    column.importance = data.importance;

    return structuredClone(column);
  }

  async updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard> {
    await this.imitateRequest();

    const quest = findById(this.quests, id, this.QUEST_ENTITY_NAME);
    quest.columnId = data.columnId;
    quest.title = data.title;
    quest.description = data.description;
    quest.rewards = data.rewards;
    quest.creation = data.creation;
    quest.expiration = data.expiration;

    return structuredClone(quest);
  }

  async deleteBoard(id: Id): Promise<DeletedBoardData> {
    await this.imitateRequest();
    return structuredClone(this.deleteBoardSync(id));
  }

  async deleteColumn(id: Id): Promise<DeletedColumnData> {
    await this.imitateRequest();
    return structuredClone(this.deleteColumnSync(id));
  }

  async deleteQuest(id: Id): Promise<DeletedQuestData> {
    await this.imitateRequest();
    return structuredClone(this.deleteQuestSync(id));
  }

  /** Имитация запроса к серверу с задержкой и возможной ошибкой */
  private async imitateRequest(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    if (Math.random() < this.failureChance) {
      throw new ApiError(500, 'Internal Server Error');
    }
  }

  /** Создание рандомного id (UUID)*/
  private generateNewId(): Id {
    return crypto.randomUUID();
  }

  /** Синхронное каскадное удаление элементов доски */
  private deleteBoardSync(id: Id): DeletedBoardData {
    const board = deleteById(this.boards, id, this.BOARD_ENTITY_NAME);

    const orphanedColumnIds: Id[] = this.columns
      .filter((column) => column.boardId === id)
      .map((column) => column.id);

    const deletedQuestIds: Id[] = [];
    orphanedColumnIds.forEach((columnId) => {
      deletedQuestIds.push(...this.deleteColumnSync(columnId).questIds);
    });

    return { board, columnsIds: orphanedColumnIds, questIds: deletedQuestIds };
  }

  /** Синхронное каскадное удаление элементов колонки */
  private deleteColumnSync(id: Id): DeletedColumnData {
    const column = deleteById(this.columns, id, this.COLUMN_ENTITY_NAME);
    const orphanedQuestIds: Id[] = this.quests
      .filter((quest) => quest.columnId === id)
      .map((quest) => quest.id);

    orphanedQuestIds.forEach((questId) => {
      this.deleteQuestSync(questId);
    });

    return { column, questIds: orphanedQuestIds };
  }

  /** Синхронное удаление элементов квестов */
  private deleteQuestSync(id: Id): DeletedQuestData {
    const quest = deleteById(this.quests, id, this.QUEST_ENTITY_NAME);
    return { quest };
  }
}

export default new MockBoardApi();
