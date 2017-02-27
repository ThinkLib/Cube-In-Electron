function EntryModel(n) {
    this.mode = n.mode,
    this.name = n.name,
    this.loader = n.loader ||
    function(n) {
        n(null, null)
    },
    this.onadd = n.onadd ||
    function() {},
    this.onload = n.onload ||
    function() {
        return ! 0
    },
    this.onremove = n.onremove ||
    function() {}
}
module.exports = EntryModel;