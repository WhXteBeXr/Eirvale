import type { QuestBoard } from '@/app/pages/quest-boards.config.ts';

export const QUEST_BOARDS_DATA: [QuestBoard, QuestBoard] = [
  {
    id: 0,
    title: 'Test board title',
    questColumns: [
      {
        id: 0,
        title: 'First column',
        importance: 'Very!',
        listedQuests: [
          {
            id: 0,
            title: 'First quest!',
            description: "That's a very funny quest. I guess...",
            rewards: ['50 exp', '150 gold coins'],
          },
          {
            id: 1,
            title: 'Second quest!',
            description: "That's not a very funny quest!",
            rewards: ['150 exp', '350 gold coins'],
          },
          {
            id: 2,
            title: 'Third quest!',
            description: 'Simple quest!',
            rewards: ['10 exp', '5 gold coins'],
          },
        ],
      },
      {
        id: 1,
        title: 'Second column',
        importance: 'Very!',
        listedQuests: [
          {
            id: 3,
            title: 'First quest!',
            description: "That's a very funny quest. I guess...",
            rewards: ['50 exp', '150 gold coins'],
          },
          {
            id: 4,
            title: 'Second quest!',
            description: "That's not a very funny quest!",
            rewards: ['150 exp', '350 gold coins'],
          },
          {
            id: 5,
            title: 'Third quest!',
            description: 'Simple quest!',
            rewards: ['10 exp', '5 gold coins'],
          },
        ],
      },
    ],
  },
  {
    id: 1,
    title: 'Second board title',
    questColumns: [
      {
        id: 0,
        title: 'Aboba column',
        importance: 'Nah',
        listedQuests: [
          {
            id: 0,
            title: 'First quest!',
            description: "That's a very funny quest. I guess...",
            rewards: ['70 exp', '150 gold coins'],
          },
          {
            id: 1,
            title: 'Another quest!',
            description: "That's not a very cool one",
            rewards: ['150 exp', '350 gold coins'],
          },
          {
            id: 2,
            title: 'AAAA quest!',
            description: 'Not a SIMPLE quest!',
            rewards: ['1000 exp', '5000 gold coins'],
          },
        ],
      },
      {
        id: 1,
        title: 'Second column',
        importance: 'Very!',
        listedQuests: [
          {
            id: 3,
            title: 'Clowns!',
            description: "That's a very funny quest. I guess...",
            rewards: ['50 exp', '150 gold coins'],
          },
          {
            id: 4,
            title: 'HMMM...',
            description: "That's not a very funny quest!",
            rewards: ['150 exp', '350 gold coins'],
          },
          {
            id: 5,
            title: 'Third quest!',
            description: 'Simple quest!',
            rewards: ['1 exp', '512 gold coins'],
          },
        ],
      },
    ],
  },
];
