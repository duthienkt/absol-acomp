function DTSearchFactor(global) {
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

    function isItemMustIncluded(queryItem, item) {
        if (!queryItem) return true;
        if (item.__nvnText__.indexOf(queryItem.__nvnText__) >= 0) {
            return true;
        }
        var dict1 = queryItem.__nvnWordDict__;
        var dict2 = item.__nvnWordDict__;
        for (var i in dict1) {
            for (var j in dict2) {
                if (j.indexOf(i) < 0) return false;
            }
        }

        return true;
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
            score += EXTRA_MATCH_SCORE + 200 - extraIndex - (item.__text__.length - queryItem.__text__.length);

        }

        extraIndex = item.__nvnText__.indexOf(queryItem.__nvnText__);
        if (extraIndex >= 0) {
            score += EXTRA_MATCH_SCORE + 200 - extraIndex - (item.__text__.length - queryItem.__text__.length);

        }

        var n = Math.max(queryItem.__words__.length + 1, 1);
        score = Math.max(score, wordsMatch(queryItem.__words__, item.__words__), wordsMatch(queryItem.__nvnWords__, item.__nvnWords__)) / n * 2 * WORD_MATCH_SCORE;
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


    var benchmark = global.calcBenchmark();

    /******************************************************************************************************************/

    var slaves = {};

    function SearchingSlave(id) {
        this.id = id;
        this.items = [];
        this.itemVersion = -1;

        this.tranferFinished = true;

        this.pendingTask = null;
        this.taskSession = Math.random() + '';
        this.scoredHolders = [];
        this.searchingSession = Math.random() + '';
    }

    SearchingSlave.prototype.onReceiveItems = function (n, start, end, items, version) {
        if (this.scoredHolders.length > start) {
            this.scoredHolders.splice(start);
        }
        var cItems = this.items;
        if (cItems.length < n) {
            // sessionItems
            cItems.push(null);
        }
        if (cItems.length > n) {
            cItems.splice(n);
        }

        this.itemVersion = version;

        for (var i = start; i < end; ++i) {
            cItems[i] = items[i - start];
        }


        if (end === n) {
            this.tranferFinished = true;
            this.doTask();
        }
        else {
            this.tranferFinished = false;
        }
    };


    SearchingSlave.prototype.doTask = function () {
        if (!this.pendingTask) return;
        if (this.searchingSession === this.taskSession) return;
        var self = this;
        this.searchingSession = this.taskSession;
        var session = this.searchingSession;
        var items = this.items;
        var its = this.scoredHolders;
        var taskData = this.pendingTask;
        var itemVersion = this.itemVersion;
        var queryText = taskData.query.text;
        var filter = taskData.query.filter;
        var sort = taskData.query.sort;

        var queryTextItem = null;
        if (queryText) queryTextItem = prepareSearchForItem({ text: queryText });
        var sortCmp = (a, b) => {
            var aKeys = a.item.keys;
            var bKeys = b.item.keys;
            var key;
            var av, bv;
            var d = 0;
            if (aKeys && !bKeys) {
                d = 1;
            }
            else if (!aKeys && bKeys) {
                d = -1;
            }
            else if (aKeys && bKeys) {
                for (var i = 0; i < sort.length; ++i) {
                    key = sort[i].key;
                    d = aKeys[key] - bKeys[key];
                    if (isNaN(d)) {
                        if (aKeys[key] < bKeys[key]) {
                            d = -1;
                        }
                        else if (aKeys[key] === bKeys[key]) {
                            d = 0;
                        }
                        else {
                            d = 1;
                        }
                    }
                    if (sort[i].order === 'descending') d = -d;
                    if (d !== 0) break;
                }
            }
            if (d === 0) {
                d = a.i - b.i;
            }
            return d;

        };

        function likeSort(items) {

            var minValue = Infinity;
            var maxValue = -Infinity;
            var i;
            var n = items.length;
            var item;
            for (i = 0; i < n; ++i) {
                item = items[i];
                if (item.score < minValue) minValue = item.score;
                if (item.score > maxValue) maxValue = item.score;
            }
            var segments = [[], [], [], [], [], [], [], []];
            var threshold = maxValue - (maxValue - minValue) / 4;

            if (maxValue < 3) threshold = maxValue - (maxValue - minValue) / 8;
            var d = (maxValue - threshold) / (segments.length - 1);
            var v;
            var k;
            for (i = 0; i < n; ++i) {
                item = items[i];
                v = item.score;
                if (item.mustIncluded) v = Math.max(threshold + 0.1, v);
                if (v < threshold || v < 0.8) continue;
                if (v >= maxValue) segments[segments.length - 1].push(item)
                else {
                    k = ((v - threshold) / d) >> 0;
                    segments[k].push(item);
                }
            }

            var res = [];
            var segment;
            while (segments.length > 0) {
                segment = segments.pop();
                if (segment.length > 0) {
                    if (sort) {
                        segment.sort(sortCmp);
                    }
                    else {
                        if (segment.length + res.length < 1000)
                            segment.sort(scoreCmp);
                    }

                    res = res.concat(segment);
                }
            }

            return res;
        }

        function sortScore() {
            var result = its;

            if (filter) {
                result = result.filter(function (x) {
                    return !!x;
                })
            }

            // var now = new Date().getTime();

            if (queryTextItem) {
                result = likeSort(result);
            }

            else if (sort) {
                result.sort(sortCmp);
            }

            // console.log("SortTime:", new Date().getTime() - now)
            result = result.map(function (it) {
                return it.i;
            });
            self.searchingSession = 'done';
            global.emit('searchEnd', self.id, Object({
                hash: taskData.hash,
                idx: taskData.idx,
                result: result,
                itemVersion: self.itemVersion
            }));
        }

        function tick() {

            if (self.taskSession !== session) return;
            if (self.itemVersion !== itemVersion) {
                return;
            }
            if (its.length >= items.length) {
                sortScore();
                return;
            }

            var k = benchmark * 5;
            if (!queryTextItem) k *= 30;
            var i = its.length;
            var n = items.length
            while (k-- && i < n) {
                if (!filter || matchFilter(items[i], filter)) {
                    if (!items[i].prepare && queryTextItem) {
                        items[i].prepare = true;
                        prepareSearchForItem(items[i]);
                    }
                    its.push({
                        i: i,
                        item: items[i],
                        score: queryTextItem ? calcItemMatchScore(queryTextItem, items[i]) : 0,
                        mustIncluded: isItemMustIncluded(queryTextItem, items[i])
                    });
                }
                else {
                    its.push(null);
                }
                ++i;
            }


            setTimeout(tick, 5);
        }

        tick();
    };


    SearchingSlave.prototype.receiveTask = function (taskData) {
        this.pendingTask = taskData && taskData.query && taskData;
        this.taskSession = taskData && taskData.idx;
        this.scoredHolders = [];
        if (this.tranferFinished && this.pendingTask) this.doTask();
    }


    SearchingSlave.prototype.destroy = function () {
        this.items = null;
        delete slaves[this.id];
    };


    global.destroySlave = function (id) {
        slaves[id] && slaves[id].destroy();
    };


    /******************************************************************************************************************/
    var data = {};

    global.transferTask = function (id, taskData) {
        slaves[id] = slaves[id] || new SearchingSlave(id);
        slaves[id] && slaves[id].receiveTask(taskData);
    };

    global.transferSearchItems = function (id, n, start, end, items, version) {
        slaves[id] = slaves[id] || new SearchingSlave(id);
        slaves[id].onReceiveItems(n, start, end, items, version);
    };

    global.search = function (session, query) {
        var holder = data[session];
        if (!holder) return false;
        var searchingSession = Math.random() + '';
        holder.searchingSession = searchingSession;

        var now = new Date().getTime();
        var items = data[session] && data[session].items;
        var its = Array(items.length);
        var queryItem = prepareSearchForItem({ text: query });
        var resolve;
        var sync = new Promise(function (rs) {
            resolve = rs;
        });

        function calcValue() {

            var i = 0;
            var n = items.length;

            function tick() {
                if (searchingSession !== holder.searchingSession) {
                    resolve(false);
                    return;
                }
                var c = benchmark * 5;
                while (c-- && i < n) {
                    its[i] = {
                        i: i,
                        item: items[i],
                        score: calcItemMatchScore(queryItem, items[i])
                    };
                    ++i;
                }
                if (i < n) {
                    setTimeout(tick, 3);
                }
                else {
                    setTimeout(sortScore, 3);
                }
            }

            tick();
        }

        function sortScore() {
            if (searchingSession !== holder.searchingSession) {
                resolve(false);
                return;
            }
            now = new Date().getTime();
            var result = likeSort(its).map(function (it) {
                return it.i;
            });
            resolve(result);
        }

        setTimeout(calcValue, 3);
        return sync;
    };
}

export default DTSearchFactor;