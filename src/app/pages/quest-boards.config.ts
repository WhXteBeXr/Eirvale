type Action = 'add' | 'remove' | 'archive';

export type ToolbarAction = {
  id: number;
  name: Action;
};

export const AVAILABLE_ACTIONS: ToolbarAction[] = [
  {
    id: 1,
    name: 'add',
  },
  {
    id: 2,
    name: 'remove',
  },
  {
    id: 3,
    name: 'archive',
  }
];

export interface QuestDate {
  day: string;
  month: string;
  year: string;
}

export interface QuestCard {
  id: number;
  title: string;
  description: string;
  rewards: string[];
  creationDate?: QuestDate;
  expiryDate?: QuestDate;
}

export interface QuestColumn {
  id: number;
  title: string;
  importance: string;
  listedQuests: QuestCard[];
  questsContained?: number;
}

export interface QuestBoard {
  id: number;
  title: string;
  questColumns: QuestColumn[];
} // TODO: Проверить стоит ли перенести типы в конфиг файл
