import CheckTreeBox from "./CheckTreeBox";
import ACore, {_, $, $$} from "../ACore";
import CPUViewer from "./CPUViewer";
import OOP from "absol/src/HTML5/OOP";
import SelectBoxItem from "./SelectBoxItem";
import {hitElement} from "absol/src/HTML5/EventEmitter";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import {getScreenSize, traceOutBoundingClientRect} from "absol/src/HTML5/Dom";


/***
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeMenu() {
    this._values = [];
    this._viewValues = [];
    /***
     * @type {CheckTreeBox}
     */
    this.$checkTreeBox = _({
        tag: CheckTreeBox.tag,
        on: {
            change: this.eventHandler.boxChange,
            preupdateposition: this.eventHandler.preUpdateListPosition,
            toggleitem: this.eventHandler.boxToggleItem,
            cancel: this.eventHandler.boxCancel
        }
    });
    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$checkTreeBox.followTarget = this;
    this.on('click', this.eventHandler.click);
    OOP.drillProperty(this, this.$checkTreeBox, 'enableSearch');
    this.enableSearch = false;
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
        this.emit('change', {type: 'change', target: this}, this);
    }
};

MultiCheckTreeMenu.prototype.cancelView = function () {
    this.$checkTreeBox.values = this._values;
    this.viewValues(this._values)
};

MultiCheckTreeMenu.prototype.init = function (props) {
    props = props || {};
    var cProps = Object.assign({}, props);
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

MultiCheckTreeMenu.property.isFocus = {
    /***
     * @this MultiCheckTreeMenu
     * @param value
     */
    set: function (value) {
        value = !!value;
        var c = this.containsClass('as-focus');
        if (value === c) return;
        CPUViewer.hold();
        if (value) {
            var bound = this.getBoundingClientRect();
            this.$checkTreeBox.addStyle('min-width', bound.width + 'px');
            this.addClass('as-focus');
            document.body.appendChild(this.$checkTreeBox);
            this.$checkTreeBox.updatePosition();
            if (this._focusTimeout > 0) {
                clearTimeout(this._focusTimeout);
            }
            this._focusTimeout = setTimeout(function () {
                document.addEventListener('click', this.eventHandler.clickOut);
                this._focusTimeout = -1;
            }.bind(this));

        } else {
            this.removeClass('as-focus');
            this.$checkTreeBox.selfRemove();
            this.$checkTreeBox.resetSearchState();
            document.removeEventListener('click', this.eventHandler.clickOut);
        }
        CPUViewer.release();
    },
    get: function () {
        return this.containsClass('as-focus');
    }
};

MultiCheckTreeMenu.property.items = {
    set: function (items) {
        this.$checkTreeBox.items = items || [];
        this.addStyle('--list-min-width', this.$checkTreeBox.estimateSize.width + 'px');
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
        this.$checkTreeBox.values = values;
        this._values = values;
        values = this.$checkTreeBox.values.slice();//correct wrong item
        this.viewValues(values);
    },
    /***
     * @this MultiCheckTreeMenu
     */
    get: function () {
        return this._values;
    }
};


MultiCheckTreeMenu.eventHandler = {};

/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.clickOut = function (event) {
    if (!hitElement(this, event) && !hitElement(this.$checkTreeBox, event)) {
        this.commitView();
        this.isFocus = false;
    }
};


/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.click = function (event) {
    if (event.target === this || event.target === this.$itemCtn) {
        this.isFocus = !this.isFocus;
    }
};


/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.boxChange = function (event) {
    this.viewValues(this.$checkTreeBox.values);
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
    this.$checkTreeBox.updateCheckedAll();
    this.$checkTreeBox.updateSelectedInViewIfNeed();
    var newValues = this._viewValues.filter(function (v) {
        return v !== value;
    });
    if (this.isFocus) {
        this.viewValues(newValues);
    } else {
        this.values = newValues;
        this.emit('change', {type: 'change', target: this}, this);
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


ACore.install(MultiCheckTreeMenu);

export default MultiCheckTreeMenu;

// MultiCheckTreeMenu.prototype.



