import type { QBoardNode } from '@/app/pages/board-structure/types/board-pages.types.ts';
import type { Id } from '@/shared/types/common.types.ts';

export default function findById<T extends QBoardNode>(
  collection: T[],
  id: Id,
  entityName: string,
): T {
  const found = collection.find((item) => item.id === id);

  if (!found) {
    throw new Error(`Unable to find ${entityName} with id: ${id}`);
  }

  return found;
}
