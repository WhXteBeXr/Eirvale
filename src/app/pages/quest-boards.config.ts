// TODO: Пройтись по названиям, подобрать более подходящие

export type DateKind = 'creation' | 'expiration';

export type TitleNode = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type DescriptionNode = 'p';

export type Id = number;

export type QBoardNode = QuestCard | QuestColumn | QuestBoard;

export interface DateFormat {
  day: number;
  month: number;
  year: number;
  // TODO: Поправить формат даты iso 8601
}

// Общий базовый элемент блока доски
interface QBBaseNode {
  id: Id;
  title: string;
  description?: string;
}

export interface QuestBoard extends QBBaseNode {
  columns: QuestColumn[];
  quests: QuestCard[];
}

export interface QuestColumn extends QBBaseNode {
  importance: string;
  // TODO: Можно добавить порядок столбца
}

export interface QuestCard extends QBBaseNode {
  columnId: Id;
  rewards: string[];
  creation?: DateFormat;
  expiration?: DateFormat;
}

export interface ToolbarAction {
  id: number;
  name: string;
  title?: string;
  description?: string;
}
