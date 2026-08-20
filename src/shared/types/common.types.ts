// TODO: Удалить Id, заменить на string
// В качестве Id будет использоваться UUID v4
export type Id = string;

// Разрешенные элементы заголовков
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// Разрешенные элементы описаний
export type DescriptionTag = 'p';

// TODO: Поправить формат даты iso 8601. Попробовать привести к формату через new Date()
// Дата в ISO 8601 формате
// export type ISODate = `${string}-${string}-${string}`;
export type ISODate = string;

// Описание действия для кнопки в тулбаре
export interface ToolbarAction {
  id: string;
  name: string;
}
