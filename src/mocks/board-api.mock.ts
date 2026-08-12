import type { BoardApi } from '@/mocks/board-api.types.ts';
import type {
  QuestBoard,
  QuestColumn,
  QuestCard,
  QuestBoardDTO,
  QuestColumnDTO,
  QuestCardDTO,
  QBoardNode,
} from '@/types/board-pages/board-pages.types.ts';
import type { Id } from '@/types/board-pages/common.types.ts';
import questBoardsData from '@/mocks/data/quest-boards-data.json';

export class MockBoardApi implements BoardApi {
  private readonly BOARD_ENTITY_NAME = 'board' as const;
  private readonly COLUMN_ENTITY_NAME = 'column' as const;
  private readonly QUEST_ENTITY_NAME = 'quest' as const;
  private boards: QuestBoard[] = structuredClone(questBoardsData.boards);
  private columns: QuestColumn[] = structuredClone(questBoardsData.columns);
  private quests: QuestCard[] = structuredClone(questBoardsData.quests);

  public async getBoards(): Promise<QuestBoard[]> {
    await this.imitateRequest();
    return structuredClone(this.boards);
  }

  public async getBoardTitles(): Promise<string[]> {
    await this.imitateRequest();
    return this.boards.map((board) => board.title);
  }

  public async getBoardById(id: Id): Promise<QuestBoard> {
    await this.imitateRequest();
    const board = this.findById(this.boards, id, this.BOARD_ENTITY_NAME);
    return structuredClone(board);
  }

  public async createBoard(data: QuestBoardDTO): Promise<QuestBoard> {
    await this.imitateRequest();

    const board: QuestBoard = {
      id: this.generateNewId(),
      title: data.title,
      description: data.description,
    };
    this.boards.push(board);

    return structuredClone(board);
  }

  public async updateBoard(id: Id, data: QuestBoardDTO): Promise<QuestBoard> {
    await this.imitateRequest();
    const board = this.findById(this.boards, id, this.BOARD_ENTITY_NAME);
    board.title = data.title;
    board.description = data.description;

    return structuredClone(board);
  }

  public async deleteBoard(id: Id): Promise<boolean> {
    await this.imitateRequest();

    // TODO: Доделать реализации методов удаления
    const deleted = this.removeById(this.boards, id, this.BOARD_ENTITY_NAME);
    const orphanedColumns = this.columns.filter(column => column.boardId === id);
  }

  public async createColumn(data: QuestColumnDTO): Promise<QuestColumn> {
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

  public async updateColumn(
    columnId: Id,
    data: QuestColumnDTO,
  ): Promise<QuestColumn> {
    await this.imitateRequest();

    const column = this.findById(
      this.columns,
      columnId,
      this.COLUMN_ENTITY_NAME,
    );
    column.boardId = data.boardId;
    column.title = data.title;
    column.description = data.description;
    column.importance = data.importance;

    return structuredClone(column);
  }

  public async deleteColumn(id: Id): Promise<boolean> {
    throw new Error('Not implemented');
  }

  public async createQuest(data: QuestCardDTO): Promise<QuestCard> {
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

  public async updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard> {
    await this.imitateRequest();

    const quest = this.findById(this.quests, id, this.QUEST_ENTITY_NAME);
    quest.columnId = data.columnId;
    quest.title = data.title;
    quest.description = data.description;
    quest.rewards = data.rewards;
    quest.creation = data.creation;
    quest.expiration = data.expiration;

    return structuredClone(quest);
  }

  public async deleteQuest(id: Id): Promise<boolean> {
    throw new Error('Not implemented');
  }

  private async imitateRequest(
    ms: number = 200,
    failureChance: number = 0.05,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
    if (Math.random() < failureChance) {
      throw new Error('Mock request failure');
    }
  }

  private findById<T extends QBoardNode>(
    collection: T[],
    id: Id,
    entityName: string,
  ): T {
    const found = collection.find((item) => item.id === id);
    if (!found) {
      throw new Error(`Unable to find ${entityName} with id: ${id}`);
    }

    return found;
  }

  private removeById<T extends QBoardNode>(
    collection: T[],
    id: Id,
    entityName: string,
  ): T {
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Unable to find ${entityName} with id: ${id}`);
    }

    const [deleted] = collection.splice(index, 1);
    if (!deleted) {
      throw new Error(`An error occurred while deleting ${entityName} with id: ${id}`);
    }

    return deleted;
  }

  private generateNewId(): Id {
    return crypto.randomUUID();
  }
}
