/**
 * getAvgRating
 * Gets the average rating from restaurant review entries.
 * Does not include comments, only ratings.
 */
function getAvgRating(entries) {
    // Confirm array shape
    if (!Array.isArray(entries) || entries.length === 0) {
        return null;
    }

    // Confirm entries to calc from
    if (entries.length === 0) {
        return null;
    }

    // Sum ratings from entries
    const totals = entries.reduce(
        (acc, entry) => {
            acc.foodRating += entry.userRating.foodRating;
            acc.valueRating += entry.userRating.valueRating;
            acc.overallRating += entry.userRating.overallRating;
            return acc;
        },
        {
            foodRating: 0,
            valueRating: 0,
            overallRating: 0
        }
    );

    // Return averages, rounded to 2 dp
    return {
        foodRating: parseFloat((totals.foodRating / entries.length).toFixed(2)),
        valueRating: parseFloat((totals.valueRating / entries.length).toFixed(2)),
        overallRating: parseFloat((totals.overallRating / entries.length).toFixed(2))
    };
}

module.exports = {
    getAvgRating
};