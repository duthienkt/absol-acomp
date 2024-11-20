import ACore, { _, $ } from "../../ACore";
import '../../css/mobileapp.css';
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";


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
}


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
                    hidden: !!it.hidden
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
    });
    this.$attachHook.requestUpdateSize = this.updateSize.bind(this);
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
    if (this.$groups.length === 0) return;
    var maxChildLength = 0;
    var longestGroupElt = this.$groups[0];
    var groupElt;
    for (var i = 0; i < this.$groups.length; ++i) {
        groupElt = this.$groups[i];
        if (groupElt.$items.length > maxChildLength) {
            longestGroupElt = groupElt;
            maxChildLength = groupElt.$items.length;
        }
    }
    var style = getComputedStyle(groupElt.$itemCtn);
    var width = parseFloat(style.width.replace('px', ''));
    if (width < 10) return;
    var paddingLeft = parseFloat(style.paddingLeft.replace('px', ''));
    var paddingRight = parseFloat(style.paddingRight.replace('px', ''));
    var rowLength = Math.max(1, Math.floor((width - paddingLeft - paddingRight) / 150));
    var itemWidth = Math.floor((width - paddingLeft - paddingRight) / rowLength) - 1;
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
