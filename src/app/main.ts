import '@/app/styles/global.css';
import '@/app/styles/style.css';

import { QuestBoardsPage } from '@/app/pages/quest-boards.ts';
import { QUEST_BOARDS_DATA } from '@/app/pages/test data/quest-boards-data.ts';

const pageContainer = document.getElementById(
  'content-container',
) as HTMLElement;

const questBoardsPage: QuestBoardsPage = new QuestBoardsPage(
  pageContainer,
  QUEST_BOARDS_DATA[0],
);

questBoardsPage.mountPage();
questBoardsPage.switchBoard(QUEST_BOARDS_DATA[1])
// questBoardsPage.unmountPage()
