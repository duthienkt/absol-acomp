export default function ListSearchFactor(global) {
    /***
     * @typedef SelectionItem2
     * @property {String} text
     * @property {String} desc
     * @property {String} __text__
     * @property {String} __nvnText__
     * @property {Array<String>} __words__
     * @property {Array<String>} __nvnWords__
     * @property {object} __wordDict__
     * @property {object} __nvnWordDict__
     * @module SelectionItem2
     */


    function nonAccentVietnamese(s) {
        return s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
            .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
            .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
            .replace(/ì|í|ị|ỉ|ĩ/g, "i")
            .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
            .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
            .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
            .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "")
            .replace(/\u02C6|\u0306|\u031B/g, "");
    }

    function harmonicMean(a, b) {
        return 2 / (1 / a + 1 / b);
    }

    function wordLike(a, b) {
        var m = a.length;
        var n = b.length;

        function map(i, j) {
            return i * (n + 1) + j;
        }

        var Q = Array((m + 1) * (n + 1)).fill(0);

        for (var i = 0; i < m; ++i)
            for (var j = 0; j < n; ++j)
                if (a.charAt(i) == b.charAt(j)) {
                    if (Q[map(i + 1, j + 1)]) {
                        if (Q[map(i + 1, j + 1)] < Q[map(i, j)] + 1)
                            Q[map(i + 1, j + 1)] = Q[map(i, j)] + 1;
                    }
                    else
                        Q[map(i + 1, j + 1)] = Q[map(i, j)] + 1;
                }
                else
                    Q[map(i + 1, j + 1)] = Math.max(Q[map(i + 1, j)], Q[map(i, j + 1)]);

        return Q[map(m, n)] / harmonicMean(m, n);
    }

    function wordsMatch(sq1, sq2, matchWordPow) {
        matchWordPow = matchWordPow === undefined ? 1 : matchWordPow;

        var m = sq1.length;
        var n = sq2.length;

        function map(i, j) {
            return i * (n + 1) + j;
        }

        var Q = Array((m + 1) * (n + 1)).fill(0);
        var e = 0.0;
        for (var i = 0; i < m; ++i)
            for (var j = 0; j < n; ++j) {
                e = Math.pow(wordLike(sq1[i], sq2[j]), matchWordPow);

                if (Q[map(i + 1, j + 1)]) {
                    if (Q[map(i + 1, j + 1)] < Q[map(i, j)] + e)
                        Q[map(i + 1, j + 1)] = Q[map(i, j)] + e;

                }
                else
                    Q[map(i + 1, j + 1)] = Q[map(i, j)] + e;

                e = Math.max(Q[map(i + 1, j)], Q[map(i, j + 1)]);
                if (e > Q[map(i + 1, j + 1)]) Q[map(i + 1, j + 1)] = e;

            }

        return Q[map(m, n)];
    }

    var EXTRA_MATCH_SCORE = 9;
    var NVN_EXTRA_MATCH_SCORE = 8;
    var EQUAL_MATCH_SCORE = 10;
    var WORD_MATCH_SCORE = 3;
    var HAS_WORD_SCORE = 30;
    var HAS_NVN_WORD_SCORE = 29;


    /***
     *
     * @param {SelectionItem2} item
     * @returns {*}
     */
    function prepareSearchForItem(item) {
        if (!item.text || !item.text.charAt) item.text = item.text + '';
        var spliter = /[\s/]+/;
        var __text__ = item.text.replace(/([\s\b\-()\[\]"']|&#8239;|&nbsp;|&#xA0;|\s")+/g, ' ').trim().toLowerCase();
        var __nvnText__ = nonAccentVietnamese(__text__);

        item.__words__ = __text__.split(spliter);
        item.__text__ = item.__words__.join(' ');
        item.__words__.sort();
        item.__wordDict__ = item.__words__.reduce((ac, cr, i) => {
            ac[cr] = i + 1;
            return ac;
        }, {});

        item.__nvnWords__ = __nvnText__.split(spliter);
        item.__nvnText__ = item.__nvnWords__.join(' ')
        item.__nvnWords__.sort();
        item.__nvnWordDict__ = item.__nvnWords__.reduce((ac, cr, i) => {
            ac[cr] = i + 1;
            return ac;

        }, {});

        return item;
    }

    function calcItemMatchScore(queryItem, item) {
        var score = 0;
        if (!item.__text__) return 0;
        var hwScore = 0;
        var i;
        for (i = 0; i < queryItem.__words__.length; ++i) {
            if (item.__wordDict__[queryItem.__words__[i]]) {
                hwScore += HAS_WORD_SCORE;
            }
            else if (item.__nvnWordDict__[queryItem.__nvnWords__[i]]) {
                hwScore += HAS_NVN_WORD_SCORE;
            }
        }

        score = hwScore;

        if (item.__text__ === queryItem.__text__) {
            score += EQUAL_MATCH_SCORE;
        }

        var extraIndex = item.__text__.indexOf(queryItem.__text__);

        if (extraIndex >= 0) {
            score += EXTRA_MATCH_SCORE;
        }

        extraIndex = item.__nvnText__.indexOf(queryItem.__nvnText__);
        if (extraIndex >= 0) {
            score += EXTRA_MATCH_SCORE;
        }

        var n = Math.max(queryItem.__words__.length + 1, 1);
        score = Math.max(score,
            wordsMatch(queryItem.__words__, item.__words__) / n * 2 * WORD_MATCH_SCORE,
            wordsMatch(queryItem.__nvnWords__, item.__nvnWords__) / n * 2 * WORD_MATCH_SCORE
        );
        return score;
    }

    function scoreCmp(a, b) {
        if (b.score === a.score) {
            if (b.item.__nvnText__ > a.item.__nvnText__) return -1;
            return 1;
        }
        return b.score - a.score;
    }

    function keyStringOf(o) {
        var type = typeof o;
        var keys;
        if (o && type === "object") {
            if (o.getTime) {
                return 'd(' + o.getTime() + ')';
            }
            else if (o.length && o.map) {
                return 'a(' + o.map(val => keyStringOf(val)).join(',') + ')';
            }
            else {
                keys = Object.keys(o);
                keys.sort();
                return 'o(' + keys.map(key => key + ':' + keyStringOf(o[key])).join(',') + ')';
            }

        }
        else {
            return type[0] + '(' + o + ')';
        }
    }


    function matchFilter(item, filter) {
        if (!filter) return true;
        var keys = item.keys;
        if (!keys) return false;
        for (var i in filter) {
            if (!keyCmp(keys[i], filter[i])) return false;
        }
        return true;
    }

    function toComparable(x) {
        if (!x) return x;
        var type = typeof x;
        if (type === 'string') return x;
        if (type === "number") return x;
        if (type === "boolean") return x;
        if (type.getTime) return type.getTime();
        return x;
    }

    function keyCmp(itemKey, filterKey) {
        if (itemKey === filterKey) return true;
        if (!itemKey !== !filterKey) return false;
        if (!itemKey || !filterKey) return false;
        var filterKeyString = keyStringOf(filterKey)

        function withFilter(x) {
            var xString = keyStringOf(x)
            var res = xString === filterKeyString;
            if (!res && (typeof filterKey === "object")) {
                if (filterKey.some) {
                    res = filterKey.some(function (y) {
                        return keyStringOf(y) === x;
                    });
                }
                else if (('min' in filterKey) || ('max' in filterKey)) {
                    res = true;
                    if ('min' in filterKey) {
                        res = res && toComparable(x) >= toComparable(filterKey.min);
                    }
                    if ('max' in filterKey) {
                        res = res && toComparable(x) <= toComparable(filterKey.max);
                    }
                }
            }
            return res;
        }

        if (itemKey.some) {
            return itemKey.some(withFilter);
        }
        else return withFilter(itemKey);
    }

    function Slave() {
        this.items = [];
    }


    Slave.prototype.processItems = function (items) {
        this.items = items;
        this.items.forEach(function visit(item) {
            prepareSearchForItem(item);
            if (item.items) item.items.forEach(visit);
        })
    };


    Slave.prototype.callQuery = function (query) {
        prepareSearchForItem(query);
        var minScore = Infinity;
        var maxScore = -Infinity;
        var scoreHolders = this.items.map(function visit(item) {
            var res = {};
            res.score = calcItemMatchScore( query, item);
            res.value = item.value;
            res.maxChildScore = -Infinity;
            if (item.items) {
                res.child = item.items.map(visit);
                res.maxChildScore = res.child.reduce((ac, cr) => Math.max(ac, cr.maxChildScore, cr.score), res.maxChildScore);
            }

            minScore = Math.min(minScore, res.score);
            maxScore = Math.max(maxScore, res.score);
            return res;
        });
        var threshold = maxScore - (maxScore - minScore) / 4;
        if (maxScore < 3) threshold = maxScore - (maxScore - minScore) / 8;
        var resDict = scoreHolders.reduce(function rValue(ac, cr) {
            if (Math.max(cr.maxChildScore, cr.score) >= threshold) ac[cr.value] = [cr.score, cr.maxChildScore];
            if (cr.child) cr.child.reduce(rValue, ac);
            return ac;
        }, {});
        return resDict;
    };


    var slaves = {};

    global.transferSearchItems = function (id, items) {
        if (!slaves[id]) slaves[id] = new Slave();
        slaves[id].processItems(items);
    };

    global.callQuery = function (id, query) {
        if (slaves[id]) return slaves[id].callQuery(query);
        return null;
    }

    global.destroySlave = function (id) {
        delete slaves[id];
    }

}
