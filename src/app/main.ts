import '@/app/styles/global.css';
import '@/app/styles/style.css';

import { QuestBoardPage } from '@/app/pages/board-structure/quest-boards/quest-boards.ts';
import { BoardManager } from '@/app/pages/services/managers/board-manager.ts';
import boardApiMock from '@/mocks/board-api.mock.ts';

const pageContainer = document.getElementById(
  'content-container__page',
) as HTMLElement; // TODO: Создать контейнер раздела контента в HTML и передавать его вместо всего центрального блока

const manager = new BoardManager(boardApiMock);

const questBoardsPage: QuestBoardPage = new QuestBoardPage(
  manager,
  pageContainer,
);

questBoardsPage.mount();
// questBoardsPage.unmount();
