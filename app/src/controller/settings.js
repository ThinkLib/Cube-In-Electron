/**
 * Created by kevin on 15-5-8.
 */
//设置页面行为
var Settings = function () {
    this.$ = {
        musicDir: $('#music-dir'),
        dialog: $('#dialog'),
        btnOpen: $('button#openDialog'),
        searchLimit: $('#search-limit')
    };
    this.$.searchLimit.val(fm.getSearchLimit());
    this.$.musicDir.val(fm.getMusicDir());
    this.listen();
};
Settings.prototype = {
    listen: function () {
        var that = this;
        this.$.btnOpen.click(function () {
            that.$.dialog.trigger('click');
        });

        this.$.dialog.change(function () {
            var newDir = $(this).val();
            console.log(newDir);
            if (fm.setMusicDir(newDir)) {
                that.$.musicDir.val(newDir);
                //reload localdir
                category.loadPlaylists({'local': true});
            }
        });
        this.$.searchLimit.change(function () {
            var limit = $(this).val();
            limit = limit.trim();
            //判断limit是否是数字
            console.log('limit', limit);
            var regex = /^[1-9]\d*$/;
            if (regex.test(limit)) {
                $(this).parent().removeClass('has-error');
                fm.setSearchLimit(Number(limit) || 0);
            } else {
                $(this).parent().addClass('has-error');
            }
        });
    }
}