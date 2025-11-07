import ACore, { _, $ } from "../../ACore";
import '../../css/mobileapp.css';
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import Context from "absol/src/AppPattern/Context";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import SearchTextInput from "../Searcher";
import { phraseMatch, wordLike, wordsMatch } from "absol/src/String/stringMatching";
import { harmonicMean } from "absol/src/Math/int";
import { isNaturalNumber } from "../utils";
import { implicitNaturalNumber } from "absol/src/Converter/DataTypes";


var makeTextToNode = (data, pElt) => {
    var node;
    if (typeof data === "string") {
        node = _({ text: data });
    }
    else if (data instanceof Array) {
        data.forEach(it => makeTextToNode(it, pElt));
    }
    if (node)
        pElt.addChild(node);
}

var makeIconToNode = (data, pElt) => {
    var node;
    if (data) node = _(data);
    pElt.clearChild();
    if (node) pElt.addChild(node);
}

export function MExploreSectionBreak() {
    this._name = '';
    this.$name = $('.am-explore-section-break-name', this);
}

MExploreSectionBreak.tag = 'MExploreSectionBreak'.toLowerCase();

MExploreSectionBreak.render = function () {
    return _({
        class: 'am-explore-section-break',
        child: [
            {
                class: 'am-explore-section-break-name',
            },
            '.am-explore-section-break-line'
        ]
    });
};

MExploreSectionBreak.property = {};

MExploreSectionBreak.property.name = {
    set: function (value) {
        if (value === null || value === undefined) value = '';
        this._name = value;
        this.$name.clearChild();
        makeTextToNode(value, this.$name);

    },
    get: function () {
        return this._name;
    }
};


export function MExploreItemBlock() {
    this.$name = $('.am-explore-item-block-name', this);
    this._name = '';
    this._icon = null;
    this.$icon = $('.am-explore-item-block-icon', this);
    this.$name = $('.am-explore-item-block-name', this);

    /**
     * @name name
     * @type {string}
     * @memberof MExploreItemBlock#
     */

    /**
     * @name icon
     * @memberof MExploreItemBlock#
     */
}


MExploreItemBlock.tag = 'MExploreItemBlock'.toLowerCase();

MExploreItemBlock.render = function () {
    return _({
        attr: {
            tabindex: '1'
        },
        class: 'am-explore-item-block',
        child: [
            {
                class: 'am-explore-item-block-icon'
            },
            {
                class: 'am-explore-item-block-name'
            }
        ]
    });
};

MExploreItemBlock.property = {};

MExploreItemBlock.property.icon = {
    set: function (value) {
        value = value || null;
        this._icon = value;
        makeIconToNode(value, this.$icon)
    },
    get: function () {
        return this._icon;
    }
};

MExploreItemBlock.property.name = {
    set: function (value) {
        if (value === null || value === undefined) value = '';
        makeTextToNode(value, this.$name);
        this._name = value;
    },
    get: function () {
        return this._name;
    }
};

MExploreItemBlock.property.hidden = {
    set: function (value) {
        if (value) {
            this.addClass('as-hidden');
        }
        else {
            this.removeClass('as-hidden');
        }
    },
    get: function () {
        return this.hasClass('as-hidden');
    }
};

MExploreItemBlock.property.count = {
    set: function (value) {
        value = implicitNaturalNumber(value);
        if (!isNaturalNumber(value)) value = 0;
        if (value) {
            this.$icon.attr('data-count', value);
        }
        else {
            this.$icon.attr('data-count', null);
        }
        this._count = value;
    },
    get: function () {
        var value = this._count;
        if (!isNaturalNumber(value)) value = 0;
        return value;
    }
};

MExploreItemBlock.property.value = {
    set: function (value) {
        if (value === null || value === undefined) value = null;
        this._value = value;
        if (value === null){
            this.attr('data-value', null);
        }
        else {
            this.attr('data-value', value + '');
        }
    },
    get: function () {
        var value = this._value;
        if (value === null || value === undefined) value = null;
        return value;
    }
};


export function MExploreItemList() {

}

MExploreItemList.tag = 'MExploreItemList'.toLowerCase();


MExploreItemList.render = function () {

}

/**
 * @extends AElement
 * @constructor
 */
export function MExploreGroup() {
    this.$br = $(MExploreSectionBreak.tag, this);
    this._items = [];
    this.$items = [];
    this.$itemCtn = $('.am-explore-group-item-ctn', this);
    /**
     * @name name
     * @type {string}
     * @memberof MExploreGroup#

     /**
     * @name items
     * @type {[]}
     * @memberof MExploreGroup#
     */
}


MExploreGroup.tag = 'MExploreGroup'.toLowerCase();


MExploreGroup.render = function () {
    return _({
        class: 'am-explore-group',
        extendEvent: ['press'],
        child: [
            {
                tag: MExploreSectionBreak
            },
            {
                class: 'am-explore-group-item-ctn'
            }
        ]
    });
};


MExploreGroup.property = {};
MExploreGroup.property.name = {
    set: function (value) {
        value = value || '';
        this.$br.name = value;
        if (value) {
            this.$br.removeStyle('display');
        }
        else {
            this.$br.addStyle('display', 'none');
        }
    },
    get: function () {
        return this.$br.name;
    }
};

MExploreGroup.property.items = {
    /**
     * @this MExploreGroup
     * @param items
     */
    set: function (items) {
        if (!items || !items.slice || !items.map) items = [];
        items = items.slice();
        this._items = items;
        while (this.$items.length) {
            this.$items.pop().selfRemove();
        }
        this.$items = items.map(it => {
            var elt = _({
                tag: MExploreItemBlock,
                props: {
                    data: it,
                    name: it.name,
                    icon: it.icon,
                    hidden: !!it.hidden,
                    count: it.count
                },
                on: {
                    click: event => {
                        this.emit('press', {
                            type: 'press',
                            target: elt,
                            itemData: it,
                            originalEvent: event,
                            itemElt: elt
                        }, this);
                    }
                }
            });
            return elt;
        });
        this.$itemCtn.addChild(this.$items);
    },
    get: function () {
        return this._items;
    }
}

MExploreGroup.property.hidden = {
    set: function (value) {
        if (value) {
            this.addClass('as-hidden');
        }
        else {
            this.removeClass('as-hidden');
        }
    },
    get: function () {
        return this.hasClass('as-hidden');
    }
};

/**
 * @extends AElement
 * @constructor
 */
export function MSpringboardMenu() {
    if (BrowserDetector.isMobile) {
        this.addClass('as-mobile');
    }
    this.keyboardCtrl = new MSMKeyboardController(this);
    this.$groups = [];
    this.$attachHook = _('attachhook').addTo(this);
    this.$attachHook.on('attached', () => {
        ResizeSystem.add(this);
        this.updateSize();
        this.keyboardCtrl.lowPriorityFocus();
        if (obs) {
            obs.disconnect();
            obs = null;
        }
    });
    this.$attachHook.requestUpdateSize = this.updateSize.bind(this);
    var obs = new  IntersectionObserver(entries => {
        this.updateSize();
    }, {
        root: document.body,
    });

    obs.observe(this);

    this.searchingPlugin = new MSMSearchingPlugin(this);
    /**
     * @name searching
     * @type {{input: SearchTextInput, items: []}}
     * @memberof MSpringboardMenu#
     */
}

MSpringboardMenu.tag = 'MSpringboardMenu'.toLowerCase();

MSpringboardMenu.render = function () {
    return _({
        attr: {
            tabindex: '1'
        },
        class: 'am-springboard-menu',
        extendEvent: ['press']
    });
};


MSpringboardMenu.prototype.updateSize = function () {
    if (!this.isDescendantOf(document.body)) return;
    if (!BrowserDetector.isMobile) return;
    if (this.$groups.length === 0) return;
    var maxChildLength = 0;
    var longestGroupElt = this.$groups[0];
    var groupElt;
    var childN;
    for (var i = 0; i < this.$groups.length; ++i) {
        groupElt = this.$groups[i];
        if (groupElt.hasClass('as-hidden')) continue;
        childN = groupElt.$items.filter(e => !e.hasClass('as-hidden')).length;
        if (childN > maxChildLength) {
            longestGroupElt = groupElt;
            if (groupElt)
                maxChildLength = childN;
        }
    }
    var style = getComputedStyle(longestGroupElt.$itemCtn);
    var width = parseFloat(style.width.replace('px', ''));
    if (width < 10) return;
    var paddingLeft = parseFloat(style.paddingLeft.replace('px', ''));
    var paddingRight = parseFloat(style.paddingRight.replace('px', ''));
    var availableWidth = width - paddingLeft - paddingRight;
    var itemWidth = this.hasClass('as-mobile') ? (90 * Math.max(1, Math.sqrt(width/400))) : 150;
    var rowLength = Math.max(1, Math.floor( availableWidth/ itemWidth));
    itemWidth = Math.floor(availableWidth / rowLength) - 1;
    this.addStyle('--item-width', itemWidth + 'px');
};


MSpringboardMenu.property = {};

MSpringboardMenu.property.groups = {
    /**
     * @this MSpringboardMenu
     * @param groups
     */
    set: function (groups) {
        if (!(groups instanceof Array)) groups = [];
        this.$groups.forEach(elt => elt.selfRemove());
        this.$groups = groups.map(group => {
            var hidden = group.hidden || !group.items || group.items.length === 0 || group.items.every(it => it.hidden);
            var elt = _({
                tag: MExploreGroup,
                props: {
                    data: group,
                    name: group.name,
                    items: group.items || [],
                    hidden: hidden
                },
                on: {
                    press: (event) => {
                        this.emit('press', Object.assign({ groupElt: elt, groupData: group }, event), this);
                    }
                }
            });
            return elt;
        });
        this.addChild(this.$groups);
        this.updateSize();
    },
    get: function () {
        return this.$groups.map(gr => gr.data);
    }
};

ACore.install(MSpringboardMenu);

/**
 *
 * @param {MSpringboardMenu}  elt
 * @constructor
 */
function MSMKeyboardController(elt) {
    this.elt = elt;
    if (!BrowserDetector.isMobile)
        this.elt.on('keydown', this.ev_keydown.bind(this));
    this.itemsMatrix = [];
}

MSMKeyboardController.prototype.canLowPriorityFocus = function () {
    var elt = document.activeElement;
    if (!elt || elt === document.body || elt === this.elt) {
        return true;
    }
    if (elt.hasClass && elt.hasClass('am-explore-item-block') && elt.isDescendantOf(this.elt)) return false;
    var style;
    while (elt && elt !== document.body && elt !== this.elt) {
        style = getComputedStyle(elt);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return true;
        }
        elt = elt.parentElement;
    }

    return false;
};

MSMKeyboardController.prototype.lowPriorityFocus = function () {
    if (!this.canLowPriorityFocus()) return;
    this.elt.focus();
    // var firstItem = null;
    // for (var i = 0; i < this.elt.$groups.length; ++i) {
    //     var group = this.elt.$groups[i];
    //     if (group.$items.length > 0) {
    //         firstItem = group.$items[0];
    //         break;
    //     }
    // }
    // if (firstItem) {
    //     firstItem.focus();
    // }
};

MSMKeyboardController.prototype.calcItemsMatrix = function () {
    var arr = [];
    var group;
    var item;
    for (var i = 0; i < this.elt.$groups.length; ++i) {
        group = this.elt.$groups[i];
        for (var j = 0; j < group.$items.length; ++j) {
            item = group.$items[j];
            if (item.hidden) continue;
            arr.push(item);

        }
    }
    arr = arr.map(item => {
        var rect = item.getBoundingClientRect();
        return {
            item: item,
            ii: Math.round(rect.top / 30),
            jj: Math.round(rect.left / 30)
        }
    });
    var rows = arr.reduce((ac, it) => {
        ac[it.ii] = ac[it.ii] || [];
        ac[it.ii].push(it);
        return ac;
    }, {});
    rows = Object.values(rows);
    rows.sort((a, b) => {
        return a[0].ii - b[0].ii;
    });
    rows.forEach(row => {
        row.sort((a, b) => {
            return a.jj - b.jj;
        });
    });
    this.itemsMatrix = rows.map(row => row.map(it => it.item));
    return rows;
};

MSMKeyboardController.prototype.findItemsStartsWith = function (prefix) {
    prefix = prefix.toLowerCase();
    var res = [];
    var group;
    var item;
    for (var i = 0; i < this.elt.$groups.length; ++i) {
        group = this.elt.$groups[i];
        for (var j = 0; j < group.$items.length; ++j) {
            item = group.$items[j];
            if (item.hidden) continue;
            if (nonAccentVietnamese(item.name.toLowerCase()).startsWith(prefix)) {
                res.push(item);
            }
        }
    }
    return res;
};

/**
 *
 * @param  elt
 */
MSMKeyboardController.prototype.positionOf = function (elt) {
    if (!elt) return null;
    if (elt.hidden) return null;
    var row;
    var item;
    for (var i = 0; i < this.itemsMatrix.length; ++i) {
        row = this.itemsMatrix[i];
        for (var j = 0; j < row.length; ++j) {
            item = row[j];
            if (item === elt) {
                return [i, j];

            }
        }
    }
    return null;
};

MSMKeyboardController.prototype.ev_keydown = function (event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    var key = keyboardEventToKeyBindingIdent(event);
    var focusElt = document.activeElement;
    if (!focusElt || !focusElt.hasClass) focusElt = null;
    if (focusElt && !focusElt.hasClass('am-explore-item-block')) focusElt = null;
    if (focusElt && focusElt.hidden) focusElt = null;
    if (focusElt && !focusElt.isDescendantOf(this.elt)) focusElt = null;
    var focusIdx;
    var itemEltArr;
    var itemPos;
    if (key.length === 1) {
        itemEltArr = this.findItemsStartsWith(key);
        focusIdx = itemEltArr.indexOf(focusElt);
        if (itemEltArr.length > 0) {
            itemEltArr[(focusIdx + 1) % itemEltArr.length].focus();
        }
    }
    else if (['arrowdown', 'arrowup', 'arrowleft', 'arrowright'].indexOf(key) >= 0) {
        event.preventDefault();
        this.calcItemsMatrix();
        itemPos = this.positionOf(focusElt);
        switch (key) {
            case 'arrowdown':
                itemPos = itemPos || [-1, 0];
                if (itemPos[0] < this.itemsMatrix.length - 1) {
                    itemPos[0]++;
                    itemPos[1] = Math.min(itemPos[1], this.itemsMatrix[itemPos[0]].length - 1);
                }

                break;
            case 'arrowup':
                itemPos = itemPos || [1, 0];
                if (itemPos[0] > 0) {
                    itemPos[0]--;
                    itemPos[1] = Math.min(itemPos[1], this.itemsMatrix[itemPos[0]].length - 1);
                }
                break;
            case 'arrowleft':
                itemPos = itemPos || [0, 1];
                if (itemPos[1] > 0) {
                    itemPos[1]--;
                }
                else if (itemPos[0] > 0) {
                    itemPos[0]--;
                    itemPos[1] = this.itemsMatrix[itemPos[0]].length - 1;
                }

                break;
            case 'arrowright':
                itemPos = itemPos || [0, -1];
                if (itemPos[1] < this.itemsMatrix[itemPos[0]].length - 1) {
                    itemPos[1]++;
                }
                else if (itemPos[0] < this.itemsMatrix.length - 1) {
                    itemPos[0]++;
                    itemPos[1] = 0;
                }
                break;
        }
        focusElt = this.itemsMatrix[itemPos[0]] && this.itemsMatrix[itemPos[0]][itemPos[1]];
        if (focusElt) focusElt.focus();
    }
    else if (key === 'enter') {
        event.preventDefault();
        if (focusElt) focusElt.click();
    }
};

/**
 * @extends Context
 * @param {MSpringboardMenu} elt
 * @constructor
 */
function MSMSearchingPlugin(elt) {
    Context.call(this);
    this.elt = elt;
    this._data = null;
    OOP.drillProperty(this.elt, this, 'searching', 'data');
    this.ev_inputStopTyping = this.ev_inputStopTyping.bind(this);
    /**
     * @type {SearchTextInput|null}
     */
    this.$input = null;
    this.itemHolders = [];
    this.$seachGroups = [];
}


mixClass(MSMSearchingPlugin, Context);

MSMSearchingPlugin.prototype.onStart = function () {
    this.$input = this._data && this._data.input;
    if (!this.$input) {
        this.$input = _({
            tag: SearchTextInput
        });
        this.elt.addChildBefore(this.$input, this.elt.firstChild);
    }

    this.$input.on('stoptyping', this.ev_inputStopTyping);
    this.calcItemHoldersFromItems();
};

MSMSearchingPlugin.prototype.calcItemHoldersFromItems = function () {
    // var holders = [];
    var count = 0;

    var virtualGroups = [];


    var visit = (item, parent) => {
        if (item.hidden) return;
        count++;
        var holder = this.makeHolder(item);
        holder.path = parent.path.concat([parent.item.name]);
        holder.count = count;
        if (holder.type === 'group') {
            virtualGroups.push(holder);
        }
        else {
            parent.children = parent.children || [];
            parent.children.push(holder);
        }

        if (item.items && item.items.length > 0) {
            if (holder.type !== 'group') {
                holder = Object.assign({}, holder, { type: 'group', children: [] });
                virtualGroups.push(holder);
            }
            item.items.forEach((child) => visit(child, holder));
        }
    }

    var rootHolder = Object.assign({},
        this.makeHolder({ name: 'root' }),
        {
            children: [],
            path: [],
            type: 'group'
        });
    virtualGroups.push(rootHolder);
    this._data.items.forEach((item) => visit(item, rootHolder));
    virtualGroups = virtualGroups.filter(it => it.children && it.children.length > 0);
    this.itemHolders = virtualGroups;
};

MSMSearchingPlugin.prototype.onResume = function () {
    this.elt.addClass('as-searching');
    //view search
};


MSMSearchingPlugin.prototype.onPause = function () {
    this.elt.removeClass('as-searching');
    //view origin
};

MSMSearchingPlugin.prototype.onStop = function () {
    this.$input.off('stopchange', this.ev_inputStopTyping);
    if (this.$input.isDescendantOf(this.elt)) {
        this.$input.remove();
    }

    //turn off event
};

MSMSearchingPlugin.prototype.makeHolder = function (item) {
    var spliter = /[\s,-\.+?\_]+/;
    var notEmp = function (e) {
        return e.length > 0;
    };
    var res = {
        item: item,
        text: item.name || item.searchName || '',
        hidden: !!item.hidden,
        type: item.type
    };
    if (item.hidden) return res;
    res.text = res.text.toLowerCase();
    res.words = res.text.split(spliter).filter(notEmp);
    res.text = res.words.join(' ');
    res.nacWords = res.words.map(txt => nonAccentVietnamese(txt));
    res.nacText = res.nacWords.join(' ');
    res.wordDict = res.words.reduce((ac, cr) => {
        ac[cr] = true;
        return ac;
    }, {});
    res.nacWordDict = res.nacWords.reduce((ac, cr) => {
        ac[cr] = true;
        return ac;
    }, {});
    return res;
};

MSMSearchingPlugin.prototype.calcScore = function (queryHolder, itemHolder) {
    var score = 0;
    var mustIncluded = false;
    if (itemHolder.nacText.indexOf(queryHolder.nacText) >= 0) mustIncluded = true;
    if (itemHolder.text.indexOf(queryHolder.text) >= 0) mustIncluded = true;
    score += wordsMatch(queryHolder.words, itemHolder.words) / (harmonicMean(queryHolder.words.length, itemHolder.words.length) || 1);
    score += wordsMatch(queryHolder.nacWords, itemHolder.nacWords) / (harmonicMean(queryHolder.nacWords.length, itemHolder.nacWords.length) || 1);
    var dict = Object.keys(itemHolder.nacWordDict);
    Object.keys(queryHolder.nacWordDict).forEach(function (qWord) {
        var bestWordScore = 0;
        var bestWord = '';
        var word;
        for (word in dict) {
            if (wordLike(qWord, word) > bestWordScore) {
                bestWordScore = wordLike(qWord, word);
                bestWord = word;
            }
        }
        if (bestWordScore > 0) {
            score += bestWordScore / (harmonicMean(qWord.length, bestWord.length) || 1);
            delete dict[bestWord];
        }
    });

    return { score: score, mustIncluded: mustIncluded };
};


MSMSearchingPlugin.prototype.ev_inputStopTyping = function () {
    var query = this.$input.value;
    this.query(query);
};

MSMSearchingPlugin.prototype.query = function (query) {
    query = query || '';
    query = query.trim();

    if (query && query.length > 0 && this.state !== 'RUNNING') {
        this.start();
    }
    else if (!query || query.length === 0) {
        this.pause();
        return;
    }

    var scoreList = [];
    var queryHolder = this.makeHolder({ name: query }, -1);
    var visit2calcScore = (holder) => {
        var res = Object.assign({
            item: holder.item,
            type: holder.type,
            path: holder.path
        }, this.calcScore(queryHolder, holder));
        scoreList.push(res.score);
        if (holder.children) {
            res.children = holder.children.map(visit2calcScore);
            res.childrenScore = res.children.reduce((ac, cr) => Math.max(ac, cr.score, cr.childrenScore || 0), 0);
            res.treeScore = Math.max(res.score, res.childrenScore || 0);
        }
        return res;
    };

    var itemsHolders = this.itemHolders.map(visit2calcScore);
    scoreList.push(0);
    scoreList.sort((a, b) => b - a);
    var maxScore = scoreList[0] || 0;
    var midScore;
    if (maxScore < 1) {
        midScore = Math.max(maxScore - 0.2, 0.1);
        midScore = Math.max(midScore, scoreList[Math.floor(scoreList.length * 0.2 * maxScore)] - 0.01);

    }
    else {
        midScore = maxScore * 0.6;
        midScore = Math.max(midScore, scoreList[Math.floor(scoreList.length * 0.3)] - 0.1);
    }

    var visit2filter = function (holder) {
        var score = holder.score;
        var childrenScore = holder.childrenScore || 0;
        if (holder.mustIncluded) return true;
        if (score >= midScore && childrenScore <= score) return true;
        if (holder.children) {
            holder.children = holder.children.filter(visit2filter);
            return holder.children.length > 0;
        }
        return false;
    };

    itemsHolders = itemsHolders.filter(visit2filter);

    itemsHolders.forEach(holder => {
        if (holder.children)
            holder.children.sort((a, b) => b.treeScore - a.treeScore);
    });

    itemsHolders.sort((a, b) => b.treeScore - a.treeScore);

    this.$seachGroups.forEach(elt => elt.remove());
    this.$seachGroups = itemsHolders.map(holder => {
        var elt = _({
            tag: MExploreGroup,
            class: 'as-search-result',
            props: {},
            on: {
                press: (event) => {
                    this.elt.emit('press', Object.assign({ groupElt: elt, groupData: holder.item }, event), this.elt);
                }
            }
        });
        if (window.ABSOL_DEBUG) {
            elt.attr('title', 'score: ' + holder.score + ', childrenScore: ' + holder.childrenScore);
        }
        if (holder.item.name === 'root') {
            elt.name = '/';
        }
        else {
            elt.name = holder.path.slice(1).concat(holder.item.name).join(' / ');
        }
        if (holder.children) {
            elt.items = holder.children.map(child => Object.assign({ score: child.score }, child.item));
        }

        return elt;
    });
    this.elt.addChild(this.$seachGroups);
};


Object.defineProperty(MSMSearchingPlugin.prototype, 'data', {
    get: function () {
        return this._data;
    },
    set: function (value) {
        this.stop();
        value = value || null;
        if (value && !value.items) value = null;
        if (value && !value.items.length) value = null;
        this._data = value;
        if (value) this.start(true);
    }
});
