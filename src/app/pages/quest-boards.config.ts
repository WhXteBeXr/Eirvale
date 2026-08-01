export interface ToolbarAction {
  id: number;
  name: string;
  title?: string;
  description?: string;
}

export interface QuestDate {
  day: string;
  month: string;
  year: string;
}

export interface QuestCard {
  id: number;
  className: string;
  title: string;
  description: string;
  rewards: string[];
  creationDate?: QuestDate;
  expirationDate?: QuestDate;
}

export interface QuestColumn {
  id: number;
  className: string;
  title: string;
  importance: string;
  listedQuests: QuestCard[];
  totalQuests?: number;
}

export interface QuestBoard {
  id: number;
  className: string;
  title: string;
  questColumns: QuestColumn[];
}

export type QBElementInfo = QuestBoard | QuestColumn | QuestCard;
