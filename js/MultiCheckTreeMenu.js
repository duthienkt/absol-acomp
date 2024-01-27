import CheckTreeBox from "./CheckTreeBox";
import ACore, { _, $, $$ } from "../ACore";
import CPUViewer from "./CPUViewer";
import SelectBoxItem from "./SelectBoxItem";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import MultiSelectMenu from "./MultiSelectMenu";
import CheckTreeLeafOnlyBox from "./CheckTreeLeafOnlyBox";
import { copySelectionItemArray, isNaturalNumber, rootTreeValues2CheckedValues } from "./utils";
import { arrayUnique } from "absol/src/DataStructure/Array";


/***
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeMenu() {
    this._items = [];
    this._values = [];
    this._viewValues = [];
    this._initOpened = 0;
    /***
     * @type {CheckTreeBox|CheckTreeLeafOnlyBox}
     */
    this.$checkTreeBox = _({
        tag: CheckTreeBox.tag,
        on: {
            change: this.eventHandler.boxChange,
            preupdateposition: this.eventHandler.preUpdateListPosition,
            toggleitem: this.eventHandler.boxToggleItem,
            cancel: this.eventHandler.boxCancel,
            close: this.eventHandler.boxClose
        }
    });
    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$checkTreeBox.followTarget = this;
    this.$checkTreeBox.sponsorElement = this;
    this.on('click', this.eventHandler.click);

    this.enableSearch = false;

    /**
     * parent will be selected if all off leaf selected, sub tree can not select if had no leaf
     * @name leafOnly
     * @type {boolean}
     * @memberOf MultiCheckTreeMenu#
     */
    /**
     * parent will be selected if all off leaf selected, sub tree can not select if had no leaf
     * @name initOpened
     * @type {number}
     * @memberOf MultiCheckTreeMenu#
     */

    /***
     * todo: TREE has noSelect
     */

}


MultiCheckTreeMenu.tag = 'MultiCheckTreeMenu'.toLowerCase();

MultiCheckTreeMenu.render = function () {
    return _({
        class: ['as-multi-select-menu', 'as-multi-check-tree-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: ['as-multi-select-menu-item-ctn', 'as-bscroller']
            },
            {
                tag: 'button',
                class: 'as-multi-select-menu-toggle-btn',
                child: 'dropdown-ico'
            },
            'attachhook'
        ]
    });
};

MultiCheckTreeMenu.prototype.tokenPool = [];

MultiCheckTreeMenu.prototype._requestToken = function () {
    var token = this.tokenPool.pop();
    if (!token) {
        token = _({
            tag: SelectBoxItem.tag,
            props: {
                menu: this
            },
            on: {
                close: function (event) {
                    setTimeout(function () {
                        if (this.menu) this.menu.eventHandler.pressCloseToken(this, event);
                    }.bind(this), 1)
                }
            }
        });
    }
    return token;
};

MultiCheckTreeMenu.prototype._releaseToken = function (token) {
    token.menu = null;
    this.tokenPool.push(token);
};

MultiCheckTreeMenu.prototype._filToken = function (n) {
    while (this.$itemCtn.childNodes.length > n) {
        this.$itemCtn.removeChild(this.$itemCtn.lastChild);
    }
    while (this.$itemCtn.childNodes.length < n) {
        this.$itemCtn.addChild(this._requestToken());
    }
};


MultiCheckTreeMenu.prototype._assignTokens = function (items) {
    for (var i = 0; i < items.length; ++i) {
        this.$itemCtn.childNodes[i].data = items[i];
    }
};


MultiCheckTreeMenu.prototype._switchLeafMode = function () {
    var enableSearch = this.enableSearch;
    if (this.leafOnly) {
        this.$checkTreeBox = _({
            tag: CheckTreeLeafOnlyBox.tag,
            on: {
                change: this.eventHandler.boxChange,
                preupdateposition: this.eventHandler.preUpdateListPosition,
                toggleitem: this.eventHandler.boxToggleItem,
                cancel: this.eventHandler.boxCancel,
                close: this.eventHandler.boxClose
            }
        });
        this._explicit = this._leafOnlyExplicit;

    }
    else {
        this.$checkTreeBox = _({
            tag: CheckTreeBox.tag,
            on: {
                change: this.eventHandler.boxChange,
                preupdateposition: this.eventHandler.preUpdateListPosition,
                toggleitem: this.eventHandler.boxToggleItem,
                cancel: this.eventHandler.boxCancel,
                close: this.eventHandler.boxClose
            },

        });
        this._explicit = this._normalExplicit;

    }
    this.$checkTreeBox.followTarget = this;
    this.$checkTreeBox.sponsorElement = this;
    this.$checkTreeBox.initOpened = this.initOpened;
    this.$checkTreeBox.items = this._items;
    this.$checkTreeBox.values = this._values;
    this.$checkTreeBox.enableSearch = enableSearch;
};


MultiCheckTreeMenu.prototype._implicit = function (values) {
    values = (values || []);
    var valueDict = (values || []).reduce(function (ac, cr) {
        ac[cr + ''] = true;
        return ac;
    }, {});

    var resDict = {};

    function depthRemoveValueDict(node) {
        if (valueDict[node.value]) delete valueDict[node.value];
        if (node.items && node.items.length) {
            node.items.forEach(depthRemoveValueDict);
        }
    }

    var leafOnly = this.leafOnly;
    var scan;
    var leafCount = {};
    var leafScan;
    if (leafOnly) {
        leafScan = function (node) {
            if (node.isLeaf) {
                leafCount[node.value] = 1;
            }
            else {
                leafCount[node.value] = 0;
            }
            if (node.items && node.items.length > 0) {
                if (!node.isLeaf) {
                    node.items.forEach(leafScan);
                    leafCount[node.value] = node.items.reduce(function (ac, cr) {
                        return ac + (leafCount[cr.value] || 0);
                    }, 0);
                }
                else {
                    console.error("Invalid item:", node);
                }
            }
        };
        this._items.forEach(leafScan);
        scan = function scan(node) {
            if (!leafCount[node.value]) {
                depthRemoveValueDict(node);
                return true;
            }
            if (valueDict[node.value] && leafCount[node.value] > 0) return true;
            if (!node.items || node.items.length === 0) return false;
            var cs = node.items.map(scan);
            if (cs.every(function (e) {
                return e
            })) {
                depthRemoveValueDict(node);
                return true;
            }
            else {
                node.items.forEach(function (nd, i) {
                    if (cs[i] && leafCount[nd.value] > 0) resDict[nd.value] = nd;
                });
                return false;
            }
        };
    }
    else {
        scan = function scan(node) {
            if (valueDict[node.value]) {
                depthRemoveValueDict(node);
                return true;
            }
            if (!node.items || node.items.length === 0) return false;
            var cs = node.items.map(scan);
            if (cs.every(function (e) {
                return e
            })) {
                depthRemoveValueDict(node);
                return true;
            }
            else {
                node.items.forEach(function (nd, i) {
                    if (cs[i]) resDict[nd.value] = nd;
                });
                return false;
            }
        };
    }

    var csRoot = this._items.map(scan);

    this._items.forEach(function (nd, i) {
        if (csRoot[i] && (!leafOnly || leafCount[nd.value] > 0)) resDict[nd.value] = nd;
    });
    var eValues = values.reduce(function (ac, cr) {
        if (valueDict[cr]) ac.push(cr);
        return ac;
    }, []);
    for (var key in resDict) {
        eValues.push(resDict[key].value);
    }

    return arrayUnique(eValues)
};


MultiCheckTreeMenu.prototype._normalExplicit = function (values) {
    var valueDict = values.reduce(function (ac, cr) {
        ac[cr] = true;
        return ac;
    }, {});

    var selectDown = holder => {
        if (holder.canSelectAll) {
            holder.selected = true;
        }
        else if (holder.canSelect) {
            holder.child.forEach(c => selectDown(c));
        }
    }
    var compute = nd => {
        var res = {
            node: nd,
            child: []
        };

        if (nd.items && nd.items.length > 0) {
            res.child = nd.items.map(it => compute(it));
        }

        res.canSelectAll = !nd.noSelect && res.child.every(c => c.canSelectAll);
        res.canSelect = res.child.length === 0 || res.child.some(c => c.canSelect);
        if (valueDict[res.node.value]) selectDown(res);
        if (!res.selected && res.child.length > 0) {
            res.selected = res.child.every(c => c.selected);
        }
        return res;
    }

    var holders = this._items.map(it => compute(it));
    var eValues = [];
    var scanSelected = holder => {
        if (holder.selected) {
            eValues.push(holder.node.value);
        }
        else {
            holder.child.forEach(c => scanSelected(c));
        }
    };
    holders.forEach(c => scanSelected(c));
    return eValues;
};


MultiCheckTreeMenu.prototype._leafOnlyExplicit = function (values) {
    var valueDict = values.reduce(function (ac, cr) {
        ac[cr] = true;
        return ac;
    }, {});
    var res = [];

    function scan(node, selected) {
        selected = selected || valueDict[node.value];
        if (node.isLeaf && !node.noSelect && selected) res.push(node.value);
        if (node.items && node.items.length > 0) {
            node.items.forEach(function (cNode) {
                scan(cNode, selected);
            })
        }
    }

    this._items.forEach(function (node) {
        scan(node, false);
    });

    return res;
};


MultiCheckTreeMenu.prototype._explicit = MultiCheckTreeMenu.prototype._normalExplicit;


MultiCheckTreeMenu.prototype.findItemsByValues = function (values) {
    return values.map(function (value) {
        var holders = this.$checkTreeBox.findItemHoldersByValue(value);
        if (holders.length > 0) return holders[0].item;
        return null;
    }.bind(this)).filter(function (it) {
        return !!it;
    });
};


MultiCheckTreeMenu.prototype.viewValues = function (values) {
    var items = this.findItemsByValues(values);
    this._filToken(items.length);
    this._assignTokens(items);
    this._viewValues = values;
    if (this.isFocus) {
        var bound = this.getBoundingClientRect();
        this.$checkTreeBox.addStyle('min-width', bound.width + 'px');
        ResizeSystem.update();
    }
};

MultiCheckTreeMenu.prototype.commitView = function () {
    var values = this._values;
    var views = this._viewValues;
    var changed = values.length !== views.length;
    var viewDict;
    if (!changed) {
        viewDict = views.reduce(function (ac, cr) {
            ac[cr] = true;
            return ac;
        }, {});
        changed = values.some(function (value) {
            return !viewDict[value];
        });
    }
    if (changed) {
        this._values = views.slice();
        this.emit('change', { type: 'change', target: this }, this);
    }
};

MultiCheckTreeMenu.prototype.cancelView = function () {
    this.$checkTreeBox.values = this._values;
    this.viewValues(this._normalExplicit(this._values));
};

MultiCheckTreeMenu.prototype.init = function (props) {
    props = props || {};
    var cProps = Object.assign({}, props);
    if ('initOpened' in props) {
        this.initOpened = props.initOpened;
        delete cProps.initOpened;
    }

    if ('leafOnly' in props) {
        this.leafOnly = props.leafOnly;
        delete cProps.leafOnly;
    }
    if ('items' in props) {
        this.items = props.items;
        delete cProps.items;
    }
    if ('values' in props) {
        this.values = props.values;
        delete cProps.values;
    }

    Object.assign(this, cProps);
}


MultiCheckTreeMenu.property = {};

MultiCheckTreeMenu.property.initOpened = {
    set: function (value) {
        if (isNaturalNumber(value)) {
            this._initOpened = value;
        }
        else {
            this._initOpened = 0;
        }
        this.$checkTreeBox.initOpened = this._initOpened;
    },
    get: function () {
        return this._initOpened;
    }
}

MultiCheckTreeMenu.property.isFocus = {
    /***
     * @this MultiCheckTreeMenu
     * @param value
     */
    set: function (value) {
        if (value && (this.disabled || this.readOnly)) return;
        var self = this;
        value = !!value;
        var c = this.hasClass('as-focus');
        if (value === c) return;
        CPUViewer.hold();
        if (value) {
            self.off('click', self.eventHandler.click);
            var bound = this.getBoundingClientRect();
            this.$checkTreeBox.addStyle('min-width', bound.width + 'px');
            this.addClass('as-focus');
            document.body.appendChild(this.$checkTreeBox);
            this.$checkTreeBox.updatePosition();
            if (this._focusTimeout > 0) {
                clearTimeout(this._focusTimeout);
            }
            this._focusTimeout = setTimeout(function () {
                document.addEventListener('mousedown', this.eventHandler.clickOut);
                this._focusTimeout = -1;
                this.$checkTreeBox.focus();
            }.bind(this), 5);

        }
        else {
            this.removeClass('as-focus');
            this.$checkTreeBox.selfRemove();
            this.$checkTreeBox.resetSearchState();
            document.removeEventListener('mousedown', this.eventHandler.clickOut);

            function waitMouseUp() {
                document.removeEventListener('mouseup', waitMouseUp);
                setTimeout(function () {
                    self.on('click', self.eventHandler.click);
                }, 5)
            }

            // document.addEventListener('mouseup', waitMouseUp);why?
            setTimeout(waitMouseUp, 100);
        }
        CPUViewer.release();
    },
    get: function () {
        return this.hasClass('as-focus');
    }
};

MultiCheckTreeMenu.property.items = {
    set: function (items) {
        this._items = copySelectionItemArray(items || [], { removeNoView: true });
        this.$checkTreeBox.items = this._items;
        this.addStyle('--list-min-width', Math.max(145 + 20, this.$checkTreeBox.estimateSize.width) + 'px');
        this.values = this._values;//update
    },
    get: function () {
        return this.$checkTreeBox.items;
    }
};

MultiCheckTreeMenu.property.values = {
    /***
     * @this MultiCheckTreeMenu
     * @param values
     */
    set: function (values) {
        values = values || [];
        this.pendingValues = values;
        if (this.items.length > 0) {
            values = this._implicit(values);
        }
        else {
            values = values || [];
        }
        this.$checkTreeBox.values = values;
        this._values = values;
        values = this.$checkTreeBox.values.slice();//correct wrong item
        this.viewValues(this._normalExplicit(values));
    },
    /***
     * @this MultiCheckTreeMenu
     */
    get: function () {
        if ('pendingValues' in this) return this._explicit(this.pendingValues);
        return this._explicit(this._values);
    }
};

MultiCheckTreeMenu.property.checkedValues = {
    get: function () {
        var values = this.values;
        var items = this.items;
        return rootTreeValues2CheckedValues(items, values);
    }
};

MultiCheckTreeMenu.property.leafOnly = {
    set: function (value) {
        if (!!value === this.hasClass('as-leaf-only'))
            return;
        if (value) {
            this.addClass('as-leaf-only');
        }
        else {
            this.removeClass('as-leaf-only');
        }
        this._switchLeafMode();
    },
    get: function () {
        return this.hasClass('as-leaf-only');
    }
};


MultiCheckTreeMenu.property.disabled = MultiSelectMenu.property.disabled;
MultiCheckTreeMenu.property.readOnly = MultiSelectMenu.property.readOnly;


MultiCheckTreeMenu.eventHandler = {};

/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.clickOut = function (event) {
    if (event.target === this || event.target === this.$itemCtn || (!hitElement(this, event) && !hitElement(this.$checkTreeBox, event))) {
        this.commitView();
        this.isFocus = false;
    }
};

/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.boxClose = function (event) {
    this.commitView();
    this.isFocus = false;
};


/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.click = function (event) {
    if (!this.readOnly && (event.target === this || event.target === this.$itemCtn)) {
        this.isFocus = true;
    }
};


/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.boxChange = function (event) {
    delete this.pendingValues;
    this.viewValues(this._normalExplicit(this.$checkTreeBox.values));
    ResizeSystem.update();
};

MultiCheckTreeMenu.eventHandler.boxCancel = function (event) {
    this.cancelView();
    this.isFocus = false;
};


/***
 * @this MultiCheckTreeMenu
 * @param {SelectBoxItem} tokenElt
 * @param event
 */
MultiCheckTreeMenu.eventHandler.pressCloseToken = function (tokenElt, event) {
    var value = tokenElt.value;
    var holders = this.$checkTreeBox.findItemHoldersByValue(value);
    holders.forEach(function (holder) {
        holder.unselectAll();
    });
    this.$checkTreeBox.updateSelectedInViewIfNeed();
    var newValues = this._viewValues.filter(function (v) {
        return v !== value;
    });

    if (this.isFocus) {
        this.viewValues(newValues);
    }
    else {
        this.values = newValues;
        this.emit('change', { type: 'change', target: this }, this);
    }
};


MultiCheckTreeMenu.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$checkTreeBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};

MultiCheckTreeMenu.eventHandler.boxToggleItem = function (event) {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$checkTreeBox.addStyle('--max-height', (this.$checkTreeBox._lastAnchor < 4 ? availableBot : availableTop) + 'px');
    this.$checkTreeBox.updatePosition();
};


MultiCheckTreeMenu.property.enableSearch = {
    set: function (value) {
        this.$checkTreeBox.enableSearch = !!value;
    },
    get: function () {
        return this.$checkTreeBox.enableSearch;
    }
};


ACore.install(MultiCheckTreeMenu);

export default MultiCheckTreeMenu;

