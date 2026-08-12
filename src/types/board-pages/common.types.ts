// Строковый id для удобства сравнивания и поиска без приведений
export type Id = string;

// Разрешенные элементы заголовков
export type TitleNode = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// Разрешенные элементы описаний
export type DescriptionNode = 'p';

// TODO: Поправить формат даты iso 8601. Попробовать привести к формату через new Date()
// Дата в ISO 8601 формате
export type ISODate = string;

// Описание действия для кнопки в тулбаре
export interface ToolbarAction {
  id: Id;
  action: string;
}
