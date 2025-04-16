import '../css/listcomparetool.css';
import ACore, { _, $ } from "../ACore";
import { isDomNode } from "absol/src/HTML5/Dom";
import TextMeasure from "./TextMeasure";
import Svg from "absol/src/HTML5/Svg";
import { drillProperty, mixClass } from "absol/src/HTML5/OOP";
import CheckBox from "./CheckBox";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { isRealNumber, keyStringOf } from "./utils";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import Vec2 from "absol/src/Math/Vec2";
import CMDTool, { CMDToolDelegate } from "./CMDTool";

var _g = Svg.ShareInstance._;

/**
 * @typedef ListCompareToolItem
 * @property {string} text
 * @property {string} value
 * @property {string} [icon] - mdi icon or map from tag in form
 */

/**
 * @extends {AElement}
 * @constructor
 */
function ListCompareTool() {
    this.$header = $('.as-list-compare-tool-header', this);

    this.$before = $('.as-list-compare-tool-before', this);
    this.$after = $('.as-list-compare-tool-after', this);
    this.beforeCtrl = new LCTListController(this, this.$before);
    this.afterCtrl = new LCTListController(this, this.$after);
    this.$attachhook = _('attachhook').addTo(this);
    this.$body = $('.as-list-compare-tool-body', this);
    this.$attachhook.on('attached', () => {
        ResizeSystem.add(this.$attachhook);
        this.$attachhook.requestUpdateSize();
    });

    this.$attachhook.requestUpdateSize = this.requestUpdateSize.bind(this);

    this.$operators = $('.as-list-compare-tool-operators', this);
    this.mapOperatorCtr = new LCTMapOperatorController(this);
    this.headerCtr = new LCTHeaderController(this);
    this.newLineTool = new LCTNewLineTool(this);
    this.removeLineTool = new LCTRemoveLineTool(this);
    this.cmdTool = new CMDTool();
    this.cmdDelegate = new LCTCommandDelegate(this);
    this.cmdTool.delegate = this.cmdDelegate;
    this.$header.addChildAfter(this.cmdTool.getView(), null);
    this.layoutCtr = new LCTLayoutController(this);
    drillProperty(this, this.mapOperatorCtr, 'mapOperators');
    drillProperty(this, this.beforeCtrl, 'beforeItems', 'items');
    drillProperty(this, this.afterCtrl, 'afterItems', 'items');

    /**
     * @type {ListCompareToolItem[]}
     * @memberOf ListCompareTool#
     * @name beforeItems
     */

    /**
     * @type {ListCompareToolItem[]}
     * @memberOf ListCompareTool#
     * @name afterItems
     */

    /**
     * @type {mapOperators[]}
     * @memberOf ListCompareTool#
     * @name afterItems
     */
}

ListCompareTool.tag = 'ListCompareTool';

ListCompareTool.render = function () {
    return _({
        extendEvent: 'change',
        attr: {
            tabindex: 1
        },
        class: ['as-list-compare-tool', 'as-width-auto', 'as-height-auto', 'as-max-height-auto'],
        child: [
            {
                class: 'as-list-compare-tool-header',
                child: [
                    {
                        class: 'as-list-compare-tool-check-ctn',
                        child: [

                            {
                                tag: CheckBox,
                                class: 'as-list-compare-tool-changed-only-checkbox',
                                props: {
                                    text: 'Chỉ hiện phần thay đổi',
                                    checked: false
                                }
                            }
                        ]
                    },
                ]
            },
            {
                class: 'as-list-compare-tool-body',
                child: [
                    '.as-list-compare-tool-before-title',
                    '.as-list-compare-tool-after-title',
                    {
                        class: ['as-list-compare-tool-before', 'as-bscroller'],
                    },
                    {
                        class: 'as-list-compare-tool-spacing',
                    },
                    {
                        class: ['as-list-compare-tool-after', 'as-bscroller'],
                    },
                    {
                        class: 'as-list-compare-tool-operators',
                        child: _g({
                            tag: 'svg',
                            child: [
                                {
                                    tag: 'defs',
                                    child: [
                                        {
                                            tag: 'marker',
                                            class: 'as-lct-arrow',
                                            attr: {
                                                id: 'arrow',
                                                markerWidth: '3',
                                                markerHeight: '8',
                                                orient: 'auto',
                                                refX: '4.1',
                                                refY: '4'
                                            },
                                            child: {
                                                tag: 'path',
                                                attr: { d: 'M0,0 V8 L4,4 Z' },
                                                style: { fill: 'var(--line-color)' }
                                            }
                                        },
                                        {
                                            tag: 'marker',
                                            class: 'as-lct-same-value-arrow',
                                            attr: {
                                                id: 'same-value-arrow',
                                                markerWidth: '3',
                                                markerHeight: '8',
                                                orient: 'auto',
                                                refX: '4.1',
                                                refY: '4'
                                            },
                                            child: {
                                                tag: 'path',
                                                attr: { d: 'M0,0 V8 L4,4 Z' },
                                                style: { fill: 'var(--line-color)' }
                                            }
                                        },
                                        {
                                            tag: 'marker',
                                            class: 'as-lct-new-line-arrow',
                                            attr: {
                                                id: 'new-line-arrow',
                                                markerWidth: '3',
                                                markerHeight: '8',
                                                orient: 'auto',
                                                refX: '4.1',
                                                refY: '4'
                                            },
                                            child: {
                                                tag: 'path',
                                                attr: { d: 'M0,0 V8 L4,4 Z' },
                                                style: { fill: 'var(--line-color)' }
                                            }
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                ]
            }
        ]
    });
};


ListCompareTool.property = {};


ListCompareTool.property.unchangeText = {
    set: function (text) {

    },
    get: function () {

    }
};


ListCompareTool.property.changeText = {
    set: function (text) {

    },
    get: function () {

    }
};


ListCompareTool.prototype.commands = {
    newLineTool: {
        /**
         * @this {ListCompareTool}
         */
        exec: function () {
            setTimeout(() => {
                this.removeLineTool.disable(true);
                this.newLineTool.disable(false);
                this.cmdDelegate.updateVisibility();
            });
        },
        descriptor: {
            type: 'toggle_switch',
            icon: 'span.mdi.mdi-pencil-plus',
            desc: () => 'Vẽ đường nối'
        }
    },
    removeLineTool: {
        exec: function () {
            setTimeout(() => {
                this.newLineTool.disable(true);
                this.removeLineTool.disable(false);
                this.cmdDelegate.updateVisibility();
            });
        },
        descriptor: {
            type: 'toggle_switch',
            icon: 'span.mdi.mdi-eraser',
            desc: () => 'Xóa đường nối'
        }
    }
};

ListCompareTool.prototype.requestUpdateSize = function () {
    this.layoutCtr.onSizeChange();
    this.mapOperatorCtr.updateStyleValues();
    this.mapOperatorCtr.updatePosition();
};

ListCompareTool.prototype.notifyChange = function () {
    this.emit('change', {type: 'change', target: this}, this);
};

export default ListCompareTool;
ACore.install(ListCompareTool);

/**
 * @extends CMDToolDelegate
 * @param {ListCompareTool} elt
 * @constructor
 */
function LCTCommandDelegate(elt) {
    CMDToolDelegate.call(this);
    this.elt = elt;
}

mixClass(LCTCommandDelegate, CMDToolDelegate);

LCTCommandDelegate.prototype.getCmdGroupTree = function () {
    return ['newLineTool', 'removeLineTool'];
};

LCTCommandDelegate.prototype.getCmdDescriptor = function (name) {
    if (name === 'undefined') console.trace(1)
    var res = Object.assign(this.elt.commands[name].descriptor);
    if (name === 'newLineTool') {
        res.checked = this.elt.newLineTool.state !== this.elt.newLineTool.ST_DISABLED;
    }
    else if (name === 'removeLineTool') {
        res.checked = this.elt.removeLineTool.state !== this.elt.newLineTool.ST_DISABLED;
    }
    return res;
}

LCTCommandDelegate.prototype.execCmd = function (name, ...args) {
    var cmd = this.elt.commands[name];
    if (!cmd) return;
    cmd.exec.call(this.elt, args);
}

function LCTMapOperatorController(elt) {
    this.elt = elt;
    this.$ctn = $('.as-list-compare-tool-operators', this.elt);
    this.$canvas = $('svg', this.$ctn);
    this._mapOperators = [];
    /**
     *
     * @type {LCTMapLine[]}
     */
    this.mapLines = [];
}

LCTMapOperatorController.prototype.updateStyleValues = function () {
    var bound = this.$ctn.getBoundingClientRect();
    this.$canvas.attr('viewBox', '-0.5 -0.5 ' + bound.width + ' ' + bound.height)
        .attr('width', bound.width)
        .attr('height', bound.height);
};

LCTMapOperatorController.prototype.updatePosition = function () {
    this.mapLines.forEach(line => {
        line.updatePosition();
    })
};

LCTMapOperatorController.prototype.updateModifiedItems = function () {
    var mappedValues = this.mapLines.reduce((ac, cr) => {
        if (cr.beforeValue === cr.afterValue) return ac;
        ac[keyStringOf(cr.beforeValue)] = true;
        ac[keyStringOf(cr.afterValue)] = true;
        return ac;
    }, {});

    this.elt.beforeCtrl.$items.forEach(it => {
        if (mappedValues[keyStringOf(it.value)]) {
            it.addClass('as-mapped');
        }
        else {
            it.removeClass('as-mapped');
        }
        if (this.elt.afterCtrl.hasValue(it.value)) {
            it.removeClass('as-removed');
        }
        else {
            it.addClass('as-removed');
        }
    });

    this.elt.afterCtrl.$items.forEach(it => {
        if (mappedValues[keyStringOf(it.value)]) {
            it.addClass('as-mapped');
        }
        else {
            it.removeClass('as-mapped');
        }
        if (this.elt.beforeCtrl.hasValue(it.value)) {
            it.removeClass('as-added');
        }
        else {
            it.addClass('as-added');
        }
    });
};

LCTMapOperatorController.prototype.addNewMapOp = function (beforeValue, afterValue) {
    if (!this.elt.beforeCtrl.hasValue(beforeValue) || !this.elt.afterCtrl.hasValue(afterValue)) return;
    this.mapLines = this.mapLines.filter(it => {
        if (it.beforeValue === beforeValue || it.afterValue === afterValue) {
            it.remove();
            return false;
        }
        return true;
    });
    var line = new LCTMapLine(this.elt, beforeValue, afterValue);
    this.mapLines.push(line);
    this._mapOperators = this.mapLines.filter(it => it.beforeValue !== it.afterValue).map(it => it.exportData());//save
    this.updateModifiedItems();
    this.updateStyleValues();
    this.updatePosition();
};

LCTMapOperatorController.prototype.removeLine = function (line) {
    if (line.beforeValue === line.afterValue) return;//view only line
    var idx = this.mapLines.indexOf(line);
    if (idx < 0) return;
    this.mapLines.splice(idx, 1);
    line.remove();
    var changedDict = this.mapLines.reduce((ac, it) => {
        ac[keyStringOf(it.beforeValue)] = true;
        ac[keyStringOf(it.afterValue)] = true;
        return ac;
    }, {});

    var u = line.beforeValue;
    var v = line.afterValue;
    if (this.elt.beforeCtrl.hasValue(u) && this.elt.afterCtrl.hasValue(u) && !changedDict[keyStringOf(u)]) {
        line = new LCTMapLine(this.elt, u, u);
        this.mapLines.push(line);
    }

    if (this.elt.beforeCtrl.hasValue(v) && this.elt.afterCtrl.hasValue(v) && !changedDict[keyStringOf(v)]) {
        line = new LCTMapLine(this.elt, v, v);
        this.mapLines.push(line);
    }

    this._mapOperators = this.mapLines.filter(it => it.beforeValue !== it.afterValue).map(it => it.exportData());//save
    this.updateModifiedItems();
    this.updateStyleValues();
    this.updatePosition();
};

LCTMapOperatorController.prototype.redrawMapLines = function () {
    this.mapLines.forEach(it => {
        it.remove();
    });
    this.mapLines = [];

    var beforeItems = this.elt.beforeCtrl.items;
    var changedDict = this._mapOperators.reduce((ac, it) => {
        ac[keyStringOf(it.u)] = true;
        ac[keyStringOf(it.v)] = true;
        return ac;
    }, {});

    beforeItems.forEach(it => {
        if (changedDict[keyStringOf(it.value)]) return;
        if (this.elt.afterCtrl.hasValue(it.value)) {
            var line = new LCTMapLine(this.elt, it.value, it.value);
            this.mapLines.push(line);
        }
    });

    var addedOpts = {};
    this._mapOperators.forEach(it => {
        var key = keyStringOf(it.u) + '|' + keyStringOf(it.v);
        if (addedOpts[key]) return;
        addedOpts[key] = true;
        var line = new LCTMapLine(this.elt, it.u, it.v);
        this.mapLines.push(line);
    });
};

Object.defineProperty(LCTMapOperatorController.prototype, 'mapOperators', {
    set: function (operators) {
        if (!Array.isArray(operators)) operators = [];
        this._mapOperators = operators;
        this.redrawMapLines();
        this.updateModifiedItems();
    },
    get: function () {
        return this.mapLines.filter(it => it.beforeValue !== it.afterValue).map(it => it.exportData());

    }
});

/**
 *
 * @param {ListCompareTool} elt
 * @constructor
 */
function LCTHeaderController(elt) {
    this.elt = elt;
    this.ev_viewChange = this.ev_viewChange.bind(this);
    this.$changedOnly = $('.as-list-compare-tool-changed-only-checkbox', elt);
    this.$changedOnly.on('change', this.ev_viewChange);
}

LCTHeaderController.prototype.ev_viewChange = function () {
    if (this.$changedOnly.checked)
        this.elt.addClass('as-view-changed-only');
    else {
        this.elt.removeClass('as-view-changed-only');
    }
    this.elt.requestUpdateSize();
}

/**
 *
 * @param {ListCompareTool} elt
 * @param {AElement} ctnElt
 * @constructor
 */
function LCTListController(elt, ctnElt) {
    this.elt = elt;
    /**
     *
     * @type {AElement}
     */
    this.$ctn = ctnElt;
    this.$ctn.on('scroll', this.ev_scroll.bind(this));
    /**
     *
     * @type {LCTItem[]}
     */
    this.$items = [];
    this._items = [];
    this.$itemByValue = {};
}

LCTListController.prototype.updateStyleValues = function () {
    var minWidth = this.elt.beforeCtrl.$items.reduce((ac, it) => {
        return Math.max(ac, it.minWidth);
    }, 0);
    minWidth = this.elt.afterCtrl.$items.reduce((ac, it) => {
        return Math.max(ac, it.minWidth);
    }, minWidth);
    this.elt.addStyle('--item-min-width', minWidth + 'px');
};

LCTListController.prototype.itemEltOfValue = function (value) {
    return this.$itemByValue[keyStringOf(value)] || null;
};

LCTListController.prototype.hasValue = function (value) {
    return !!this.$itemByValue[keyStringOf(value)];
};

LCTListController.prototype.ev_scroll = function () {
    this.elt.mapOperatorCtr.updatePosition();
};

Object.defineProperty(LCTListController.prototype, 'items', {
    set: function (items) {
        items = items || [];
        this._items = items;
        this.$ctn.clearChild();
        this.$items = items.map(it => _({
            tag: LCTItem,
            props: {
                text: it.text,
                value: it.value,
                icon: it.icon
            }
        }));
        this.$ctn.addChild(this.$items);
        this.$itemByValue = this.$items.reduce((ac, it) => {
            ac[keyStringOf(it.value)] = it;
            return ac;
        }, {});
        this.updateStyleValues();
        this.elt.mapOperatorCtr.updateStyleValues();
        this.elt.mapOperatorCtr.updateModifiedItems();
        this.elt.mapOperatorCtr.redrawMapLines();
    },
    get: function () {
        return this._items;
    }
});

/**
 *
 * @param {ListCompareTool} elt
 * @constructor
 */
function LCTLayoutController(elt) {
    this.elt = elt;
    this._height = 'auto';
    this._maxHeight = 'auto';
}

LCTLayoutController.prototype.setHeight = function (height) {
    this._height = this.normalizeSizeValue(height);
    this.updateHeightStyle();
};

LCTLayoutController.prototype.setMaxHeight = function (maxHeight) {
    this._maxHeight = this.normalizeSizeValue(maxHeight);
    this.updateHeightStyle();
};

LCTLayoutController.prototype.normalizeSizeValue = function (value) {
    var parsed = parseMeasureValue(value);
    if (parsed) {
        value = parsed.value + parsed.unit;
    }
    else if (typeof value === "string") {
        if (value.indexOf('calc') < 0 && value.indexOf('var') < 0) {
            value = 'auto'
        }
    }
    else value = 'auto';
    return value;
};

LCTLayoutController.prototype.updateHeightStyle = function () {
    var height = this._height;
    var maxHeight = this._maxHeight;
    if (height === 'auto') {
        this.elt.style.removeProperty('--height');
        this.elt.addClass('as-height-auto');
    }
    else {
        this.elt.style.setProperty('--height', height);
        this.elt.removeClass('as-height-auto');
    }

    if (maxHeight === 'auto') {
        this.elt.style.removeProperty('--max-height');
        this.elt.addClass('as-max-height-auto');
    }
    else {
        this.elt.style.setProperty('--max-height', maxHeight);
        this.elt.removeClass('as-max-height-auto');
    }
};

LCTLayoutController.prototype.onSizeChange = function () {
    var style = getComputedStyle(this.elt);
    var maxHeight = style.getPropertyValue('max-height');
    if (maxHeight && maxHeight.indexOf('px') >= 0) {
        maxHeight = parseFloat(maxHeight.replace('px', ''));
        this.elt.addStyle('--list-max-height', maxHeight - 66 - 22 - 20 + 'px');
    }
    else {
        this.elt.removeStyle('--list-max-height');
    }
};

/**
 * @param {ListCompareTool} elt
 * @param beforeValue
 * @param afterValue
 * @constructor
 */
function LCTMapLine(elt, beforeValue, afterValue) {
    this.beforeValue = beforeValue;
    this.afterValue = afterValue;
    this.elt = elt;
    this.$line = _g({
        tag: 'path',
        class: 'as-lct-line',
        attr: {
            'marker-end': "url(#arrow)"
        },
    });
    this.$hitBox = _g({
        tag: 'path',
        class: 'as-lct-line-hit-box',

    });

    this.$group = _g({
        tag: 'g',
        class: 'as-lct-line-group',
        child: [
            this.$line,
            this.$hitBox
        ]
    });
    this.$group.lctMapLine = this;

    this.elt.mapOperatorCtr.$canvas.addChild(this.$group);
    if (this.beforeValue === this.afterValue) {
        this.$group.addClass('as-same-value');
        this.$line.attr('marker-end', "url(#same-value-arrow)");
    }
}

LCTMapLine.prototype.exportData = function () {
    return {
        u: this.beforeValue,
        v: this.afterValue,
    }
};

LCTMapLine.prototype.updatePosition = function () {
    var beforeItemElt = this.elt.beforeCtrl.itemEltOfValue(this.beforeValue);
    var afterItemElt = this.elt.afterCtrl.itemEltOfValue(this.afterValue);
    if (!beforeItemElt || !afterItemElt) {
        this.$line.attr('d', null);
        return;
    }
    var beforeBound = beforeItemElt.getBoundingClientRect();
    if (!beforeBound.width) {
        this.$line.attr('d', null);
        this.$hitBox.attr('d', null);
        return;
    }
    var afterBound = afterItemElt.getBoundingClientRect();
    if (!afterBound.width) {
        this.$hitBox.attr('d', null);
        this.$line.attr('d', null);
        return;
    }

    var canvasBound = this.elt.mapOperatorCtr.$canvas.getBoundingClientRect();
    // if (canvasBound.top > beforeBound.bottom || canvasBound.bottom < beforeBound.top) {
    //     if (canvasBound.top > afterBound.bottom || canvasBound.bottom < afterBound.top) {
    //         this.$hitBox.attr('d', null);
    //         this.$line.attr('d', null);
    //         return;
    //     }
    // }
    var x, y;
    var canvasOffsetPoint = new Vec2(canvasBound.left, canvasBound.top);
    x = beforeBound.right - 5;
    y = beforeBound.top + beforeBound.height / 2 - 1;//1 is border
    var startPoint = new Vec2(x, y).sub(canvasOffsetPoint);
    x = afterBound.left + 5;
    y = afterBound.top + afterBound.height / 2 - 1;
    var endPoint = new Vec2(x, y).sub(canvasOffsetPoint);
    var d = 'M' + startPoint.x + ' ' + startPoint.y + ' L' + endPoint.x + ' ' + endPoint.y;
    this.$line.attr('d', d);
    this.$hitBox.attr('d', d);
};

LCTMapLine.prototype.remove = function () {
    this.$group.remove();
};

/**
 *
 * @param {ListCompareTool} elt
 * @constructor
 */
function LCTNewLineTool(elt) {
    this.elt = elt;
    this.state = this.ST_NONE;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt.on('click', this.ev_click);

    this.$beforeItem = null;
    this.$afterItem = null;

    this.$line = _g({
        tag: 'path',
        class: ['as-lct-line', 'as-new-line'],
        attr: {
            'marker-end': "url(#new-line-arrow)"
        },
    });

    this.elt.mapOperatorCtr.$canvas.addChild(this.$line);
}

LCTNewLineTool.prototype.ST_DISABLED = 'DISABLED';
LCTNewLineTool.prototype.ST_NONE = 'NONE';
LCTNewLineTool.prototype.ST_STARTED = 'STATED';

LCTNewLineTool.prototype.disable = function (flag) {
    if (this.state === this.ST_NONE && flag) {
        this.state = this.ST_DISABLED;
    }
    else if (this.state === this.ST_DISABLED && !flag) {
        this.state = this.ST_NONE;
    }
}

LCTNewLineTool.prototype.findItemElt = function (elt) {
    while (elt) {
        if (elt.hasClass && elt.hasClass('as-lct-item')) {
            return elt;
        }
        elt = elt.parentElement;
    }
    return null;
}

LCTNewLineTool.prototype.isBeforeItemElt = function (elt) {
    return elt && elt.isDescendantOf(this.elt.beforeCtrl.$ctn);
};

LCTNewLineTool.prototype.ev_click = function (event) {
    var itemElt;
    if (this.state === this.ST_NONE) {
        itemElt = this.findItemElt(event.target);
        if (itemElt && (itemElt.hasClass('as-removed') || itemElt.hasClass('as-added'))) {
            if (this.isBeforeItemElt(itemElt)) {
                this.$beforeItem = itemElt;
            }
            else {
                this.$afterItem = itemElt;
            }
            itemElt.addClass('as-active');
            this.state = this.ST_STARTED;
            setTimeout(() => {
                document.addEventListener('click', this.ev_clickOut);
            }, 1);
            document.addEventListener('mousemove', this.ev_mouseMove);
        }
    }
    else if (this.state === this.ST_STARTED) {
        itemElt = this.findItemElt(event.target);
        if (itemElt && (itemElt.hasClass('as-removed') || itemElt.hasClass('as-added'))) {
            if (this.isBeforeItemElt(itemElt)) {
                if (this.$beforeItem) {
                    this.$beforeItem.removeClass('as-active');
                }
                if (this.$beforeItem === itemElt) {
                    this.$beforeItem = null;
                }
                else {
                    this.$beforeItem = itemElt;
                    itemElt.addClass('as-active');
                }
            }
            else {
                if (this.$afterItem) {
                    this.$afterItem.removeClass('as-active');
                }
                if (this.$afterItem === itemElt) {
                    this.$afterItem = null;
                }
                else {
                    this.$afterItem = itemElt;
                    itemElt.addClass('as-active');
                }
            }

            if (this.$beforeItem && this.$afterItem) {
                this.elt.mapOperatorCtr.addNewMapOp(this.$beforeItem.value, this.$afterItem.value);
                this.$beforeItem.removeClass('as-active');
                this.$afterItem.removeClass('as-active');
                this.state = this.ST_NONE;
                this.elt.notifyChange();
            }
            else if (!this.$beforeItem && !this.$afterItem) {
                this.state = this.ST_NONE;
            }
            else {
                this.$line.attr('d', null);
            }
        }
        else {

        }

        if (this.state === this.ST_NONE) {//finish
            this.$beforeItem = null;
            this.$afterItem = null;
            this.$line.attr('d', null);
            document.removeEventListener('click', this.ev_clickOut);
            document.removeEventListener('mousemove', this.ev_mouseMove);
        }
    }
};


LCTNewLineTool.prototype.ev_mouseMove = function (event) {
    if (this.state !== this.ST_STARTED) return;
    var currentPoint = new Vec2(event.clientX, event.clientY);
    var startPoint;
    var endPoint;
    var canvasBound = this.elt.mapOperatorCtr.$canvas.getBoundingClientRect();
    var canvasOffsetPoint = new Vec2(canvasBound.left, canvasBound.top);
    var itemBound;
    if (this.$beforeItem) {
        itemBound = this.$beforeItem.getBoundingClientRect();
        startPoint = new Vec2(itemBound.right - 5, itemBound.top + itemBound.height / 2 - 1).sub(canvasOffsetPoint);
        endPoint = currentPoint.sub(canvasOffsetPoint);
    }
    else if (this.$afterItem) {
        itemBound = this.$afterItem.getBoundingClientRect();
        startPoint = currentPoint.sub(canvasOffsetPoint);
        endPoint = new Vec2(itemBound.left + 5, itemBound.top + itemBound.height / 2 - 1).sub(canvasOffsetPoint);
    }
    this.$line.attr('d', 'M' + startPoint.x + ' ' + startPoint.y + ' L' + endPoint.x + ' ' + endPoint.y);
};

LCTNewLineTool.prototype.ev_clickOut = function (event) {
    var itemElt = this.findItemElt(event.target);
    if (itemElt && (itemElt.hasClass('as-removed') || itemElt.hasClass('as-added'))) return;
    if (this.$beforeItem) {
        this.$beforeItem.removeClass('as-active');
    }
    if (this.$afterItem) {
        this.$afterItem.removeClass('as-active');
    }
    this.$beforeItem = null;
    this.$afterItem = null;
    this.$line.attr('d', null);
    this.state = this.ST_NONE;
    document.removeEventListener('click', this.ev_clickOut);
    document.removeEventListener('mousemove', this.ev_mouseMove);
}

LCTNewLineTool.prototype.ev_keydown = function (event) {

};

function LCTRemoveLineTool(elt) {
    this.elt = elt;
    this.state = this.ST_DISABLED;
    this.$cursor = null;
    this.ev_mouseMove = this.ev_mouseMove.bind(this);
    this.ev_click = this.ev_click.bind(this);
    this.elt.mapOperatorCtr.$canvas.on('click', this.ev_click);

}

LCTRemoveLineTool.prototype.ST_DISABLED = 'DISABLED';
LCTRemoveLineTool.prototype.ST_NONE = 'NONE';

LCTRemoveLineTool.prototype.disable = function (flag) {
    if (this.state === this.ST_NONE && flag) {
        this.state = this.ST_DISABLED;
        this.elt.removeClass('as-remove-line-tool-active');
        this.$cursor.remove();
    }
    else if (this.state === this.ST_DISABLED && !flag) {
        this.state = this.ST_NONE;
        this.elt.addClass('as-remove-line-tool-active');
        this.$cursor = _({
            class: 'as-lct-cursor',
            child: 'span.mdi.mdi-eraser'
        }).addTo(this.elt.$body);
        document.addEventListener('mousemove', this.ev_mouseMove);
    }
}


LCTRemoveLineTool.prototype.findMapLine = function (elt) {
    while (elt) {
        if (elt.lctMapLine) {
            return elt.lctMapLine;
        }
        elt = elt.parentElement;
    }
    return null;
}

LCTRemoveLineTool.prototype.ev_click = function (event) {
    if (this.state === this.ST_DISABLED) return;
    var line = this.findMapLine(event.target);
    if (line) {
        this.elt.mapOperatorCtr.removeLine(line);
        this.elt.notifyChange();
    }
};

LCTRemoveLineTool.prototype.ev_mouseMove = function (event) {
    var point = new Vec2(event.clientX, event.clientY);
    var bodyBound = this.elt.$body.getBoundingClientRect();
    if (bodyBound.width === 0) {
        document.removeEventListener('mousemove', this.ev_mouseMove);//element is removed
    }
    point = point.sub(new Vec2(bodyBound.left, bodyBound.top));
    this.$cursor.addStyle({
        left: point.x - 9 + 'px',
        top: point.y - 24 + 'px'
    });
};

LCTRemoveLineTool.prototype.ev_mouseDown = function (event) {

};


LCTRemoveLineTool.prototype.ev_mouseUp = function (event) {

};


/**
 * @extends {AElement}
 * @constructor
 */
function LCTItem() {
    this.$text = $('.as-lct-item-text', this);
    this.$iconCtn = $('.as-lct-item-icon-ctn', this);
    this._icon = null;

    /**
     * @name icon
     * @memberOf LCTItem#
     */
    /**
     * @type string
     * @name text
     * @memberOf LCTItem#
     */

    /**
     * @type any
     * @name value
     * @memberOf LCTItem#
     */

    /**
     * @type number
     * @name minWidth
     * @memberOf LCTItem#
     */
}

LCTItem.tag = 'LCTItem'.toLowerCase();

LCTItem.render = function () {
    return _({
        class: 'as-lct-item',
        child: [
            {
                class: 'as-lct-item-icon-ctn',
            },
            {
                class: 'as-lct-item-text'
            }
        ]
    });
};


LCTItem.property = {};

LCTItem.property.text = {
    set: function (value) {
        value = value || '';
        value = value + '';
        this.$text.attr('data-text', value);
    },
    get: function () {
        return this.$text.attr('data-text');
    }
};

LCTItem.property.value = {
    set: function (value) {
        this._value = value;
        this.attr('data-value', value + '');
    },
    get: function () {
        return this._value;
    }
};

LCTItem.property.icon = {
    set: function (value) {
        value = value || '';
        this._icon = value;
        this.$iconCtn.clearChild();
        this.$icon = null;
        if (value) {
            if (isDomNode(value)) {
                if (value.parentElement) value = value.cloneNode(true);
            }
            else value = _(value);
            this.$icon = $(value).addClass('as-lct-icon');
            this.$iconCtn.addChild(this.$icon);
        }
    },
    get: function () {
        return this._icon;
    }
};

LCTItem.property.minWidth = {
    get: function () {
        var res = 25 + 10;
        res += TextMeasure.measureWidth(this.text, TextMeasure.FONT_ARIAL, 14) + 20;
        return Math.ceil(res)
    }
};