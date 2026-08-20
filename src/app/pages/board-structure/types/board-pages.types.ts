import type { ISODate, Id } from '@/shared/types/common.types.ts';

export type ParentName = 'quest' | 'column' | 'board';

// TODO: Пройтись по названиям, подобрать более подходящие

// Ключи (род даты) для поиска в QuestCard
export type DateKind = 'creation' | 'expiration';

// TODO: Возможно стоит убрать алиас, может быть он избыточен
export type QBoardNode = QuestCard | QuestColumn | QuestBoard;

// Общий базовый элемент блока доски
interface QBBaseNode {
  id: Id;
  title: string;
  description?: string;
}

// Данные доски, получаемые от сервера
export interface QuestBoard extends QBBaseNode {}

// Данные колонки, получаемые от сервера
export interface QuestColumn extends QBBaseNode {
  boardId: Id;
  importance: string;
  // TODO: Возможно добавить порядок столбца
}

// Данные карточки квеста, получаемые от сервера
export interface QuestCard extends QBBaseNode {
  columnId: Id;
  rewards: string[];
  creation?: ISODate;
  expiration?: ISODate;
}

// Все данные связанные с одной доской
export type QBFullData = {
  board: QuestBoard;
  columns: QuestColumn[];
  quests: QuestCard[];
};

// Неполные данные доски для передачи на сервер
export type QuestBoardDTO = Omit<QuestBoard, 'id'>;

// Неполные данные колонки для передачи на сервер
export type QuestColumnDTO = Omit<QuestColumn, 'id'>;

// Неполные данные карточки для передачи на сервер
export type QuestCardDTO = Omit<QuestCard, 'id'>;
