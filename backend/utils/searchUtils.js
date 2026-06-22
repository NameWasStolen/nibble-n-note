function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPaginationValues({ page, limit, defaultLimit = 20, maxLimit = 50 }) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const safePage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const safeLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, maxLimit) : defaultLimit;

    return {
        page: safePage,
        limit: safeLimit,
        skip: (safePage - 1) * safeLimit
    };
}

module.exports = {
    escapeRegExp,
    getPaginationValues
};