type KindOfDate = 'creation' | 'expiration';

export type QBPageElement = QuestCard | QuestColumn | QuestBoard;

export interface Date {
  day: string;
  month: string;
  year: string;
}

interface QuestDate {
  kind: KindOfDate;
  date?: Date;
}

interface QBBaseElement {
  id: number;
  title?: string;
  description?: string;
}

interface QBElement<TChild extends QBPageElement> extends QBBaseElement {
  children: TChild[];
}

export interface QuestCard extends QBElement<never> {
  rewards: string[];
  dates: {
    creation: QuestDate;
    expiration: QuestDate;
  };
}

export interface QuestColumn extends QBElement<QuestCard> {
  importance: string;
  totalQuests?: number;
}

export interface QuestBoard extends QBElement<QuestColumn> {
  totalColumns?: number;
}

export interface ToolbarAction {
  id: number;
  name: string;
  title?: string;
  description?: string;
}
