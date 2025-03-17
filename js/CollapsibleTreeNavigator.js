import ACore, { _, $ } from "../ACore";
import '../css/collapsibletreenavigator.css';
import { isNaturalNumber, keyStringOf, measureText } from "./utils";
import { randomIdent } from "absol/src/String/stringGenerate";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import Color from "absol/src/Color/Color";

/**
 * note
 * CTCollapsibleNode can only be selected when it has no children and noSelect = false.
 * CTNNode can be selected and can have children.
 */

/**
 * @typedef {Object} CTNItemData
 * @property {string} text
 * @property {any} string
 * @property  [icon]
 * @property [noSelect] - default = false
 */

/**
 * @extends AElement
 * @constructor
 */
function CollapsibleTreeNavigator() {
    /**
     *
     * @type {CTRoot}
     */
    this.root = new CTRoot(this);

    /**
     * @type {{text:string, id:any, actiions:{}[]}[]}
     * @name items
     * @memberOf CollapsibleTreeNavigator#
     */

    /**
     * @type {any}
     * @name value
     * @memberOf CollapsibleTreeNavigator#
     */
}

CollapsibleTreeNavigator.tag = 'CollapsibleTreeNavigator'.toLowerCase();

CollapsibleTreeNavigator.render = function () {
    return _({
        class: 'as-collapsible-tree-navigator',
        extendEvent: ['change', 'action']
    });
};

CollapsibleTreeNavigator.prototype.nodeOf = function (nodeValue) {
    return this.root.nodeOf(nodeValue);
};

CollapsibleTreeNavigator.prototype.updateNode = function (nodeValue, fieldName, value) {
    var nd = this.nodeOf(nodeValue);
    if (!nd) return;
    nd.rawData[fieldName] = value;
    if (['items', 'text', 'icon', 'value', 'count', 'color'].indexOf(fieldName) >= 0) {
        nd[fieldName] = value;
        this.root.updateSize();
    }
};


/**
 *
 * @param {any=}data
 */
CollapsibleTreeNavigator.prototype.notifyChange = function (data) {
    var nd;
    if (!data) {//fallback
        nd = this.root.nodeByValue[keyStringOf(this.value)];
        data = nd && nd.data;
    }
    data = data || null;
    var value = this.value;
    if (data) value = data.value;
    this.emit('change', { type: 'change', value: value, data: data }, this);
};


CollapsibleTreeNavigator.property = {};

CollapsibleTreeNavigator.property.value = {
    set: function (value) {
        this.root.value = value;
    },
    get: function () {
        return this.root.value;
    }
};

CollapsibleTreeNavigator.property.items = {
    set: function (items) {
        this.root.items = items;
    },
    get: function () {
        return this.root.items;
    }
};


ACore.install(CollapsibleTreeNavigator);

export default CollapsibleTreeNavigator;

/**
 *
 * @param {CollapsibleTreeNavigator} elt
 * @constructor
 */
function CTRoot(elt) {
    this.elt = elt;
    /**
     *
     * @type {CTCollapsibleNode[]}
     */
    this.children = [];
    this.nodeByValue = {};
    this.iconCount = 0;
    this.level = 0;
    this.looked = 0;
}

CTRoot.prototype.nodeOf = function (nodeValue) {
    return this.nodeByValue[keyStringOf(nodeValue)];
}

CTRoot.prototype.updateSelectedLine = function () {
    if (this.looked) return;
    var selectedNode = this.nodeOf(this.value);
    if (!selectedNode) return;
    var path = [];
    var c = selectedNode;
    while (c && c !== this) {
        path.unshift(c);
        c = c.parent;
    }
    var viewingNode = null;
    while (path.length) {
        c = path.shift();
        viewingNode = c;
        if (c.status !== 'open') {
            break;
        }
    }

    if (!viewingNode) return;
    this.elt.addStyle('--selected-y', viewingNode.offsetY + 'px');
};

CTRoot.prototype.updateSize = function () {
    if (this.looked) return;
    this.elt.addStyle('min-width', Math.ceil(this.minWidth) + 'px');
    if (this.elt.isDescendantOf(document.body)) {
        window.dispatchEvent(new Event('resize'));
    }
};


CTRoot.prototype.clear = function () {
    while (this.children.length > 0) {
        this.children[0].remove();
    }
};


CTRoot.prototype.select = function (value) {
    this.children.forEach(c => c.select(value));
};


Object.defineProperty(CTRoot.prototype, 'offsetHeight', {
    get: function () {
        return this.children.reduce((ac, cr) => ac + cr.offsetHeight, 0)
    }
});


Object.defineProperty(CTRoot.prototype, 'offsetY', {
    get: function () {
        return 0;
    }
});


Object.defineProperty(CTRoot.prototype, 'contentHeight', {
    get: function () {
        return 0;
    }
});


Object.defineProperty(CTRoot.prototype, 'items', {
    set: function (items) {
        this.looked++;
        var prevState = Object.keys(this.nodeByValue).reduce((ac, key) => {
            ac[key] = this.nodeByValue[key].status;
            return ac;
        }, {});

        this.clear();
        this.children = items.map(function (item) {
            return new CTCollapsibleNode(this, item);
        }, this);
        this.elt.addChild(this.children.map(nd => nd.domElt));
        this.select(this.value);
        Object.keys(this.nodeByValue).forEach(key => {
            var nd = this.nodeByValue[key];
            if (prevState[key] === 'open' && nd.status === 'close') {
                nd.status = 'open';
            }
            else if (prevState === 'close' && nd.status === 'open') {
                nd.status = 'close';
            }
        });
        this.looked--;
        this.updateSize();
        this.updateSelectedLine();
    },
    get: function () {
        return this.children.map((chd) => {
            return chd.data;
        });
    }
});


Object.defineProperty(CTRoot.prototype, 'value', {
    set: function (value) {
        this._value = value;
        this.looked++;
        this.select(value);
        this.looked--;
        this.updateSelectedLine();
    },
    get: function () {
        return this._value;
    }
});


Object.defineProperty(CTRoot.prototype, 'data', {
    set: function (data) {
        data = Object.assign({ items: [], value: 0 }, data);
        this.items = data.items;
        this.value = data.value;
    },
    get: function () {
        return {
            items: this.items,
            value: this.value
        };
    }
});

Object.defineProperty(CTRoot.prototype, 'minWidth', {
    get: function () {
        return this.children.reduce((ac, cr) => Math.max(ac, cr.minWidth), 0) + 4;
    }
})


/**
 *
 * @param {CTRoot} parent
 * @param data
 * @constructor
 */
function CTCollapsibleNode(parent, data) {
    this.parent = parent;
    this.nodeByValue = parent.nodeByValue;
    this.root = parent;
    this.level = parent.level + 1;
    this.children = [];
    this.domElt = _({
        class: 'as-ctn-collapse-node',
        style: { '--level': this.level + '' },
        child: [
            {
                class: 'as-ctn-collapse-node-content',
                child: [
                    'toggler-ico',
                    {
                        class: 'as-ctn-icon-ctn'
                    },
                    {
                        tag: 'span',
                        class: 'as-ctn-text',
                        child: {
                            text: ''
                        }
                    },
                    {
                        tag: 'span',
                        class: 'as-ctn-count',
                        style: {
                            display: 'none'
                        },
                        child: {
                            text: ''
                        }
                    },
                    {
                        class: 'as-ctn-right',
                    }
                ],

            },
            {
                class: 'as-ctn-collapse-node-children-ctn'
            }
        ]
    });
    this.$toggler = $('toggler-ico', this.domElt);
    this.$content = $('.as-ctn-collapse-node-content', this.domElt);
    this.$childrenCtn = $('.as-ctn-collapse-node-children-ctn', this.domElt);
    this.$iconCtn = $('.as-ctn-icon-ctn', this.domElt);
    this.$text = $('.as-ctn-text', this.domElt);
    this.$count = $('.as-ctn-count', this.domElt);
    this.$right = $('.as-ctn-right', this.domElt);
    this.data = data;
    this.$content.on('click', this.ev_click.bind(this));
}

CTCollapsibleNode.prototype.remove = function () {
    this.children.slice().forEach(child => child.remove());
    var idx = this.parent.children.indexOf(this);
    var value = this.value;
    if (idx >= 0) {
        delete this.nodeByValue[keyStringOf(value)];
        this.parent.children.splice(idx, 1);
        this.domElt.remove();
    }
};

CTCollapsibleNode.prototype.select = function (value) {
    var res = false;
    if (this.data.value === value) {
        this.domElt.addClass('as-selected');
        res = true;
    }
    else {
        this.domElt.removeClass('as-selected');
    }
    var childRes = this.children.reduce((ac, it) => it.select(value) || ac, false);
    if (childRes && this.status === 'close') {
        this.status = 'open';
    }
    res = res || childRes;
    return res;
};

CTCollapsibleNode.prototype.ev_click = function (event) {
    if (this.$right && hitElement(this.$right, event)) return;
    var rootElt;
    if (this.domElt.hasClass('as-closing')) return;
    var isClickItem = false;
    var noSelect = this.rawData && this.rawData.noSelect;
    var tgBound;
    if (this.status === 'none') {
        isClickItem = !noSelect;
    }
    else {
        tgBound = this.$toggler.getBoundingClientRect();
        if (noSelect || event.clientX < tgBound.right) {
            if (this.status === 'open') {
                this.status = 'close';
            }
            else if (this.status === 'close') {
                this.status = 'open';
            }
        }
        else {
            isClickItem = true;
        }

    }
    if (isClickItem) {
        rootElt = this.root.elt;
        if (rootElt && rootElt.value !== this.value) {
            rootElt.value = this.value;
            rootElt.notifyChange(this.data);
        }
    }

};


Object.defineProperty(CTCollapsibleNode.prototype, 'status', {
    set: function (value) {
        var prev = this.status;
        if (this.children.length > 0) {
            if (value !== 'open') value = 'close';
        }
        else {
            value = 'none';
        }
        if (prev === value) return;


        this._status = value;
        switch (value) {
            case 'open':
                // this.domElt.addStyle('--children-height', this.childrenHeight + 'px');
                this.domElt.addClass('as-open').removeClass('as-close');
                break;
            case 'close':
                // this.domElt.addStyle('--children-height', this.childrenHeight + 'px');
                this.domElt.addClass('as-close').removeClass('as-open');
                break;
            default:
                this.domElt.removeClass('as-open').removeClass('as-close');
                break;
        }
        this.root.updateSelectedLine();
    },
    get: function () {
        return this._status || 'none';
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'icon', {
    get: function () {
        return this._icon || null;
    },
    set: function (value) {
        this.$iconCtn.clearChild();
        value = value || null;
        this._icon = value;
        if (value) {
            this.$iconCtn.addChild(_(value));
        }
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'text', {
    get: function () {
        return this._text;
    },
    set: function (value) {
        if (typeof value === 'number') value = value + '';
        value = value || '';
        this._text = value;
        this.$text.firstChild.data = value;
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'count', {
    get: function () {
        return this._count;
    },
    set: function (value) {
        if (typeof value !== 'number') value = parseInt(value);
        value = Math.round(value);
        if (!isNaturalNumber(value)) value = 0;
        this._count = value;
        if (value) {
            this.$count.removeStyle('display');
            this.$count.firstChild.data = value;
        }
        else {
            this.$count.addStyle('display', 'none');
            this.$count.firstChild.data = '';
        }
    }
});

Object.defineProperty(CTCollapsibleNode.prototype, 'value', {
    get: function () {
        return this._value;
    },
    set: function (value) {
        var prevValue = this._value;
        var key = keyStringOf(prevValue);
        if (this.nodeByValue[key] === this) {
            delete this.nodeByValue[key];
        }
        key = keyStringOf(value);
        if (this.nodeByValue[key]) {
            value = value + '_' + randomIdent(5);
        }
        this._value = value;
        key = keyStringOf(value);
        this.nodeByValue[key] = this;
        this.domElt.attr('data-value', value + '');
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'color', {
    get: function () {
        return this._color;
    },
    set: function (value) {
        if (typeof value === 'string') {
            try {
                value = Color.parse(value)
            } catch (e) {
                value = null;
            }
        }
        else if (!value || !value.getContrastYIQ) {
            value = null;
        }
        var textColor;
        if (value) {
            textColor = value.getContrastYIQ();
            this.$content.addStyle('color', textColor + '');
            this.$content.addStyle('background-color', value + '');
        }
        else {
            this.$content.removeStyle('color');
            this.$content.removeStyle('background-color');

        }
        this._color = value + '';
    }
});

Object.defineProperty(CTCollapsibleNode.prototype, 'items', {
    set: function (items) {
        while (this.children.length > 0) {
            this.children[0].remove();
        }
        if (!Array.isArray(items)) items = [];
        this.children = items.map(it => new CTNNode(this, it));
        this.$childrenCtn.addChild(this.children.map(c => c.domElt));
        if (this.children.length) {
            if (this.rawData && this.rawData.initOpened) {
                this.status = 'open';
            }
            else {
                this.status = 'close';
            }
        }
        else {
            this.status = 'none';
        }
        this.root.updateSelectedLine();
    },
    get: function () {
        return this.children.map(ch => ch.data);
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'actions', {
    set: function (actions) {
        if (!Array.isArray(actions)) actions = [];
        this._actions = actions;
        this.$right.clearChild();
        actions.forEach(action => {
            var btn = _({
                tag: 'button',
                class: ['as-transparent-button'],
                child: action.icon,
                on: {
                    click: (event) => {
                        this.root.elt.emit('action', {
                            action: action,
                            data: this.rawData,
                            type: 'action'
                        }, this.root.elt);
                    }
                }
            });
            if (action.text) btn.attr('title', action.text);

            this.$right.addChild(btn);
        });
    },
    get: function () {
        return this._actions;
    }
})

Object.defineProperty(CTCollapsibleNode.prototype, 'data', {
    set: function (data) {
        this.rawData = data || {};
        data = Object.assign({ text: '', value: 0, icon: null, count: 0 }, data || {});
        this.value = data.value;
        this.text = data.text;
        this.icon = data.icon;
        this.count = data.count;
        this.items = data.items;
        this.color = data.color;
        this.actions = data.actions;
    },
    get: function () {
        var res = Object.assign({}, this.rawData, {
            text: this.text,
            value: this.value
        });
        if (this.actions && this.actions.length) {
            res.actions = this.actions;
        }
        if (this.icon) res.icon = this.icon;
        if (this.count) res.count = this.count;
        if (this.color) res.color = this.color;
        return res;
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'contentHeight', {
    get: function () {
        return 31;
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'childrenHeight', {
    get: function () {
        return this.children.reduce((ac, cr) => ac + cr.offsetHeight, 0);
    }
});

Object.defineProperty(CTCollapsibleNode.prototype, 'offsetHeight', {
    get: function () {
        var res = this.contentHeight;
        if (this.status === 'open')
            res += this.childrenHeight;
        return res;
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'offsetY', {
    get: function () {
        var offsetY = this.parent.offsetY + this.parent.contentHeight;
        var sbs = this.parent.children;
        var sb;
        for (var i = 0; i < sbs.length; i++) {
            sb = sbs[i];
            if (sb === this) break;
            offsetY += sb.offsetHeight;
        }
        return offsetY;
    }
});


Object.defineProperty(CTCollapsibleNode.prototype, 'minWidth', {
    get: function () {
        var res = 50 + 8;//padding
        res += 14;//tg icon
        res += 7;//text margin
        res += Math.ceil(measureText(this.text, '14px arial').width);

        var countWidth = 0;
        if (this.count) {
            countWidth = measureText(this.count + '', '14px arial').width + 10;//padding 5
            countWidth = Math.ceil(countWidth);
            countWidth = Math.max(countWidth, 20);//min-width
            countWidth += 5; //margin
        }
        if (this.icon) res += 21;
        res += countWidth;
        res = this.children.reduce((ac, cr) => Math.max(ac, cr.minWidth), res);
        this.domElt.attr('data-min-width', res + '');
        return res;
    }
});

/**
 *
 * @param {CTNNode|CTCollapsibleNode} parent
 * @param data
 * @constructor
 */
function CTNNode(parent, data) {
    this.parent = parent;
    this.nodeByValue = parent.nodeByValue;
    this.root = parent.root;
    this.level = parent.level + 1;

    this.children = [];
    this.domElt = _({
        class: 'as-ctn-node',
        style: { '--level': this.level + '' },
        child: [
            {
                class: 'as-ctn-node-content',
                child: [
                    'toggler-ico',
                    {
                        class: 'as-ctn-icon-ctn'
                    },
                    {
                        tag: 'span',
                        class: 'as-ctn-text',
                        child: {
                            text: ''
                        }
                    },
                    {
                        tag: 'span',
                        class: 'as-ctn-count',
                        style: {
                            display: 'none'
                        },
                        child: { text: '' }
                    },
                    '.as-ctn-right'
                ]
            },
            {
                class: 'as-ctn-node-children-ctn'
            }
        ]
    });
    this.$content = $('.as-ctn-node-content', this.domElt);
    this.$toggler = $('toggler-ico', this.domElt);
    this.$content.on('click', this.ev_click.bind(this));
    this.$childrenCtn = $('.as-ctn-node-children-ctn', this.domElt);
    this.$iconCtn = $('.as-ctn-icon-ctn', this.domElt);
    this.$text = $('.as-ctn-text', this.domElt);
    this.$count = $('.as-ctn-count', this.domElt);
    this.$right = $('.as-ctn-right', this.domElt);
    this.data = data;
}

//copy
['status', 'offsetHeight', 'childrenHeight', 'offsetY', 'select',
    'text', 'count', 'icon', 'value', 'data', 'items', 'actions', 'remove', 'ev_click', 'color'].forEach(method => {
    Object.defineProperty(CTNNode.prototype, method, Object.getOwnPropertyDescriptor(CTCollapsibleNode.prototype, method));
});


Object.defineProperty(CTNNode.prototype, 'minWidth', {
    get: function () {
        var res = this.level * 25 - 20 + 10;//padding
        res += 14;//tg icon
        res += 7;//text margin
        res += Math.ceil(measureText(this.text, '14px arial').width);
        this.domElt.attr('data-text-width', Math.ceil(measureText(this.text, '14px arial').width))
        var countWidth = 0;
        if (this.count) {
            countWidth = measureText(this.count + '', '14px arial').width + 10;//padding 5
            countWidth = Math.ceil(countWidth);
            countWidth = Math.max(countWidth, 20);//min-width
            countWidth += 5; //margin-left
        }
        res += countWidth;
        this.domElt.attr('data-local-min-width', res + '');

        res = this.children.reduce((ac, cr) => Math.max(ac, cr.minWidth), res);
        this.domElt.attr('data-min-width', res + '');

        return res;
    }
});


Object.defineProperty(CTNNode.prototype, 'contentHeight', {
    get: function () {
        return 30;
    }
});
