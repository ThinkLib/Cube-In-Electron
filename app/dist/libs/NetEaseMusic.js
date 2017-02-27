var request = require("superagent"),
async = require("async"),
crypto = require("./Crypto"),
fm = require("./FileManager"),
PltM = require("./PlaylistModel"),
SongM = require("./SongModel"),
header = {
    Accept: "*/*",
    "Accept-Encoding": "gzip,deflate,sdch",
    "Accept-Language": "zh-CN,en-US;q=0.7,en;q=0.3",
    Connection: "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Host: "music.163.com",
    Referer: "http://music.163.com/",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:39.0) Gecko/20100101 Firefox/39.0"
},
httpRequest = function(t, e, i, r) {
    var o;
    o = "post" == t ? request.post(e).send(i) : request.get(e).query(i);
    var s = fm.getCookie();
    s && o.set("Cookie", s),
    o.set(header).timeout(1e4).end(r)
};
module.exports = {
    login: function(t, e, i) {
        var r, o = /^0\d{2,3}\d{7,8}$|^1[34578]\d{9}$/,
        s = {
            password: crypto.MD5(e),
            rememberLogin: "true"
        };
        o.test(t) ? (s.phone = t, r = "http://music.163.com/weapi/login/cellphone/") : (s.name = t, r = "http://music.163.com/weapi/login/");
        var n = crypto.aesRsaEncrypt(JSON.stringify(s));
        httpRequest("post", r, n,
        function(t, e) {
            if (t) return void i({
                msg: "[login]http error " + t,
                type: 1
            });
            var r = JSON.parse(e.text);
            200 != r.code ? i({
                msg: "[login]username or password incorrect",
                type: 0
            }) : (fm.setCookie(e.header["set-cookie"]), i(null, r.profile))
        })
    },
    getNet: function(t) {
        var e = this;
        this.userPlaylist(function(i, r) {
            return i ? void t(i) : void async.map(r,
            function(t, i) {
                e.playlistDetail(t.id,
                function(e, r) {
                    if (e) return void i(e);
                    var o = new PltM({
                        name: t.name,
                        type: "net",
                        songList: r
                    });
                    i(null, o)
                })
            },
            function(e, i) {
                e ? t(e) : t(null, i)
            })
        })
    },
    userProfile: function(t, e) {
        if (t = t || fm.getUserID()) {
            var i = "http://music.163.com/api/user/detail/" + t;
            httpRequest("get", i, {
                userId: t
            },
            function(t, i) {
                t ? e({
                    msg: "[userProfile]http error " + t,
                    type: 1
                }) : 200 != i.body.code ? e({
                    msg: "[userProfile]http code " + i.body.code,
                    type: 1
                }) : e(null, i.body.profile)
            })
        } else e({
            msg: "[userProfile]user not login",
            type: 0
        })
    },
    userPlaylist: function() {
        var t = [].slice.call(arguments),
        e = t.pop(),
        i = fm.getUserID();
        if (!i) return void e({
            msg: "[userPlaylist]user do not login",
            type: 0
        });
        var i = t[0] || i,
        r = t[1] || 0,
        o = t[2] || 100,
        s = "http://music.163.com/api/user/playlist/",
        n = {
            offset: r,
            limit: o,
            uid: i
        };
        httpRequest("get", s, n,
        function(t, i) {
            return t ? void e({
                msg: "[userPlaylist]http timeout",
                type: 1
            }) : void(200 != i.body.code ? e({
                msg: "[userPlaylist]http code " + n.code,
                type: 1
            }) : e(null, i.body.playlist))
        })
    },
    playlistDetail: function(t, e) {
        var i = "http://music.163.com/api/playlist/detail",
        r = {
            id: t
        },
        o = this;
        httpRequest("get", i, r,
        function(t, i) {
            t ? e({
                msg: "[playlistDetail]http timeout",
                type: 1
            }) : 200 != i.body.code ? e({
                msg: "[playlistDetail]http code " + r.code,
                type: 1
            }) : e(null, o.transfer(i.body.result.tracks))
        })
    },
    search: function() {
        var t = [].slice.call(arguments),
        e = t.pop(),
        i = t[0],
        r = t[1] || 1,
        o = t[2] || 0,
        s = t[3] || "true",
        n = t[4] || fm.getSearchLimit(),
        a = "http://music.163.com/api/search/get/web",
        c = {
            s: i,
            type: r,
            offset: o,
            total: s,
            limit: n
        },
        l = this;
        httpRequest("post", a, c,
        function(t, i) {
            if (t) return void e({
                msg: "[search]http error " + t,
                type: 1
            });
            var r = JSON.parse(i.text);
            if (200 != r.code) e({
                msg: "[search]http code " + r.code,
                type: 1
            });
            else {
                var o = r.result.songs,
                s = l.transfer(o);
                e(null, s)
            }
        })
    },
    transfer: function(t) {
        for (var e = [], i = [], r = {},
        o = 0; o < t.length; o++) {
            var s = t[o];
            i.push(s.id),
            r[s.id] = o;
            var n = {
                src: ""
            };
            n.id = s.id,
            n.title = s.name,
            n.album = s.album.name,
            n.artist = s.artists.map(function(t) {
                return t.name
            }).join(),
            e.push(new SongM(n))
        }
        var a = this;
        return process.nextTick(function() {
            for (var t = Math.ceil(i.length / 100), o = 0; t > o; o++) {
                var s = i.slice(100 * o, Math.min(100 * (o + 1), i.length));
                a.songsDetail(s,
                function(t, i) {
                    if (t) throw t.msg;
                    for (var o = 0; o < i.length; o++) {
                        var s = r[i[o].id];
                        e[s].src = i[o].mp3Url,
                        e[s].pic = i[o].album.picUrl
                    }
                })
            }
        }),
        e
    },
    songsDetail: function(t, e) {
        var i = "http://music.163.com/api/song/detail";
        httpRequest("get", i, {
            ids: "[" + t.join() + "]"
        },
        function(t, i) {
            if (t) return void e({
                msg: "[songsDetail]http error " + t,
                type: 1
            });
            var r = JSON.parse(i.text);
            200 != r.code ? e({
                msg: "[songsDetail]http code " + r.code,
                type: 1
            }) : e(null, r.songs)
        })
    },
    songDetail: function(t, e) {
        var i = "http://music.163.com/api/song/detail";
        httpRequest("get", i, {
            id: t,
            ids: "[" + t + "]"
        },
        function(t, i) {
            if (t) return void e({
                msg: "[songDetail]http error " + t,
                type: 1
            });
            var r = JSON.parse(i.text);
            200 != r.code ? e({
                msg: "[songDetail]http code " + r.code,
                type: 1
            }) : e(null, r)
        })
    },
    songLyric: function(t, e) {
        var i = "http://music.163.com/api/song/lyric";
        httpRequest("get", i, {
            os: "android",
            id: t,
            lv: -1,
            tv: -1
        },
        function(t, i) {
            if (t) return void e({
                msg: "[songLyric]http error " + t,
                type: 1
            });
            var r = JSON.parse(i.text);
            r.lrc ? e(null, r.lrc.lyric) : e({
                msg: "[songLyric]lrc do not exist",
                type: 0
            })
        })
    },
    radio: function(t) {
        var e = "http://music.163.com/api/radio/get";
        httpRequest("get", e, null,
        function(e, i) {
            if (e) return void t({
                msg: "[radio]http error " + e,
                type: 1
            });
            var r = JSON.parse(i.text);
            200 != r.code ? t({
                msg: "[radio]http code " + r.code,
                type: 1
            }) : t(null, r.data.map(function(t) {
                return new SongM({
                    id: t.id,
                    src: t.mp3Url,
                    pic: t.album.picUrl,
                    artist: t.artists.map(function(t) {
                        return t.name
                    }).join(),
                    album: t.album.name,
                    title: t.name
                })
            }))
        })
    }
};