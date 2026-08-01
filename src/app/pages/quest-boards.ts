import { Page } from '@/app/pages/page.ts';
import type {
  QuestDate,
  QuestCard,
  QuestColumn,
  QuestBoard,
  QBElementInfo,
  ToolbarAction,
} from '@/app/pages/quest-boards.config.ts';

export class QuestBoardPage extends Page {
  constructor(
    mountContainer: HTMLElement,
    toolbarContainer: HTMLElement,
    toolbarActions: Array<ToolbarAction>,
  ) {
    super(mountContainer, toolbarContainer, toolbarActions);
  }

  protected createPageLayout(): HTMLElement {
    return undefined;
  }

  protected handleToolbarAction(button: HTMLButtonElement) {}

  private createElement<K extends keyof HTMLElementTagNameMap>(
    elementName: K,
    elementInfo: QBElementInfo,
  ): HTMLElement {
    const element: HTMLElement = document.createElement(elementName);
    element.classList.add(`quest-board__${elementInfo.className}`);
  }

  private insertData(): void {}

  private formatDate({ day, month, year }: QuestDate): string {}
}
