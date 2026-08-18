export type RealmId = 'haven' | 'town' | 'lands';

export const VALID_REALMS: RealmId[] = ['haven', 'town', 'lands'];
export const VALID_LAYERS: Record<RealmId, string[]> = {
  haven: [
    'quest-log',
    'diary',
    'inventory',
    'quest-board',
    'vantage',
    'hero',
    'archivist',
  ],
  town: ['guild-hall', 'tavern', 'herald'],
  lands: ['map', 'dungeons'],
}; // TODO: пересмотреть структуру объекта. Возможно прийти к виду RealmID
export const DEFAULT_REALM: RealmId = 'haven';
