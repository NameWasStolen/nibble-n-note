const CONSENSUS_SOURCES = Object.freeze({
    AVERAGE: "entry_average",
    MANUAL: "manual"
})

const CONSENSUS_SOURCE_VALUES = Object.freeze(Object.values(CONSENSUS_SOURCES))

module.exports = {
    CONSENSUS_SOURCES,
    CONSENSUS_SOURCE_VALUES
}