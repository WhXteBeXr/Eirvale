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

/** Описание возможных событий менеджера */
export type ChangeEvent =
  | { type: 'boardListLoaded' }
  | { type: 'newBoardLoaded'; element: QBFullData }
  | { type: 'boardCreated'; element: QuestBoard }
  | { type: 'boardUpdated'; element: QuestBoard }
  | { type: 'boardDeleted'; element: QuestBoard }
  | { type: 'columnCreated'; element: QuestColumn }
  | { type: 'columnUpdated'; element: QuestColumn }
  | { type: 'columnDeleted'; element: QuestColumn }
  | { type: 'questCreated'; element: QuestCard }
  | { type: 'questUpdated'; element: QuestCard }
  | { type: 'questDeleted'; element: QuestCard };

export interface IBoardManager {
  /** Подписка на изменения данных в менеджере */
  subscribe(listener: (event: ChangeEvent) => void): () => void;

  /** Загрузить и получить все доски с сервера */
  loadAllBoards(): Promise<QuestBoard[]>;

  /** Загрузить и получить все данные о доске */
  loadNewBoard(id: Id): Promise<QBFullData>;

  /** Проверка загружена ли доска */
  isBoardLoaded(): boolean;

  /** Получение массива загруженных досок */
  getAllLoadedBoards(): QuestBoard[];

  /** Получение данных загруженной доски */
  getLoadedBoard(): QBFullData;

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
