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

// Данные, возвращаемые методом каскадного удаления доски
export interface DeletedBoardData {
  board: QuestBoard;
  columnsIds: Id[];
  questIds: Id[];
}

// Данные, возвращаемые методом каскадного удаления колонки
export interface DeletedColumnData {
  column: QuestColumn;
  questIds: Id[];
}

// Данные, возвращаемые методом каскадного удаления квеста
export interface DeletedQuestData {
  quest: QuestCard;
}

/** Контракт мок класса для доски */
export interface IBoardApi {
  // create* методы получают неполные данные и возвращают
  // объект полностью заполненный сервером

  /** Получение всех сохраненных досок */
  getBoards(): Promise<QuestBoard[]>;

  /** Получение всех сохраненных колонок */
  getColumns(): Promise<QuestColumn[]>;

  /** Получение всех сохраненных карточек*/
  getQuests(): Promise<QuestCard[]>;

  /** Получение всех данных по одной конкретной доске*/
  getBoardData(id: Id): Promise<QBFullData>;

  /** Получение определенной доски по id*/
  getBoardById(id: Id): Promise<QuestBoard>;

  /** Создание доски на сервере */
  createBoard(data: QuestBoardDTO): Promise<QuestBoard>;

  /** Создание колонки доски на сервере */
  createColumn(data: QuestColumnDTO): Promise<QuestColumn>;

  /** Создание карточки квеста на сервере */
  createQuest(data: QuestCardDTO): Promise<QuestCard>;

  /** Обновление информации на доске */
  updateBoard(id: Id, data: QuestBoardDTO): Promise<QuestBoard>;

  /** Обновление информации колонки */
  updateColumn(id: Id, data: QuestColumnDTO): Promise<QuestColumn>;

  /** Обновление информации в карточке квеста */
  updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard>;

  /** Удаление доски */
  deleteBoard(id: Id): Promise<DeletedBoardData>;

  /** Удаление колонки */
  deleteColumn(id: Id): Promise<DeletedColumnData>;

  /** Удаление карточки квеста */
  deleteQuest(id: Id): Promise<DeletedQuestData>;
}
