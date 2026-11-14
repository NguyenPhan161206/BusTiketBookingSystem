/**
 * Phân trang server-side cho Knex query (dùng được cho cả SSR và AJAX).
 *
 *   const { paginate, parsePageParams } = require('../../../utils/paginate');
 *   const { page, perPage } = parsePageParams(req.query);
 *   const result = await paginate(db('news').where({ status: 'published' }).orderBy('id', 'desc'), {
 *     page,
 *     perPage,
 *   });
 *   res.render('catalog/news/list', { news: result.data, pagination: result.pagination });
 *   // view: {{> pagination pagination=pagination}}
 *
 * Lưu ý: query có GROUP BY/DISTINCT thì tự đếm tổng và dùng buildPagination().
 */
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

function parsePageParams(query = {}, defaultPerPage = DEFAULT_PER_PAGE) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number.parseInt(query.perPage, 10) || defaultPerPage),
  );
  return { page, perPage };
}

function buildPagination(total, page, perPage) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return {
    page,
    perPage,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}

async function paginate(query, { page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
  const countRow = await query.clone().clearSelect().clearOrder().count({ total: '*' }).first();
  const total = Number(countRow ? countRow.total : 0);
  const data = await query
    .clone()
    .limit(perPage)
    .offset((page - 1) * perPage);
  return { data, pagination: buildPagination(total, page, perPage) };
}

module.exports = { paginate, parsePageParams, buildPagination, DEFAULT_PER_PAGE };
