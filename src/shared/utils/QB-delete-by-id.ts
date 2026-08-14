import type { QBoardNode } from '@/app/pages/board-structure/types/board-pages.types.ts';
import type { Id } from '@/shared/types/common.types.ts';

export default function deleteById<T extends QBoardNode>(
  collection: T[],
  id: Id,
  entityName: string,
): T {
  const index = collection.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Unable to find ${entityName} with id: ${id}`);
  }

  const [deleted] = collection.splice(index, 1);
  if (!deleted) {
    throw new Error(
      `An error occurred while deleting ${entityName} with id: ${id}`,
    );
  }

  return deleted;
}
