export const PER_PAGE = 2;

export const paginate = <T>(items: T[], page: number, perPage: number): T[] =>
  items.slice((page - 1) * perPage, page * perPage);

export const totalPages = (total: number, perPage: number) =>
  Math.max(1, Math.ceil(total / perPage));