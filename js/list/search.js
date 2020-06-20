import {nonAccentVietnamese} from "absol/src/String/stringFormat";
import {wordsMatch} from "absol/src/String/stringMatching";

var EXTRA_MATCH_SCORE = 2;
var UNCASE_MATCH_SCORE = 1;
var UVN_MATCH_SCORE = 3;
var EQUAL_MATCH_SCORE = 4;
var WORD_MATCH_SCORE = 3;

/***
 *
 * @param {SelectionItem} item
 * @returns {*}
 */
export default function prepareSearchItem(item) {
    var spliter = /\s+/;
    item.__text__ = item.text.replace(/([\s\b\-()\[\]]|&#8239;|&nbsp;|&#xA0;|\s)+/g, ' ').trim();
    item.__words__ = item.__text__.split(spliter);

    item.__textNoneCase__ = item.__text__.toLowerCase();
    item.__wordsNoneCase__ = item.__textNoneCase__.split(spliter);


    item.__nvnText__ = nonAccentVietnamese(item.__text__);
    item.__nvnWords__ = item.__nvnText__.split(spliter);

    item.__nvnTextNoneCase__ = item.__nvnText__.toLowerCase();
    item.__nvnWordsNoneCase__ = item.__nvnTextNoneCase__.split(spliter);
    return item;
}

export function prepareSearchList(items) {
    var item;
    for (var i = 0; i < items.length; ++i) {
        if (typeof items[i] == 'string') {
            items[i] = { text: items[i], value: items[i] };
        }
        item = items[i];
        prepareSearchItem(item);
        if (item.items) prepareSearchItem(item.items);
    }
    return items;
}

export function calcItemMatchScore(queryItem, item) {
    var score = 0;
    if (item.__text__ == queryItem.__text__)
        score += EQUAL_MATCH_SCORE * queryItem.__text__.length;

    var extraIndex = item.__text__.indexOf(queryItem.__text__);

    if (extraIndex >= 0) {
        score += EXTRA_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    extraIndex = item.__textNoneCase__.indexOf(queryItem.__textNoneCase__);
    if (extraIndex >= 0) {
        score += UNCASE_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    extraIndex = item.__nvnTextNoneCase__.indexOf(queryItem.__nvnTextNoneCase__);
    if (extraIndex >= 0) {
        score += UNCASE_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    score += wordsMatch(queryItem.__nvnWordsNoneCase__, item.__nvnWordsNoneCase__) / (queryItem.__nvnWordsNoneCase__.length + 1 + item.__nvnWordsNoneCase__.length) * 2 * WORD_MATCH_SCORE;
    score += wordsMatch(queryItem.__wordsNoneCase__, item.__wordsNoneCase__) / (queryItem.__wordsNoneCase__.length + 1 + item.__wordsNoneCase__.length) * 2 * WORD_MATCH_SCORE;
    return score;
}

/***
 *
 * @param  {String} query
 * @param {Array<SelectionItem>} items
 */
export function searchListByText(query, items) {
    query = (query || '').trim();
    if (query.length == 0 || items.length == 0)
        return items;
    var queryItem = prepareSearchItem({ text: query });
    var its = items.map(function (item) {
        return {
            item: item,
            score: calcItemMatchScore(queryItem, item)
        }
    });
    its.sort(function (a, b) {
        if (b.score - a.score == 0) {
            if (b.item.__nvnText__ > a.item.__nvnText__) return -1
            return 1;
        }
        return b.score - a.score;
    });
    var midValue = its[0].score / 2;
    return its.filter(function (it) {
        return it.score >= midValue;
    }).map(function (it) {
        return it.item;
    });
}

