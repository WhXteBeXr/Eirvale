import '@/app/styles/global.css';
import '@/app/styles/style.css';

import { QuestBoardPage } from '@/app/pages/quest boards/quest-boards.ts';
import {
  QUEST_BOARDS,
  TOOLBAR_ACTIONS,
} from '@/app/pages/test data/quest-boards-data.ts';

const pageContainer = document.getElementById(
  'content-container__page',
) as HTMLElement; // TODO: Создать контейнер раздела контента в HTML и передавать его вместо всего центрального блока

const questBoardsPage: QuestBoardPage = new QuestBoardPage(
  pageContainer,
  QUEST_BOARDS,
  TOOLBAR_ACTIONS
);

questBoardsPage.mount();
// questBoardsPage.unmount();
