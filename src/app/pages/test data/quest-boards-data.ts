import type {
  QuestBoard,
  ToolbarAction,
} from '@/app/pages/quest-boards.config.ts';

// TODO: Подготовить директорию для моков и вынести файл туда

export const QUEST_BOARDS: QuestBoard[] = [
  {
    id: 0,
    title: 'Test board title',
    columns: [
      {
        id: 0,
        title: 'First column',
        importance: 'AOAOA',
      },
      {
        id: 1,
        title: 'Second column',
        importance: 'Daily',
        description: 'Quests repeat daily',
      },
      {
        id: 2,
        title: 'Third column',
        importance: 'Weekly',
        description: 'Quests that repeat every week',
      },
    ],
    quests: [
      {
        id: 0,
        columnId: 0,
        title: 'Super important quest',
        description: 'Idk',
        rewards: ['50 gold', '50 exp'],
        creation: { day: 9, month: 5, year: 2026 },
        expiration: { day: 19, month: 5, year: 2026 },
      },
      {
        id: 1,
        columnId: 0,
        title: 'Second',
        description: 'Just a second',
        rewards: ['505 gold', '9990 exp'],
        creation: { day: 9, month: 5, year: 2026 },
      },
      {
        id: 2,
        columnId: 0,
        title: 'Super easy quest',
        rewards: ['50 gold', '50 exp'],
        creation: { day: 9, month: 5, year: 2026 },
        expiration: { day: 19, month: 5, year: 2026 },
      },
      {
        id: 3,
        columnId: 1,
        title: 'Second column quest',
        description: 'Idk',
        rewards: ['9 gold', '23 exp'],
        creation: { day: 7, month: 9, year: 2026 },
        expiration: { day: 8, month: 9, year: 2026 },
      },
      {
        id: 4,
        columnId: 1,
        title: 'Quest?',
        description: 'No description',
        rewards: ['1 gold', '2 exp'],
      },
    ],
  },
];

export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    id: 0,
    name: 'add',
  },
  {
    id: 1,
    name: 'delete',
  },
  {
    id: 2,
    name: 'archive',
  },
  {
    id: 3,
    name: 'self destruction',
  },
];
