
/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// Ætti ekki að vera hér...
export const PAGE_SIZE = 50;

export async function pagingInfo({
  page, offset, totalEvents, eventsLength, baseUrl = '',
} = {}){
  return {
    page,
    total:totalEvents,
    totalPages: Math.ceil(totalEvents / PAGE_SIZE),
    first: offset === 0,
    last: eventsLength < PAGE_SIZE,
    hasPrev: offset > 0,
    hasNext: eventsLength === PAGE_SIZE,
    prevUrl: `${baseUrl}/?page=${page - 1}`,
    nextUrl: `${baseUrl}/?page=${page + 1}`,
  };
}


export function setPagenumber(page) {
  const num = Number(page);

  if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) {
    return 1;
  }

  return num;
}
