import type { ISODate, Id } from '@/types/board-pages/common.types.ts';

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
export type QuestBoard = QBBaseNode;

// Неполные данные доски для передачи на сервер
export type QuestBoardDTO = Omit<QuestBoard, 'id'>;

// Данные колонки, получаемые от сервера
export interface QuestColumn extends QBBaseNode {
  boardId: Id;
  importance: string;
  // TODO: Возможно добавить порядок столбца
}

// Неполные данные колонки для передачи на сервер
export type QuestColumnDTO = Omit<QuestColumn, 'id'>;

// Данные карточки квеста, получаемые от сервера
export interface QuestCard extends QBBaseNode {
  columnId: Id;
  rewards: string[];
  creation?: ISODate;
  expiration?: ISODate;
}

// Неполные данные карточки для передачи на сервер
export type QuestCardDTO = Omit<QuestCard, 'id'>;
