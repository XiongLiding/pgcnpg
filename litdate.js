(function (global, factory) {
    typeof module !== 'undefined' && typeof module.exports !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	global.litdate = factory();
}(this, function () { 'use strict';
    return function (date) {
        if (typeof date == 'undefined') {
            date = new Date();
        }

        var DAY = 86400000;

        var zero = function (n) {
            return n < 10 ? '0' + n : '' + n;
        };

        var weekdateoffset = function (date0101) {
            var N = date0101.getDay();
            var offset = N <= 4 ? N - 1 : N - 8;
            return offset; 
        }

        var j = date.getDate();
        var d = zero(j);
        var w = date.getDay();
        var N = w == 0 ? 7 : w;
        var date0101 = new Date(date.getTime());
        date0101.setMonth(0);
        date0101.setDate(1);
        var z = (date.getTime() - date0101.getTime()) / DAY;
        var Z = z + 1;

        var n = date.getMonth() + 1;
        var m = zero(n);

        var Y = date.getFullYear();
        var y = ('' + Y).substr(2);
        var L = (Y % 4 == 0 && Y % 100 != 0) || Y % 400 == 0 ? 1 : 0
        var t = [31, 28 + L, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][n - 1];

        var tsMonday = date.getTime() - (N - 1) * DAY;
        var tsFirstMonday = date0101.getTime() - weekdateoffset(date0101) * DAY;

        var W = (tsMonday - tsFirstMonday) / DAY / 7 + 1;
        var o = new Date(tsMonday).getFullYear();
        if (W == 0) {
            var prev0101 = new Date(date0101.getTime());
            prev0101.setYear(o);
            var tsPrevFirstMonday = prev0101.getTime() - weekdateoffset(prev0101) * DAY;
            W = (tsMonday - tsPrevFirstMonday) / DAY / 7 + 1;
        } else {
            var next0101 = new Date(Math.round(date0101.getTime() + DAY * (365 + L)));
            var tsNextFirstMonday = next0101.getTime() - weekdateoffset(next0101) * DAY;
            if (tsMonday >= tsNextFirstMonday) {
                W = 1;
                o = Y + 1;
            }
        }
        var e = W;
        W = W < 10 ? '0' + W : '' + W;

        var G = date.getHours();
        var g = G % 12 ? G % 12 : 12;
        var H = zero(G);
        var h = zero(g);
        var a = G > 11 ? 'pm' : 'am';
        var A = G > 11 ? 'PM' : 'AM';
        var I = date.getMinutes();
        var i = zero(I);
        var S = date.getSeconds();
        var s = zero(S);

        var obj = {
            d: d,
            j: j,
            N: N,
            w: w,
            z: z,
            Z: Z,
            W: W,
            e: e,
            m: m,
            n: n,
            t: t,
            L: L,
            o: o,
            Y: Y,
            y: y,
            a: a,
            A: A,
            g: g,
            G: G,
            h: h,
            H: H,
            i: i,
            I: I,
            s: s,
            S: S
        };

        var format = function (str) {
            var chars = str.split('');
            for (var i = 0; i < chars.length; i++) {
                if (typeof obj[chars[i]] != 'undefined') {
                    chars[i] = obj[chars[i]];
                }
            }
            return chars.join('');
        };

        obj.format = format;

        return obj;
    };
}));
