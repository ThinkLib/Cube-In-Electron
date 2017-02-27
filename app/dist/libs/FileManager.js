function pack(e) {
    return utils.isArray(e) ? e = e.map(function(e) {
        var n = new PltM(e);
        return n.songList = n.songList.map(function(e) {
            return new SongM(e)
        }),
        n
    }) : []
}
var fs = require("fs"),
utils = require("./Utils"),
PltM = require("./PlaylistModel"),
SongM = require("./SongModel"),
process = require("process"),
path = require("path"),
home = require("home");
const EXTS = [".mp3", ".ogg", ".wav"],   // 读取的音乐格式
DEFAULTMUSICDIR = function() {
    return 'D:\\KuGou\\output'      // 设置默认的 music 路径
    /*
    for (var e = ["音乐", "Music", "music"].map(function(e) {
        return home.resolve("~/" + e)
    }), n = 0; n < e.length; n++) {
        try {
            var t = fs.statSync(e[n])
        } catch(i) {
            continue
        }
        if (t && t.isDirectory()) return e[n]
    }
    return e[0]    */

} (),
DEFAULTSEARCHLIMIT = 20;
var config = {
    key: "config",
    content: {},
    isChanged: 0
},
scheme = {
    isChanged: 0,
    key: "scheme",
    content: [],
    indexOf: function(e) {
        return utils.binarySearch(this.content, e.timestamp,
        function(e) {
            return e.timestamp
        })
    }
},
fm = {};
config.content = JSON.parse(storage.getItem(config.key)) || {},
module.exports = fm,
fm.saveChanges = function() { [config, scheme].forEach(function(e) {
        e.isChanged && storage.setItem(e.key, JSON.stringify(e.content))
    })
},
fm.setMusicDir = function(e) {
    return this.getMusicDir() !== e ? (config.content.musicDir = e, config.isChanged = 1, !0) : !1
},
fm.getMusicDir = function() {
    // config.content.musicDir 为 undefined  所以返回的是DEFAULTMUSICDIR
    // DEFAULTMUSICDIR 为 D:\Users\wb.zengluqiang\音乐
    return config.content.musicDir || DEFAULTMUSICDIR
},
fm.getSearchLimit = function() {
    return config.content.searchLimit || DEFAULTSEARCHLIMIT
},
fm.setSearchLimit = function(e) {
    "number" == typeof e && e >= 0 && (config.content.searchLimit = e, config.isChanged = 1)
},
fm.getLocal = function(e) {
    var n = this;
    process.nextTick(function() {
        var t = n.loadMusicDirSync();
        utils.isString(t) ? e(t) : e(null, pack([{
            timestamp: 0,
            name: n.getMusicDir(),
            songList: t,
            type: "local"
        }]))
    })
},
fm.loadMusicDirSync = function(e) {
    var e = e || this.getMusicDir(),
    n = [],
    t = [];
    try {
        t = fs.readdirSync(e)
    } catch(i) {
        try {
            fs.mkdirSync(e)
        } catch(i) {
            return {
                msg: "[loadMusicDir]failed to read or create dir, please try another one.",
                type: 1
            }
        }
    }
    var c = this;
    t = t.map(function(n) {
        return path.join(e, n)
    }).filter(function(e) {
        var t = fs.statSync(e);
        if (t && t.isDirectory()) return n = n.concat(c.loadMusicDirSync(e)),
        !1;
        for (var i = path.extname(e), o = 0; o < EXTS.length; o++) if (i == EXTS[o]) return ! 0;
        return ! 1
    });
    for (var o = 0; o < t.length; o++) {
        var r = t[o],
        s = {
            title: path.basename(r, r.substr(r.lastIndexOf("."))),
            artist: "",
            album: "",
            src: r
        };
        n.push(s)
    }
    return n
},
fm.loadScheme = function(e) {
    process.nextTick(function() {
        scheme.content = JSON.parse(storage.getItem(scheme.key)) || [],
        scheme.isChanged = 1,
        e(null, pack(scheme.content))
    })
},
fm.getScheme = function(e) {
    return 0 == scheme.isChanged ? void this.loadScheme(function(n, t) {
        n ? e(n) : (scheme.content = t, e(null, t))
    }) : void e(null, scheme.content)
},
fm.addScheme = function(e) {
    return e instanceof PltM ? (scheme.isChanged = 1, void scheme.content.push(e)) : void console.log("AddScheme failed")
},
fm.setScheme = function(e) {
    if (! (e instanceof PltM)) return void console.log("SetScheme failed");
    scheme.isChanged = 1;
    var n = scheme.indexOf(e); - 1 != n && (scheme.content[n] = e)
},
fm.delScheme = function(e) {
    if (! (e instanceof PltM)) return void console.log("DelScheme failed");
    scheme.isChanged = 1;
    var n = scheme.indexOf(e);
    console.log(n),
    -1 != n ? scheme.content.splice(n, 1) : console.log("SetScheme failed")
},
fm.setCookie = function(e) {
    config.content.cookie = e,
    config.isChanged = 1
},
fm.getCookie = function() {
    return config.content.cookie
},
fm.getUserID = function() {
    if (!config.content.cookie) return null;
    var e = /\d+/.exec(config.content.cookie[3]);
    return e ? e[0] : null
};