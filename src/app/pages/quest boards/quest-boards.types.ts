// TODO: Пройтись по названиям, подобрать более подходящие

export type DateKind = 'creation' | 'expiration';

export type TitleNode = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type DescriptionNode = 'p';

export type Id = number;

export type QBoardNode = QuestCard | QuestColumn | QuestBoard; // TODO: Возможно стоит убрать элиас, может быть он избыточен

// TODO: Поправить формат даты iso 8601. Попробовать привести к формату через new Date()
export type ISODate = string; // YYYY-MM-DD

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
  // TODO: Возможно добавить порядок столбца
}

export interface QuestCard extends QBBaseNode {
  columnId: Id;
  rewards: string[];
  creation?: ISODate;
  expiration?: ISODate;
}

// TODO: Убрать лишние поля
export interface ToolbarAction {
  id: Id;
  action: string;
  title?: string;
  description?: string;
}
