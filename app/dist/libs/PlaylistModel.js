var model = function(t) {
    this.timestamp = t.timestamp,
    this.name = t.name,
    this.type = t.type,
    this.songList = t.songList || []
};
module.exports = model;