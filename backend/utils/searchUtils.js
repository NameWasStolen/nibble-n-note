/**
 * Escapes special regular expression characters in a string.
 *
 * This allows user search input to be safely used inside a MongoDB regex
 * without characters like ".", "*", "?", or "(" being treated as regex syntax.
 */
function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalises pagination query values.
 *
 * Converts page and limit from query-string values into safe numbers,
 * applies sensible defaults, caps the maximum limit, and calculates
 * the number of documents to skip for database pagination.
 */
function getPaginationValues({ page, limit, defaultLimit = 20, maxLimit = 50, maxPage = 1000 }) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const safeDefaultLimit = Math.min(defaultLimit, maxLimit);

    // Defaults to page 1 if page is missing, invalid, or less than 1
    const safePage = Number.isSafeInteger(parsedPage)  && parsedPage  > 0
        ? Math.min(parsedPage, maxPage)
        : 1;

    // Default item limit if missing / invalid, and cap to prevent excessive query size
    const safeLimit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, maxLimit)
        : safeDefaultLimit;

    return {
        page:  safePage,
        limit: safeLimit,
        skip:  (safePage - 1) * safeLimit,
    };
}

module.exports = {
    escapeRegExp,
    getPaginationValues
};