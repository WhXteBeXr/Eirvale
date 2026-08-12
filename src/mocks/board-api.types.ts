import type {
  QuestBoard,
  QuestColumn,
  QuestCard,
  QuestBoardDTO,
  QuestColumnDTO,
  QuestCardDTO,
} from '@/types/board-pages/board-pages.types.ts';
import type { Id } from '@/types/board-pages/common.types.ts';

/** Контракт мок класса для доски */
export interface BoardApi {
  // create* методы получают неполные данные и возвращают
  // объект полностью заполненный сервером

  /** Получение всех досок */
  getBoards(): Promise<QuestBoard[]>;

  /** Получение всех названий (заголовков) досок */
  getBoardTitles(): Promise<string[]>;

  /** Получение определенной доски по id*/
  getBoardById(id: Id): Promise<QuestBoard>;

  /** Создание доски на сервере */
  createBoard(data: QuestBoardDTO): Promise<QuestBoard>;

  /** Обновление информации на доске */
  updateBoard(id: Id, data: QuestBoardDTO): Promise<QuestBoard>;

  /** Удаление доски */
  deleteBoard(id: Id): Promise<boolean>;

  /** Создание колонки доски на сервере */
  createColumn(data: QuestColumnDTO): Promise<QuestColumn>;

  /** Обновление информации колонки */
  updateColumn(id: Id, data: QuestColumnDTO): Promise<QuestColumn>;

  /** Удаление колонки */
  deleteColumn(id: Id): Promise<boolean>;

  /** Создание карточки квеста на сервере */
  createQuest(data: QuestCardDTO): Promise<QuestCard>;

  /** Обновление информации в карточке квеста */
  updateQuest(id: Id, data: QuestCardDTO): Promise<QuestCard>;

  /** Удаление карточки квеста */
  deleteQuest(id: Id): Promise<boolean>;
}
