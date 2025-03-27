import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { wordLike, wordsMatch } from "absol/src/String/stringMatching";

var UNCASE_MATCH_SCORE = 4;
var UVN_MATCH_SCORE = 3;
var EXTRA_MATCH_SCORE = 9;
var NVN_EXTRA_MATCH_SCORE = 8;
var EQUAL_MATCH_SCORE = 10;
var WORD_MATCH_SCORE = 3;
var HAS_WORD_SCORE = 30;
var HAS_NVN_WORD_SCORE = 29;

/***
 *
 * @param {SelectionItem} item
 * @returns {*}
 */
export default function prepareSearchForItem(item) {
    if (!item.text || !item.text.charAt) item.text = item.text + '';
    var splitter = /([_\s\b\-()\[\]"']|&#8239;|&nbsp;|&#xA0;")+/g;
    var text = item.text.replace(splitter, ' ');
    var __words__ = text.split(/\s+/).filter(w=>!!w).map(w=>w.toLowerCase());
    var __text__ = __words__.join(' ');
    var __wordDict__ = __words__.reduce((ac, cr, i) => {
        ac[cr] = ac[cr] || i + 1;
        return ac;
    }, {});

    var __nvnText__ = nonAccentVietnamese(__text__);

    var __nvnWords__ =  __words__.map(w=>nonAccentVietnamese(w));
    var __nvnWordDict__ = __nvnWords__.reduce((ac, cr, i) => {
        ac[cr] = ac[cr] || i + 1;
        return ac;
    }, {});

    Object.defineProperties(item, {
        __text__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __text__
        },
        __words__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __words__
        },
        __wordDict__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __wordDict__
        },
        __textNoneCase__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __text__
        },
        __wordsNoneCase__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __words__
        },
        __nvnText__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __nvnText__
        },
        __nvnWords__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __nvnWords__
        },
        __nvnWordDict__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __nvnWordDict__
        },
        __nvnTextNoneCase__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __nvnText__
        },
        __nvnWordsNoneCase__: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: __nvnWords__
        }
    });

    return item;
}

export function prepareSearchForList(items) {
    var item;
    for (var i = 0; i < items.length; ++i) {
        if (typeof items[i] == 'string') {
            items[i] = { text: items[i], value: items[i] };
        }
        item = items[i];
        prepareSearchForItem(item);
        if (item.items) prepareSearchForList(item.items);
    }
    return items;
}

export function calcItemMatchScore(queryItem, item) {
    var score = 0;
    if (!item.__text__) return 0;

    function calcByWordDict(queryWords, wordDict) {
        var hwScore = 0;
        var i;
        wordDict = Object.assign({}, wordDict);
        var bestWordMatched, bestWordMatchScore = 0;
        var word, wordScore;
        for (i = 0; i < queryWords.length; ++i) {
            bestWordMatchScore = 0;
            bestWordMatched = null;
            for (word in wordDict) {
                wordScore = wordLike(word, queryWords[i]) - 1e-3 * wordDict[word];
                if (wordScore > bestWordMatchScore) {
                    bestWordMatched = word;
                    bestWordMatchScore = wordScore;
                }
            }
            if (bestWordMatchScore >0) {
                hwScore += bestWordMatchScore * WORD_MATCH_SCORE;
                delete wordDict[bestWordMatched];
            }
        }
        return hwScore;
    }

    score += calcByWordDict(queryItem.__words__, item.__wordDict__);
    score += calcByWordDict(queryItem.__nvnWords__, item.__nvnWordDict__);

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

    score += Math.max(wordsMatch(queryItem.__words__, item.__words__), wordsMatch(queryItem.__nvnWords__, item.__nvnWords__))/ Math.max(queryItem.__words__.length + 1, 1);
    return score;
}

function isItemMustIncluded(queryItem, item) {
    if (!queryItem) return  true;
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

/***
 *
 * @param  {String} query
 * @param {Array<SelectionItem>} items
 */
export function searchListByText(query, items) {
    query = (query || '').trim();
    if (query.length === 0 || items.length === 0)
        return items;
    var queryItem = prepareSearchForItem({ text: query });
    var its = items.map(function (item) {
        if (!item.__text__) prepareSearchForItem(item);
        return {
            item: item,
            score: calcItemMatchScore(queryItem, item),
            mustIncluded: isItemMustIncluded(queryItem, item)
        }
    });
    its.sort(function (a, b) {
        if (b.score - a.score == 0) {
            if (b.item.__nvnText__ > a.item.__nvnText__) return -1
            return 1;
        }
        return b.score - a.score;
    });
    var midValue = (its[0].score + its[its.length - 1].score) / 2;
    if (midValue === 0) midValue += 0.1;
    if (midValue < 1) midValue = 1;
    return its.filter(function (it) {
        return it.score >= midValue || it.mustIncluded;
    }).map(function (it) {
        return it.item;
    });
}

/***
 *
 * @param  {String} query
 * @param {Array<SelectionItem>} items
 */
export function searchTreeListByText(query, items) {
    query = (query || '').trim();
    if (query.length == 0 || items.length == 0)
        return items;
    var queryItem = prepareSearchForItem({ text: query });
    var gmaxScore = 0;
    var gminScore = 1000;

    function makeScoreRecursive(item) {
        var score = calcItemMatchScore(queryItem, item);
        var mustIncluded = isItemMustIncluded(queryItem, item);
        gmaxScore = Math.max(score, gmaxScore);
        gminScore = Math.min(score, gminScore);

        var children = (item.items || []).map(function (item) {
            return makeScoreRecursive(item);
        });

        mustIncluded = mustIncluded || children.some(c => c.mustIncluded);

        var maxScore = children.reduce(function (ac, cr) {
            return Math.max(ac, cr.maxScore);
        }, score);

        return {
            score: score,
            maxScore: maxScore,
            item: item,
            children: children,
            mustIncluded: mustIncluded
        }
    }

    function sortcmp(a, b) {
        return b.maxScore - a.maxScore;
    }

    function filterItems(nodes, medScore) {
        nodes.sort(sortcmp);
        return nodes.filter(function (node) {
            return node.maxScore >= medScore || node.mustIncluded;
        }).map(function (node) {
            var res;
            if (typeof node.item == 'string') {
                res = node.item;
            }
            else {
                res = Object.assign({}, node.item);
                res.ref = node.item;
                if (node.children && node.children.length > 0) {
                    res.items = filterItems(node.children, medScore);
                    if (res.items.length == 0) delete res.items;
                }
            }
            return res;
        });
    }

    var scoredItems = items.map(makeScoreRecursive);
    var medianScore = (gminScore + gmaxScore) / 2;
    items = filterItems(scoredItems, medianScore);
    return items;
}


/***
 * checked is bestValue
 * @param  {String} query
 * @param {Array<SelectionItem|{checked:boolean, text: string}>} items
 */
export function searchCheckListByText(query, items) {
    var res = items.filter(it=> it.checked);
    var nItems = items.filter(it=> !it.checked);
    prepareSearchForList(items);
    nItems = searchListByText(query, nItems);
    return res.concat(nItems);
}