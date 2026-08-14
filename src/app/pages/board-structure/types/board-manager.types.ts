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
  DeletedBoardData,
  DeletedColumnData,
  DeletedQuestData,
} from '@/mocks/board-api.types.ts';

export interface IBoardManager {
  /** Загрузить и получить все доски с сервера */
  loadAllBoards(): Promise<QuestBoard[]>;

  /** Загрузить и получить все данные о доске */
  loadNewBoard(id: Id): Promise<QBFullData>;

  /** Создать на сервере новую доску */
  createBoard(data: QuestBoardDTO): Promise<QuestBoard>;

  /** Создать на сервере новую колонку */
  createColumn(data: QuestColumnDTO): Promise<QuestColumn>;

  /** Создать на сервере новую карточку квеста */
  createQuest(data: QuestCardDTO): Promise<QuestCard>;

  /** Обновить данные доски на сервере */
  updateBoard(id: Id, data: QuestBoardDTO): Promise<QuestBoard>;

  /** Обновить данные колонки на сервере */
  updateColumn(id: Id, data: QuestColumnDTO): Promise<QuestColumn>;

  /** Обновить данные карточки на сервере */
  updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard>;

  /** Удалить доску на сервере */
  deleteBoard(id: Id): Promise<DeletedBoardData>;

  /** Удалить колонку на сервере */
  deleteColumn(id: Id): Promise<DeletedColumnData>;

  /** Удалить карточку квеста на сервере */
  deleteQuest(id: Id): Promise<DeletedQuestData>;
}
