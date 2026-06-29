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

/**
 * getTagIdsFromQuery
 * Converts a tagIds query param into a clean deduplicated array of string IDs.
 *
 * Handles comma-separated values, e.g. ?tagIds=abc,def
 */
function getTagIdsFromQuery(tagIds = null) {
    // No tag filter provided
    if (!tagIds) return [];

    // Express may provide query params as a string or array, so normalise to array
    const tagIdsArray = Array.isArray(tagIds) ? tagIds : [tagIds];

    // Support comma-separated values, e.g. "tag1,tag2,tag3"
    const rawTagIds = [];
    tagIdsArray.forEach((value) => {
        if (typeof value === 'string') {
            rawTagIds.push(...value.split(','));
        }
    });

    // Trim whitespace, remove empty values, and remove duplicates
    return [...new Set(rawTagIds.map((id) => id.trim()).filter(Boolean))];
}

module.exports = {
    escapeRegExp,
    getPaginationValues,
    getTagIdsFromQuery
};