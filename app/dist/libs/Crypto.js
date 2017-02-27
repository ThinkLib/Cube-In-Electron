function addPadding(e, r) {
    var t = r.length;
    for (c = 0; t > 0 && "0" == r[c]; c++) t--;
    for (var a = t - e.length,
    n = "",
    c = 0; a > c; c++) n += "0";
    return n + e
}
function aesEncrypt(e, r) {
    var t = crypto.createCipheriv("AES-128-CBC", r, "0102030405060708");
    return t.update(e, "utf-8", "base64") + t["final"]("base64")
}
function rsaEncrypt(e, r, t) {
    for (var a = "",
    n = 16,
    c = e.length - 1; c >= 0; c--) a += e[c];
    var d = bigInt(new Buffer(a).toString("hex"), n),
    o = bigInt(r, n),
    f = bigInt(t, n),
    b = d.modPow(o, f);
    return addPadding(b.toString(n), t)
}
function createSecretKey(e) {
    for (var r = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    t = "",
    a = 0; e > a; a++) {
        var n = Math.random() * r.length;
        n = Math.floor(n),
        t += r.charAt(n)
    }
    return t
}
var crypto = require("crypto"),
bigInt = require("big-integer"),
modulus = "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7",
nonce = "0CoJUm6Qyw8W8jud",
pubKey = "010001",
Crypto = {
    MD5: function(e) {
        return crypto.createHash("md5").update(e).digest("hex")
    },
    aesRsaEncrypt: function(e) {
        var r = createSecretKey(16);
        return {
            params: aesEncrypt(aesEncrypt(e, nonce), r),
            encSecKey: rsaEncrypt(r, pubKey, modulus)
        }
    }
};
module.exports = Crypto;