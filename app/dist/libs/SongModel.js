module.exports = function(t) {
    this.id = t.id,
    this.src = t.src,
    this.pic = t.pic || "",
    this.artist = t.artist || "未知",
    this.album = t.album || "未知",
    this.title = t.title || "未知"
};