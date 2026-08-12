import type {
  QuestBoard,
  ToolbarAction,
} from '@/types/board-pages/board-pages.types.ts';

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
      {
        id: 3,
        title: 'Fourth column',
        importance: 'ASF',
        description: 'Super duper quests',
      },
    ],
    quests: [
      {
        id: 0,
        columnId: 0,
        title: 'Super important quest',
        description: 'Idk',
        rewards: ['50 gold', '50 exp'],
        creation: '2026-5-9',
        expiration: '2026-5-19',
      },
      {
        id: 1,
        columnId: 0,
        title: 'Second',
        description: 'Just a second',
        rewards: ['505 gold', '9990 exp'],
        creation: '2026-5-9',
      },
      {
        id: 2,
        columnId: 0,
        title: 'Super easy quest',
        rewards: ['50 gold', '50 exp'],
        creation: '2026-5-9',
        expiration: '2026-5-19',
      },
      {
        id: 3,
        columnId: 1,
        title: 'Second column quest',
        description: 'Idk',
        rewards: ['9 gold', '23 exp'],
        creation: '2026-7-9',
        expiration: '2026-7-29',
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
  {
    id: 1,
    title: 'Second board',
    columns: [
      {
        id: 0,
        title: 'New column',
        importance: 'something there',
      },
      {
        id: 1,
        title: 'A lot of quests',
        importance: 'Not really important',
        description: 'Some description for column',
      },
      {
        id: 2,
        title: 'ABOBA quests',
        importance: 'Super',
        description: 'Rare ABOBA quests',
      },
    ],
    quests: [
      {
        id: 0,
        columnId: 0,
        title: 'Quest',
        description: 'Idk',
        rewards: ['16 gold', '21.1 exp'],
        creation: '2026-5-9',
        expiration: '2026-5-19',
      },
      {
        id: 1,
        columnId: 0,
        title: 'Second column',
        description: '???',
        rewards: ['321 gold', '9 exp'],
        creation: '2026-5-9',
      },
      {
        id: 2,
        columnId: 0,
        title: 'Not a super easy quest',
        rewards: ['16 gold', '53 exp'],
        creation: '2026-5-9',
        expiration: '2026-5-19',
      },
      {
        id: 3,
        columnId: 1,
        title: 'Second column quest',
        description: 'Idk',
        rewards: ['9 gold', '23 exp'],
        creation: '2026-9-7',
        expiration: '2026-9-8',
      },
      {
        id: 4,
        columnId: 1,
        title: 'Quest I guess',
        description: 'Description was there',
        rewards: ['1 gold', '20 exp'],
      },
    ],
  },
  {
    id: 2,
    title: 'Super-duper board',
    description: 'This is a mega board',
    columns: [
      {
        id: 0,
        title: 'Super column',
        importance: 'ULTRA',
        description: 'Contains super quests',
      },
    ],
    quests: [
      {
        id: 0,
        columnId: 0,
        title: 'MEGA quest!!!',
        description: 'Need to do MEGA things!',
        rewards: [],
      },
    ],
  },
];

export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    id: 0,
    action: 'add',
  },
  {
    id: 1,
    action: 'delete',
  },
  {
    id: 2,
    action: 'archive',
  },
  {
    id: 3,
    action: 'self destruction',
  },
];
