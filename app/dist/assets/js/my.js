function Category() {
    this.$ = {
        sidebar: $("#sidebar"),
        entry: $("#entry"),
        uls: function(t) {
            return t ? this.entry.find("#__" + t).find("ul") : this.entry.find("ul")
        },
        lis: function(t) {
            return t ? this.entry.find("#__" + t).find("li") : this.entry.find("li")
        },
        totSong: $("#totsong"),
        totlist: $("#totlist"),
        refresh: $("#refresh"),
        addlist: $("#addlist"),
        table: $("table")
    },
    this.isOpen = !0,
    this.domCache = [],
    this.loadQue = new utils.queue,
    this.listen(this),
    this.addEvents()
}


var Account = function() {
    this.$ = {
        userProfile: $("#user-profile"),
        login: $("#login"),
        submit: $("#login").find("button.submit"),
        label: $("#login").find("label"),
        phone: $("#login").find('input[name="phone"]'),
        password: $("#login").find('input[name="password"]')
    },
    this.listen(this)
};

Account.prototype = {
    loadUser: function(t) {
        t = t || fm.getUserID();
        var i = this;
        t ? api.userProfile(t,
        function(t, e) {
            t ? (errorHandle(t), i.setUserProfile()) : i.setUserProfile(e)
        }) : i.setUserProfile()
    },
    unsign: function() {
        fm.setCookie(null),
        this.setUserProfile(),
        category.loadPlaylists({
            net: !0
        })
    },
    showlogin: function() {
        this.$.label.hide(),
        this.$.login.modal("show"),
        this.$.phone.focus()
    },
    loginErr: function(t) {
        this.$.label.text(t),
        this.$.label.show()
    },
    loginSuccess: function(t) {
        this.$.label.text(""),
        this.$.login.modal("hide"),
        this.setUserProfile(t),
        category.loadPlaylists({
            net: !0
        })
    },
    setUserProfile: function(t) {
        t = t || {
            nickname: "未登录",
            avatarUrl: ""
        },
        nav.setMenu(t.nickname, t.avatarUrl)
    },
    listen: function(t) {
        this.$.submit.click(function() {
            var i = $(this).button("loading"),
            e = t.$.phone.val(),
            s = t.$.password.val();
            api.login(e, s,
            function(e, s) {
                e ? (errorHandle(e), t.loginErr(e.msg)) : t.loginSuccess(s),
                i.button("reset")
            })
        }),

        this.$.phone.keydown(function(i) {
            13 == i.which && t.$.password.focus()
        }),
        this.$.password.keydown(function(i) {
            13 == i.which && t.$.submit.trigger("click")
        })
    }
};

var loading = !1,
loadSize = 0;
Category.prototype = {
    //加载本地文件  第1056行{local: !0}   第66行{net: !0} 此时i为undefined
    // Object {local: true} 和 undefined
    loadPlaylists: function(t, i) {
        //console.log(t);
        //console.log(i);

        function e(t, i) {
            if (t) errorHandle(t);
            else if (utils.isArray(i)) {
                var e = a.plts.length;
                a.plts = a.plts.concat(i);
                for (var s = 0; s < i.length; s++) a.addItem(e + s)
            } else errorHandle("the source doesn't return an Array!");
            Event.emit("entryLoad")
        }

        // loading 为 true  返回了undefined   
        // 另外备注：if(undefined) 是为 false 的
        //loading = false;
        if (loading) return void this.loadQue.push([t, i]);

        i && (this.$plts = {},
        this.plts = [], this.pLength = 0, this.$.entry.empty(), this.$.table.children("tbody").remove(), player.stop(), Event.once("setActive",
        function() {
            this.setActive()
        },
        this));

        var s = entry.schema;

        if (!t) {
            t = {};
            for (var n in s) s.hasOwnProperty(n) && (t[n] = !0)
        }

        loadSize = 0;
        var a = this;
        for (var n in t) t.hasOwnProperty(n) && t[n] && (loadSize++, this.add$EntryFrame(n, s[n].name));
        
        if (loadSize) {
            this.$.refresh.addClass("loading"),
            loading = !0;   // 设置true
            for (var n in t) if (t.hasOwnProperty(n) && t[n]) {
                var r = s[n].loader;
                utils.isFunction(r) && r(e)
            }
        }

    },


    add$EntryFrame: function(t, i) {
        var e = this.$.entry.find("#__" + t);
        if (e.length) {
            var s = this;
            return e.find("li").each(function() {
                s.removeItem($(this))
            }),
            void e.slideUp(600)
        }
        var n = createDOM("div", {
            "class": "plts-group",
            id: "__" + t,
            style: "display:none"
        });
        n.appendChild(createDOM("div", {
            "class": "plts-title"
        },
        i)),
        n.appendChild(createDOM("ul", {
            "class": "nav nav-sidebar"
        })),
        Sortable.create(this.$.entry[0].appendChild(n).getElementsByTagName("ul")[0])
    },
    findPltIndexByTs: function(t) {
        return utils.binarySearch(this.plts, t,
        function(t) {
            return t.timestamp
        })
    },
    addItem: function(t, i) {
        var e = t,
        s = t;
        utils.isNumber(t) && t >= 0 && t < this.plts.length ? e = this.plts[t] : (s = this.plts.length, this.plts.push(e), entry.schema[e.type].onadd(e));
        var n = e.timestamp;
        utils.isUndefined(n) && (n = e.timestamp = (new Date).getTime());
        var a = createDOM("li", {
            "data-target": n
        }),
        r = createDOM("a", {
            title: e.name,
            href: "javascript:void(0)"
        }),
        l = createDOM("div", {
            "class": "name"
        },
        e.name),
        o = createDOM("div", {
            "class": "limark"
        }),
        h = createDOM("tbody", {
            style: "display:none",
            id: "_" + n
        });
        entry.getMode(e.type, 1) && o.appendChild(createDOM("span", {
            "class": "glyphicon glyphicon-trash"
        })),
        o.appendChild(createDOM("span", {
            "class": "badge"
        },
        e.songList.length)),
        a.appendChild(r),
        r.appendChild(l),
        r.appendChild(o),
        this.domCache.push({
            type: e.type,
            dom: a
        }),
        this.pLength++,
        this.$.table.append(h),
        this.$plts[n] = new Playlist(h, s),
        i && (this.addtoDOM(), this.setActive($(a)))
    },
    getActive: function() {
        return this.$.entry.find("li.active")
    },
    setActive: function(t) {
        if (t = t || this.$.lis().eq(0), 0 != t.length) {
            var i = this.getActive();
            i != t && (i.length && (i.removeClass("active"), this.$plts[i.data("target")].hide()), t.addClass("active"), this.$plts[t.data("target")].show())
        }
    },
    removeItem: function(t) {
        var i = this.$plts[t.data("target")],
        e = this;
        t.slideUp(600,
        function() {
            t.remove(),
            t.hasClass("active") && e.setActive(),
            i.$.frame.remove()
        }),
        i == player.playlist && player.stop();
        var s = this.findPltIndexByTs(i.timestamp); - 1 != s && (entry.schema[this.plts[s].type].onremove(this.plts[s]), this.plts.splice(s, 1)),
        delete i,
        this.pLength--
    },
    toggleOpen: function() {
        var t = $(".list"),
        i = category.$.sidebar;
        this.isOpen ? (t.animate({
            "padding-left": "0px"
        },
        600), i.animate({
            right: "100%"
        },
        600)) : (i.animate({
            right: "75%"
        },
        600), t.animate({
            "padding-left": "25%"
        },
        600)),
        this.isOpen ^= 1
    },
    listen: function(t) {
        this.$.entry.on("click", "li",
        function() {
            t.setActive($(this))
        }),
        this.$.entry.on("click", "li span.glyphicon-trash",
        function(i) {
            var e = $(this).closest("li");
            t.removeItem(e),
            i.stopPropagation()
        }),
        this.$.refresh.click(function() {
            t.loadPlaylists(null, !0)
        });
        var i = $("#inputListName"),
        e = $("#inputListName input"),
        s = $("#submit-name");
        this.$.addlist.click(function() {
            i.find("label").hide(),
            i.removeClass("has-error"),
            i.modal("show"),
            e.focus()
        }),
        s.click(function() {
            var s = e.val().trim(),
            n = !0;
            if ("" == s ? n = !1 : t.$.lis().find("div.name").each(function() {
                $(this).text() == s && (n = !1)
            }), n) {
                i.modal("hide");
                var a = new PltM({
                    name: s,
                    type: "user"
                });
                t.addItem(a, !0)
            } else i.find("label").fadeIn(),
            i.addClass("has-error")
        }),
        e.keydown(function(t) {
            13 == t.which && (t.preventDefault(), s.trigger("click"))
        })
    },
    addtoDOM: function() {
        if (0 != this.domCache.length) {
            var t = {},
            i = this;
            this.domCache.forEach(function(e) {
                if (!t[e.type]) {
                    var s = i.$.entry.find("#__" + e.type);
                    s.slideDown(600),
                    t[e.type] = s.find("ul")
                }
                e.dom.style.display = "none",
                t[e.type][0].appendChild(e.dom),
                $(e.dom).slideDown(600)
            }),
            this.domCache = [],
            Event.emit("setActive")
        }
    },
    addEvents: function() {
        var t = 0;
        Event.on("entryLoad",
        function() {
            if (t++, this.addtoDOM(), t == loadSize && (t = 0, loading = !1, this.$.refresh.removeClass("loading"), this.plts.length > 1 && (this.plts = this.plts.sort(function(t, i) {
                return t.timestamp - i.timestamp
            })), !this.loadQue.empty())) {
                console.log("load task in queue");
                var i = this.loadQue.front();
                this.loadQue.pop(),
                utils.isArray(i) && this.loadPlaylists.apply(this, i)
            }
        },
        this),
        Event.on("rfshBadge",
        function() {
            for (var t = this.$.lis().find(".badge"), i = 0; i < this.pLength; i++) {
                var e = t.eq(i),
                s = e.closest("li").data("target");
                t.eq(i).text(this.$plts[s].length)
            }
        },
        this)
    }
};


var Lrc = function() {
    this.$ = {
        panel: $(".song-detail"),
        lyric: $(".lyric"),
        ulDOM: $(".lyric ul")[0],
        pic: $(".song-detail img"),
        title: $("#info-title"),
        album: $("#info-album"),
        artist: $("#info-artist")
    },
    this.delay = {
        time: 3e3,
        id: null
    },
    this.state = !1,
    this.listen()
};


Lrc.prototype = {
    toggle: function(t) {
        if (t !== this.state) if (t = t || !this.state) this.$.panel.css("transform", "none"),
        this.state = !0;
        else {
            if (1 == nav.ID) return;
            this.$.panel.css("transform", "scale(0,0)"),
            this.state = !1
        }
    },
    scroll: function(t) {
        var i = 0,
        e = this.$.ulDOM.style.marginTop,
        s = Number(e.substr(0, e.length - 2));
        t > 0 && 0 > s && (i = Math.min(this.$.lyric[0].offsetHeight >> 1, -s));
        var n = -this.$.ulDOM.offsetHeight + 20;
        if (0 > t && s > n && (i = Math.max( - this.$.lyric[0].offsetHeight >> 1, n - s)), i) {
            this.$.ulDOM.style.marginTop = s + i + "px";
            var a = this;
            player.playing && (null !== this.delay.id && clearTimeout(this.delay.id), this.delay.id = setTimeout(function() {
                a.delay.id = null,
                a.autoScroll()
            },
            this.delay.time))
        }
    },
    setDesc: function(t) {
        this.$.pic.attr("src", t.pic || ""),
        this.$.title.text(t.title),
        this.$.album.text(t.album),
        this.$.artist.text(t.artist)
    },
    setLrc: function(t) {
        if (this.$.ulDOM.innerHTML = "", this.$.ulDOM.style.marginTop = 0, this.$.liDOM = [], this.lrcObj) if (this.lrcObj.noTime) {
            this.appendline("****歌词无法滚动****");
            for (var i = 0; i < this.lrcObj.txt.length; i++) this.appendline(this.lrcObj.txt[i])
        } else for (var i = 0; i < this.lrcObj.lines.length; i++) this.appendline(this.lrcObj.lines[i].txt);
        else t = t || "****没有歌词****",
        this.appendline(t)
    },
    load: function(t) {
        if (this.setDesc(t), this.lrcObj = null, this._index = -1, t.id) {
            var i = this;
            api.songLyric(t.id,
            function(t, e) {
                t || (i.lrcObj = new i.parse(e)),
                i.setLrc()
            })
        } else this.setLrc()
    },
    appendline: function(t) {
        var i = createDOM("li", null, t);
        this.$.liDOM.push(i),
        this.$.ulDOM.appendChild(i)
    },
    autoScroll: function(t) {
        if (null === this.delay.id) if ( - 1 != this._index || t) {
            t = t || this.$.liDOM[this._index];
            var i = t.offsetTop,
            e = this.$.lyric[0].offsetHeight >> 2;
            this.$.ulDOM.style.marginTop = i > e ? e - i + "px": 0
        } else this.$.ulDOM.style.marginTop = 0
    },
    seek: function(t) {
        if (this.state && this.lrcObj && !this.lrcObj.noTime) {
            var i = utils.binarySearch(this.lrcObj.lines, t,
            function(t) {
                return t.time
            }); - 1 != i ? this._index !== i && (this._index >= 0 && (this.$.liDOM[this._index].className = ""), this.$.liDOM[i].className = "current", this._index = i, this.autoScroll()) : this.autoScroll()
        }
    },
    parse: function() {
        var t = /\[(\d{2,})\:(\d{2})(?:\.(\d{2,3}))?\]/g,
        i = {
            title: "ti",
            artist: "ar",
            album: "al",
            offset: "offset",
            by: "by"
        },
        e = function(t) {
            return t && t.replace(/(^\s*|\s*$)/m, "")
        },
        s = function(i) {
            return t.test(i)
        };
        return function(n) {
            if (!utils.isString(n)) return void console.log("invalid param");
            this.lrc = e(n);
            var a = n.split(/\n/);
            if (!s(this.lrc)) return this.noTime = 1,
            void(this.txt = a);
            this.tags = {},
            this.lines = [];
            var r, l, o, h;
            for (var c in i) r = n.match(new RegExp("\\[" + i[c] + ":([^\\]]*)\\]", "i")),
            this.tags[c] = r && r[1] || "";
            t.lastIndex = 0;
            for (var d = 0,
            u = a.length; u > d; d++) for (; o = t.exec(a[d]);) h = t.lastIndex,
            l = e(a[d].replace(t, "")),
            t.lastIndex = h,
            this.lines.push({
                time: 60 * o[1] + 1 * o[2] + (o[3] || 0) / 1e3,
                originLineNum: d,
                txt: l
            });
            this.lines.sort(function(t, i) {
                return t.time - i.time
            })
        }
    } (),
    listen: function() {}
};


var tabName = ["#main", "#radio", "#settings"],
Nav = function() {
    this.ID = 0,
    this.$ = {
        tabBody: tabName.map(function(t) {
            return $(t)
        }),
        tabHead: tabName.map(function(t) {
            return $(t + "-nav")
        }),
        search: $("#search"),
        UserImg: $("#user-profile img"),
        UserTxt: $("#user-profile p"),
        MenuItem0: $("#menugo-0"),
        MenuItem1: $("#menugo-1")
    },
    this.WinMode = {
        isSimp: 0,
        width: null,
        height: null
    },
    this.listen(this)
};


Nav.prototype = {
    setState: function(t) {
        if (t = t || 0, t != this.ID) {
            var i = this;
            this.$.tabBody[this.ID].fadeOut(100,
            function() {
                i.$.tabBody[t].fadeIn(100)
            }),
            $([this.$.tabHead[this.ID], this.$.tabHead[t]]).toggleClass("active"),
            this.ID = t,
            1 == t ? radio.show() : lrc.toggle(!1)
        }
    },
    search: function() {
        var t = this.$.search.val();
        //console.log(t);
        api.search(t,
        function(i, e) {
            if (i) throw "search api returns an error:" + i;
            var s = '"' + t + '"的搜索结果',
            n = e;   //歌词列表数组，
            /*
            例如：n[0]
                0:module.exports
                album:"红日"
                artist:"李克勤"
                id:115502
                pic:"http://p3.music.126.net/4TYHavK0-_I5xP56S-mZMw==/86861418607019.jpg"
                src:"http://m2.music.126.net/6sy9HG0ff9olc-xb5MAxzw==/7958265163415748.mp3"
                title:"红日"
            */
            //console.log(n);
            category.addItem(new PltM({
                name: s,
                type: "user",
                songList: n
            }), !0)
            //console.log(category);

        })
    },
    close: function() {
        win.hide(),
        console.log("save the config changes..."),
        fm.SaveChanges(category.recKey, category.plts,
        function(t) {
            t ? console.log("save failed", t) : console.log("saved"),
            win.close(!0)
        })
    },
    minimize: function() {
        win.minimize()
    },
    maximize: function() {
        this.WinMode.isMaxi ? win.unmaximize() : win.maximize(),
        this.WinMode.isMaxi ^= 1
    },
    toggleWindow: function(t) {
        t || this.WinMode.isSimp ? win.resizeTo(this.WinMode.width, this.WinMode.height) : (win.unmaximize(), this.WinMode.width = win.width, this.WinMode.height = win.height, win.resizeTo(560, 60)),
        this.WinMode.isSimp ^= 1
    },
    setMenu: function(t, i) {
        i ? (this.$.MenuItem0.hide(), this.$.MenuItem1.show()) : (this.$.MenuItem1.hide(), this.$.MenuItem0.show()),
        this.$.UserImg.attr("src", i),
        this.$.UserTxt.text(t)
    },
    clickMenu: function(t) {
        0 == t ? account.showlogin() : account.unsign()
    },
    listen: function(t) {
        $(this.$.search).keydown(function(i) {
            13 == i.which && (i.preventDefault(), t.search())
        })
    }
};

var Player = function() {
    this.$ = {
        play: $("#play"),
        pause: $("#pause"),
        order: $("#order span"),
        backward: $("#backward"),
        volume: $("#volume"),
        volIcon: $("#vol-icon"),
        songPic: $("#song-pic"),
        totTime: $("#tot-time"),
        curTime: $("#cur-time"),
        title: $("h4.media-heading"),
        progress: $(".media-body input")
    },
    this.audio = new Audio,
    this.progress = this.$.progress.slider({
        id: "progress",
        value: 0,
        min: 0,
        max: 0,
        step: 1,
        formatter: this.timeFormartter
    }),
    this.playling = !1,
    this.volume = this.$.volume.slider({
        value: .5,
        min: 0,
        max: 1,
        step: .01
    }),
    this.ID = 1,
    this.stop(),
    this.duration = -1,
    this.setOrder(this.ID),
    this.setVolume(.5),
    this.listen()
};

//播放功能的函数属性
Player.prototype = {
    orderList: [{
        name: "单曲循环",
        value: "repeat"
    },
    {
        name: "列表循环",
        value: "refresh"
    },
    {
        name: "顺序播放",
        value: "align-justify"
    },
    {
        name: "随机播放",
        value: "random"
    }],

    play: function(t) { 
        //document.getElementById("testAudio").innerHTML= this.audio;
        // t的值为：-1、空、1   如果前面的为true，才会执行后面的()
        (this.playlist && -1 != this.playlist.ID || radio.state) && (this.$.play.hide(), this.$.pause.show(), t && this.setMetaData(t), this.audio.play())
        // 先隐藏“播放”按钮，然后展示“暂停”按钮，
    },

    playNext: function(t) {
        if (t = t || this.ID, this.playlist && -1 != this.playlist.ID) {
            var i = this.playlist.next(t);
            i ? this.play(i) : this.stop()
        }
        radio.state && 1 == t && radio.playNext()
    },
    pause: function() {
        this.$.play.show(),
        this.$.pause.hide(),
        this.audio.pause()
    },
    stop: function(t, i) {
        this.audio.pause(),
        i ? (this.audio.currentTime = 0, this.setCurrentTime(0)) : (t = t || "未选择歌曲", lrc.load({
            title: t,
            album: "未知",
            artist: "未知"
        }), this.playlist && this.playlist.setState( - 1), this.playlist = null, this.$.play.show(), this.$.pause.hide(), this.setDuration(0), this.setHead(t, ""))
    },
    timeFormartter: function(t) {
        var i = Math.ceil(t),
        e = i % 60,
        s = Math.floor(i / 60),
        n = (10 > e ? "0": "") + e,
        a = (10 > s ? "0": "") + s;
        return a + ":" + n
    },
    setHead: function(t, i) {
        this.$.songPic.attr("src", i),
        this.$.title.text(t)
    },
    setMetaData: function(t) {
        /*
        传过来的t参数:
            module.exports
                album:"红日"
                artist:"李克勤"
                id:115502
                pic:"http://p3.music.126.net/4TYHavK0-_I5xP56S-mZMw==/86861418607019.jpg"
                src:"http://m2.music.126.net/6sy9HG0ff9olc-xb5MAxzw==/7958265163415748.mp3"
                title:"红日"
        */
        lrc.load(t),
        //console.log(t.src);
        this.setHead(t.title, t.pic),
        this.audio.src = t.src,   // http://m2.music.126.net/wClzLXQgy6Ae-0y_SUxqNw==/1066526278951223.mp3
        console.log(this.audio.src);
        showNotify("现在播放：" + t.title)
    },
    setCurrentTime: function(t) {
        t > this.duration && (t = this.duration),
        this.$.curTime.text(this.timeFormartter(t)),
        this.progress.slider("setValue", t)
    },
    setDuration: function(t) {
        this.duration = t,
        this.progress.slider("setAttribute", "max", t),
        this.$.totTime.text(this.timeFormartter(t))
    },
    setVolume: function(t) {
        utils.isNumber(t) && t >= 0 && 1 >= t && (this.volume.slider("setValue", t), this.audio.volume = t)
    },
    toggleVolMute: function() {
        var t = this.volume.slider("isEnabled");
        t ? (this.audio.muted = !0, this.volume.slider("disable"), this.$.volIcon.attr("class", "glyphicon glyphicon-volume-off")) : (this.audio.muted = !1, this.volume.slider("enable"), this.$.volIcon.attr("class", "glyphicon glyphicon-volume-up"))
    },
    setOrder: function(t) {
        var i = this.orderList.length;
        utils.isNumber(t) && (this.ID = (t - 1 + i) % i),
        this.ID = (this.ID + 1) % i;
        var e = this.orderList[this.ID];
        this.$.order.attr("class", "glyphicon glyphicon-" + e.value),
        this.$.order.attr("title", e.name)
    },
    listen: function() {
        var t = this;
        this.audio.onloadedmetadata = function() {
            t.setDuration(this.duration)
        },
        this.audio.onerror = function() {
            t.playing = !1;
            var i;
            switch (this.error.code) {
            case 1:
                i = "未选择歌曲";
                break;
            case 2:
                i = "糟糕，网络貌似除了点问题";
                break;
            case 3:
                i = "糟糕，缺少相应解码器";
                break;
            case 4:
                i = "糟糕，文件或网络资源无法访问";
                break;
            default:
                i = "未知错误，error code:" + this.error.code
            }
            t.stop(i)
        };
        var i = !1;
        this.audio.ontimeupdate = function() {
            i || t.setCurrentTime(this.currentTime),
            lrc.seek(this.currentTime)
        },
        this.audio.onended = function() {
            t.playing = !1,
            t.playNext()
        },
        this.audio.onpause = function() {
            t.playing = !1
        },
        this.audio.onplaying = function() {
            t.playing = !0
        },
        this.progress.slider("on", "slideStart",
        function() {
            i = !0
        }),
        this.progress.slider("on", "slideStop",
        function() {
            var e = t.progress.slider("getValue");
            t.audio.currentTime = e,
            t.setCurrentTime(e),
            i = !1
        }),
        this.volume.slider("on", "slide",
        function(i) {
            t.audio.volume = i
        }),
        this.volume.slider("on", "change",
        function(i) {
            i.oldValue != i.newValue && (t.audio.volume = i.newValue)
        })
    }
};

var Playlist = function(t, i) {
    this.$ = {
        frame: $(t),
        tr: function() {
            return this.frame.find("tr")
        }
    },
    this.index = i,
    this.timestamp = category.plts[i].timestamp,
    this.songList = category.plts[i].songList,
    /*例如：this.songList[0]
        0:module.exports
            album:"红日"
            artist:"李克勤"
            id:115502
            pic:"http://p3.music.126.net/4TYHavK0-_I5xP56S-mZMw==/86861418607019.jpg"
            src:"http://m2.music.126.net/6sy9HG0ff9olc-xb5MAxzw==/7958265163415748.mp3"
            title:"红日"
    */
    //console.log(this.songList);
    this.canDel = entry.getMode(category.plts[i].type, 1),
    this.domCache = [],
    this.ID = -1,
    this.length = 0,
    this.load(),
    this.listen()
};
Playlist.prototype = {
    show: function() {
        var t = category.$.table;
        "none" == t.css("display") ? (this.$.frame.show(), t.fadeIn()) : this.$.frame.fadeIn()
    },
    hide: function() {
        this.$.frame.hide()
    },
    load: function() {
        this.$.frame.empty();
        for (var t = 0; t < this.songList.length; t++) this.addItem(this.songList[t]);
        this.addtoDOM()
    },
    // 添加播放列表
    addItem: function(t, i) {
        //console.log(t);
        /* t数组包含的元素
            album:"红日"
            artist:"李克勤"
            id:115502
            pic:"http://p3.music.126.net/4TYHavK0-_I5xP56S-mZMw==/86861418607019.jpg"
            src:"http://m2.music.126.net/6sy9HG0ff9olc-xb5MAxzw==/7958265163415748.mp3"
            title:"红日"
            等
        */
        var e = this.length,
        s = createDOM("tr");
        s.appendChild(createDOM("td", null, 1 + e)),
        s.appendChild(createDOM("td", null, t.title)),
        s.appendChild(createDOM("td", null, t.album)),
        s.appendChild(createDOM("td", null, t.artist));
        var n = createDOM("td", null),
        a = createDOM("span", {
            "class": "dropdown"
        }),
        r = createDOM("a", {
            "data-toggle": "dropdown",
            href: "javascript:0"
        });
        r.appendChild(createDOM("span", {
            "class": "glyphicon glyphicon-plus"
        })),
        a.appendChild(r),
        a.appendChild(createDOM("ul", {
            "class": "dropdown-menu",
            role: "menu"
        })),
        n.appendChild(a);
        var l = createDOM("a", {
            href: "javascript:0"
        });
        if (l.appendChild(createDOM("span", {
            "class": "glyphicon glyphicon-heart"
        })), n.appendChild(l), this.canDel) {
            var o = createDOM("a", {
                href: "javascript:0"
            });
            o.appendChild(createDOM("span", {
                "class": "glyphicon glyphicon-trash"
            })),
            n.appendChild(o)
        }
        s.appendChild(n),
        this.domCache.push(s),
        i && this.addtoDOM(),
        this.length++,
        e >= this.songList.length && (this.songList.push(t), Event.emit("rfshBadge"))
    },
    removeItem: function(t) {
        if (0 > t || t > this.length) throw "index out of range";
        if (!this.canDel) throw "insufficient permission to remove";
        t == this.ID && (this.ID = -1, player.stop()),
        this.ID > t && this.ID--;
        var i = this.$.tr();
        i.eq(t).remove();
        var e = i.slice(t + 1);
        e.each(function() {
            var t = $(this).children("td").first(),
            i = t.text();
            i && t.text(Number(i) - 1)
        }),
        this.songList.splice(t, 1),
        this.length--,
        Event.emit("rfshBadge")
    },
    setState: function(t) {
        if (t = t || 0, t != this.ID) {
            if (t >= this.length) throw "index out of range";
            var i = this.$.tr(),
            e = [],
            s = [];
            t >= 0 && (e = [i[t]], s = ['<span class="glyphicon glyphicon-music"></span>']),
            this.ID >= 0 && (e.push(i[this.ID]), s.push(this.ID + 1)),
            $(e).toggleClass("active");
            for (var n = $(e).children("td:first-child"), a = 0; a < n.length; a++) $(n[a]).html(s[a]);
            this.ID = t
        }
    },
    next: function(t, i) {
        switch (t) {
        case - 1 : i = (this.ID - 1 + this.length) % this.length;
            break;
        case 1:
            i = (this.ID + 1) % this.length;
            break;
        case 2:
            if (i = this.ID + 1, i == this.length) return;
            break;
        case 3:
            i = Math.round(Math.random() * this.length);
            break;
        default:
            utils.isNumber(i) || (i = this.ID)
        }
        return this.setState(i),
        this.songList[i]
    },
    addtoDOM: function() {
        if (0 != this.domCache.length) {
            var t = this.$.frame;
            this.domCache.forEach(function(i) {
                t.append(i)
            }),
            this.domCache = []
        }
    },
    create$DropDownMenus: function() {
        for (var t = [], i = 0; i < category.plts.length; i++) {
            var e = category.plts[i];
            if (e.timestamp != this.timestamp && entry.getMode(e.type, 1)) {
                var s = createDOM("li", {
                    role: "presentation",
                    "data-target": e.timestamp
                }),
                n = createDOM("a", {
                    role: "menuitem",
                    tabindex: -1,
                    href: "javascript:0"
                },
                e.name);
                s.appendChild(n),
                t.push(s)
            }
        }
        return t
    },
    listen: function() {
        var t = this;
        this.$.frame.on("dblclick", "tr",
        function() {
            var i = player.playlist;
            i && i != t && i.setState( - 1),
            radio.close();
            var e = t.next(0, $(this).index());
            player.playlist = t,
            player.play(e)
        }),
        this.$.frame.on("click", "span.glyphicon-plus",
        function(i) {
            var e = t.create$DropDownMenus();
            0 == e.length ? i.stopPropagation() : $(this).closest("tr").find(".dropdown-menu").html(e)
        }),
        this.$.frame.on("dblclick", "span.glyphicon-plus",
        function(t) {
            t.stopPropagation()
        }),
        this.$.frame.on("click", ".dropdown-menu li",
        function() {
            var i = $(this).closest("tr").index(),
            e = $(this).data("target");
            category.$plts[e].addItem(t.songList[i], !0)
        }),
        this.$.frame.on("click", ".glyphicon-trash",
        function() {
            t.removeItem($(this).closest("tr").index())
        })
    }
};
var Radio = function() {
    this.state = !1,
    this.loadState = null,
    this.loadQue = new utils.queue,
    this.curplay = null,
    this.listen()
};
Radio.prototype = {
    load: function() {
        if ("loading" != this.loadState) {
            var t = this;
            api.radio(function(i, e) {
                i ? errorHandle(i) : Event.emit("songloaded", e),
                t.loadState = "loaded"
            }),
            this.loadState = "loading"
        }
    },
    show: function() {
        0 == this.state && (player.stop("loading..."), player.$.backward.hide(), player.$.order.hide(), this.state = !0, this.play()),
        lrc.toggle(!0)
    },
    close: function() {
        this.state = !1,
        player.$.backward.show(),
        player.$.order.show()
    },
    play: function() {
        this.curplay ? player.play(this.curplay) : this.loadQue.empty() ? this.load() : (this.curplay = this.loadQue.pop(), player.play(this.curplay))
    },
    playNext: function() {
        null != this.curplay && (this.curplay = null, this.play())
    },
    listen: function() {
        Event.on("songloaded",
        function(t) {
            for (var i = 0; i < t.length; i++) this.loadQue.push(t[i]);
            this.play()
        },
        this)
    }
};
var Settings = function() {
    this.$ = {
        musicDir: $("#music-dir"),
        dialog: $("#dialog"),
        btnOpen: $("button#openDialog"),   // 选择本地音乐文件的按钮
        searchLimit: $("#search-limit")
    },
    this.$.searchLimit.val(fm.getSearchLimit()),
    this.$.musicDir.val(fm.getMusicDir()),
    this.listen()
};

Settings.prototype = {
    listen: function() {
        var t = this;
        this.$.btnOpen.click(function() {
            t.$.dialog.trigger("click")
        }),

        this.$.dialog.change(function() {
            var i = $(this).val();   // 目录；例如：D:\KuGou
            
            // fm.setMusicDir(i)函数为了设置config.content.musicDir == i 例如：D:\KuGou
            // 返回true or false
            fm.setMusicDir(i) && (t.$.musicDir.val(i), category.loadPlaylists({
                local: !0
            }))
            // t.$.musicDir.val(i)设置“输入框”为目录i，例如：D:\KuGou
            // !0为true，!1为false
        }),

        this.$.searchLimit.change(function() {
            var t = $(this).val();
            t = t.trim(),
            console.log("limit", t);
            var i = /^[1-9]\d*$/;
            i.test(t) ? ($(this).parent().removeClass("has-error"), fm.setSearchLimit(Number(t) || 0)) : $(this).parent().addClass("has-error")
        })
    }
};

global.storage = localStorage;

var fm = require("./libs/FileManager"),
api = require("./libs/NetEaseMusic"),
utils = require("./libs/Utils"),
PltM = require("./libs/PlaylistModel"),
EntryM = require("./libs/EntryModel"),


Event = function() {
    var t = $(window);
    return {
        on: function(i, e, s) {
            t.on(i,
            function() {
                e.apply(s, [].slice.call(arguments, 1))
            })
        },
        once: function(i, e, s) {
            t.one(i,
            function() {
                e.apply(s, [].slice.call(arguments, 1))
            })
        },
        emit: function(i) {
            t.triggerHandler(i, [].slice.call(arguments, 1))
        }
    }
} (),
errorHandle = function(t) {
    t && (t.type && showNotify(t.msg), console.log(t.msg ? t.msg: t))
},
showNotify = function(t) {
    new Notification("网易音乐盒", {
        body: t
    })
},
createDOM = function(t, i, e) {
    var s = document.createElement(t);
    for (var n in i) s.setAttribute(n, i[n]);
    return utils.isUndefinedorNull(e) || (s.innerText = e),
    s
},
entry = {
    schema: {
        local: new EntryM({
            mode: 0,
            name: "本地",
            loader: function(t) {
                fm.getLocal(t)
            }
        }),
        user: new EntryM({
            mode: 3,
            name: "用户",
            loader: function(t) {
                fm.getScheme(t)
            },
            onadd: function(t) {
                fm.addScheme(t)
            },
            onremove: function(t) {
                fm.delScheme(t)
            }
        }),
        net: new EntryM({
            mode: 0,
            name: "云音乐",
            loader: function(t) {
                api.getNet(t)
            }
        })
    },
    getMode: function(t, i) {
        var e = this.schema[t] ? this.schema[t].mode: 2;
        return "undefined" != typeof i ? 1 << i & e: e
    },
    getPrefix: function(t) {
        return this.schema[t] ? this.schema[t].name: "未知"
    }
},
nav = new Nav,
account = new Account,
radio = new Radio,
lrc = new Lrc,
player = new Player,
//tray = new Tray,
settings = new Settings,
category = new Category;
account.loadUser(),
category.loadPlaylists(null, !0),
$("table").on("selectstart",
    function(t) {
        t.preventDefault()
});