import '../css/menu.css';
import ACore from "../ACore";
import Dom, {isDomNode} from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import AElement from "absol/src/HTML5/AElement";
import Follower from "./Follower";
import BlurTrigger from "./tool/BlurTrigger";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
export function MenuButton() {
    this.$text = $('.absol-vmenu-button-text', this);
    this.$key = $('.absol-vmenu-button-key', this);


    this.$arrow = $('.absol-vmenu-arrow', this);
    this.$iconCtn = $('.absol-vmenu-button-ext-icon-container', this);

    OOP.drillProperty(this, this.$text, 'text', 'innerHTML');
    OOP.drillProperty(this, this.$key, 'key', 'innerHTML');
}

MenuButton.tag = 'menubutton';

MenuButton.render = function () {
    return _({
        tag: 'button',
        class: 'absol-vmenu-button',
        child: [
            {
                class: 'absol-vmenu-button-ext-icon-container',
                child: 'img.absol-vmenu-button-icon'
            },
            '.absol-vmenu-button-text',
            '.absol-vmenu-button-key',
            {
                class: 'absol-vmenu-arrow-container',
                child: 'span.absol-vmenu-arrow'
            }
        ]
    });
};

MenuButton.property = {};

MenuButton.property.extendClasses = {
    set: function (value) {
        var self = this;
        this.extendClasses.forEach(function (className) {
            self.removeClass(className);
        });
        this._extendClass = [];
        if (!value) return;
        if (typeof value == 'string') {
            value = value.split(/\s+/).filter(function (c) {
                return c.length > 0
            });
        }

        if (value instanceof Array) {
            this._extendClass = value;
            this._extendClass.forEach(function (className) {
                self.addClass(className);
            });
        }
        else {
            throw new Error('Invalid extendClasses');
        }
    },
    get: function () {
        return this._extendClass || [];
    }
};


MenuButton.property.icon = {
    set: function (value) {
        this.$iconCtn.clearChild();
        this._icon = value;
        if (value) {
            _(value).addTo(this.$iconCtn);
        }
    },
    get: function () {
        return this._icon;
    }
};

MenuButton.property.iconSrc = {
    set: function (value) {
        if (value)
            this.icon = { tag: 'img', props: { src: value } };
        else
            this.icon = value;
    },
    get: function () {
        return this.icon && this.icon.props && this.icon.props.src;
    }
};


MenuButton.property.extendStyle = {
    set: function (value) {
        this.removeStyle(this._extendStyle || {});
        this._extendStyle = value || {};
        this.addStyle(this.extendStyle);
    },
    get: function () {
        return this._extendStyle || {};
    }
};

ACore.install(MenuButton);

/***
 *
 * @extends Follower
 * @constructor
 */
export function Dropdown() {
    this.$container = $('.absol-dropdown-content', this);
    this.$container.followTarget = this;
    this.$container.anchor = [1, 2, 6, 5];

}

Dropdown.tag = 'dropdown';

Dropdown.render = function () {
    return _({
        class: ['absol-drop-hidden', 'absol-dropdown'], child: 'follower.absol-dropdown-content.as-bscroller'
    });
};


Dropdown.property = {};
Dropdown.property.show = {
    set: function (value) {
        if (value) {
            this.removeClass('absol-drop-hidden');
            ResizeSystem.update();
            if (this.$container.lastChild && this.$container.lastChild.$items) {
                this.$container.lastChild.$items.forEach(function (itemElt) {
                    if (itemElt.autoFixParrentSize) {
                        itemElt.autoFixParrentSize();
                    }
                });
            }
            var aPst = this.findAvailablePosition();
            if (aPst.crampedHeight) {
                this.removeClass('overlap-top');
                // this.$container.followTarget = null;?
                this.$container.addStyle({
                    'max-height': aPst.maxHeight + 'px'
                });
                this.$container.refollow();
                this.$container.updatePosition();
                this.$container.addStyle('top', this.getBoundingClientRect().top + aPst.posTop + 'px');


            }
            else {
                this.$container.removeStyle('max-height')
                    .removeStyle('top');
                this.$container.refollow();
                this.$container.updatePosition();
            }
        }
        else {
            this.addClass('absol-drop-hidden');
        }
    },
    get: function () {
        return !this.containsClass('absol-drop-hidden');
    }
};

Dropdown.prototype.findAvailablePosition = function () {
    var outBound = Dom.traceOutBoundingClientRect(document.body);
    var containerBound = this.$container.getBoundingClientRect();
    var bound = this.getBoundingClientRect();
    var distTop = bound.top - outBound.top;
    var distLeft = bound.left - outBound.left;
    var distRight = -bound.right + outBound.right;
    var distBottom = -bound.bottom + outBound.bottom;
    var result = {};

    if (distLeft >= containerBound.width) result.left = true;
    if (distTop >= containerBound.height) result.top = true;
    if (distRight >= containerBound.width) result.right = true;
    if (distBottom >= containerBound.height) result.bottom = true;
    if (distRight + bound.width >= containerBound.width) result.overlapRight = true;
    if (distLeft + bound.width >= containerBound.width) result.overlapLeft = true;
    if (distBottom + bound.height >= containerBound.height) result.overlapBottom = true;
    if (distTop + bound.height >= containerBound.height) result.overlapTop = true;
    if (!result.overlapTop && !result.overlapBottom) {
        result.crampedHeight = true;
        result.maxHeight = outBound.height - 20;
        result.posTop = distBottom - Math.min(containerBound.height, result.maxHeight) + bound.height - 10;
    }

    return result;
};

Dropdown.prototype.addChild = function (child) {
    if (child instanceof Array) {
        for (var i = 0; i < child.length; ++i)
            this.addChild(child[i]);
    }
    else {
        if (!this.$trigger) {
            this.super(child);
            this.$trigger = child;
        }
        else {
            this.$container.addChild(child);
        }
    }
};


Dropdown.prototype.clearChild = function () {
    if (this.$trigger) {
        this.$trigger.selfRemove();
        this.$trigger = undefined;
    }
    this.$container.clearChild();
};


Dropdown.prototype.init = function (props) {
    props = props || {};
    Object.assign(this, props);
};


export function Dropright() {
    this.$container = $('.absol-dropright-content', this);
    this.$container.followTarget = this;
    this.$container.anchor = [0, 3, 7, 4];
}

Dropright.tag = 'dropright';

Dropright.render = function () {
    return _({
        class: ['absol-drop-hidden', 'absol-dropright'],
        child: 'follower.absol-dropright-content.as-bscroller',
        data: { $trigger: undefined, $content: undefined, _isShow: false }
    });
}

Object.assign(Dropright.prototype, Dropdown.prototype);


//is the same
Dropright.prototype.addChild = Dropdown.prototype.addChild;
Dropright.prototype.clearChild = Dropdown.prototype.clearChild;
Dropright.property = Object.assign({}, Dropdown.property);


export function VMenuLine() {
    return _('<div class="absol-vmenu-line"><div></div></div>');
}

VMenuLine.tag = 'VMenuLine'.toLowerCase();

export function VMenuItem() {
    var thisVM = this;

    this.sync = new Promise(function (rs) {
        _('attachhook').addTo(thisVM).on('error', function () {
            this.remove();
            rs();
        })
    });
    this.$dropper = $('dropright', this);
    this.$vmenu = $('vmenu', this);
    this.$button = $('menubutton', this);

    this.$text = thisVM.$button.$text;

    this.$key = thisVM.$button.$key;
    this.$arrow = thisVM.$button.$arrow;
    this.$iconCtn = thisVM.$button.$iconCtn;


    OOP.drillProperty(this, this.$button, ['text', 'extendClasses', 'extendStyle', 'key', 'icon', 'iconSrc']);
    OOP.drillProperty(this, this.$vmenu, ['activeTab']);

    this.eventHandler = OOP.bindFunctions(this, VMenuItem.eventHandler);
    this.$vmenu.on('press', this.eventHandler.pressItem, true);

    this.$button.on('click', this.eventHandler.clickButton, true);
    this.$button.on('mouseenter', this.eventHandler.enterButton, true);
    this._textMarginRight = 0;
}


VMenuItem.tag = 'VMenuItem'.toLowerCase();

VMenuItem.render = function () {
    return _({
        tag: 'dropright',
        extendEvent: ['press', 'enter'],
        child: ['menubutton',
            {
                tag: 'vmenu',
            }]
    });
};

VMenuItem.prototype.init = function (props) {
    Object.assign(this, props || {});
    this.sync = this.sync.then(this.autoFixParrentSize.bind(this));
};


VMenuItem.prototype.autoFixParrentSize = function () {
    var parentWidth = this.$dropper.getBoundingClientRect().width;// dropper is fixed parent content size
    if (!parentWidth) return;
    var buttonWidth = this.$button.getBoundingClientRect().width;
    var fontSize = this.$text.getFontSize();
    this._textMarginRight = parentWidth - buttonWidth + this._textMarginRight;
    this.$text.addStyle('margin-right', this._textMarginRight / fontSize + 'em');
};

VMenuItem.eventHandler = {};


VMenuItem.eventHandler.enterButton = function (event) {
    event.menuItem = this;
    var newEvent = EventEmitter.copyEvent(event);
    this.emit('enter', newEvent, this);
};


VMenuItem.eventHandler.pressItem = function (event) {
    var newEvent = EventEmitter.copyEvent(event, { target: this });
    this.emit('press', newEvent, this);
};

VMenuItem.eventHandler.clickButton = function (event) {
    event.menuDontHide = this.items && this.items.length > 0;
    event.menuItem = this;
    event.vmenuItem = this;
    var newEvent = EventEmitter.copyEvent(event, { target: this });
    this.emit('press', newEvent, this);
};


VMenuItem.property = {};
VMenuItem.property.items = {
    set: function (items) {
        items = items || [];
        if (items.length > 0) {
            this.$arrow.addClass(['mdi', 'mdi-chevron-right']);
        }
        else {
            this.$arrow.removeClass(['mdi', 'mdi-chevron-right']);
        }
        this.$vmenu.items = items;
    },
    get: function () {
        return this.$vmenu.items;
    }
};

VMenuItem.property.disable = {
    set: function (value) {
        if (value) {
            this.addClass('absol-menu-item-disable');
        }
        else {
            this.removeClass('absol-menu-item-disable');
        }
    },
    get: function () {
        return this.containsClass('absol-menu-item-disable');
    }
};


export function VMenu() {
    var thisVM = this;

    this.sync = new Promise(function (rs) {
        _('attachhook').addTo(thisVM).on('error', function () {
            this.remove();
            rs();
        })
    });
}

VMenu.tag = 'vmenu';

VMenu.render = function () {
    return _({
        class: 'absol-vmenu',
        extendEvent: 'press'
    });
};


VMenu.property = {};
VMenu.property.activeTab = {
    set: function (tabIndex) {
        this._activeTab = tabIndex;
        if (this.$items) {
            for (var i = 0; i < this.$items.length; ++i) {
                var item = this.$items[i];
                item.show = i == tabIndex && !item.disable;
                item.activeTab = -1;
                if (i == tabIndex && !item.disable) {
                    item.$button && item.items && item.items.length > 0 && item.$button.addClass('absol-vmenu-button-hover');
                }
                else {
                    item.$button && item.$button.removeClass('absol-vmenu-button-hover');
                }
            }
        }
    },
    get: function () {
        return this._activeTab;
    }
};


VMenu.property.extendStyle = {
    set: function (value) {
        this.removeStyle(this._extendStyle || {});
        this._extendStyle = value || {};
        this.addStyle(this.extendStyle);
    },
    get: function () {
        return this._extendStyle || {};
    }
};


VMenu.property.extendClasses = {
    set: function (value) {
        var self = this;
        this.extendClasses.forEach(function (className) {
            self.removeClass(className);
        });
        this._extendClass = [];
        if (!value) return;
        if (typeof value == 'string') {
            value = value.split(/\s+/).filter(function (c) {
                return c.length > 0
            });
        }
        if (value instanceof Array) {
            this._extendClass = value;
            this._extendClass.forEach(function (className) {
                self.addClass(className);
            });
        }
        else {
            throw new Error('Invalid extendClasses');
        }
    },
    get: function () {
        return this._extendClass || [];
    }
};


VMenu.eventHandler = {};
VMenu.eventHandler.enterItem = function (event) {
    var tabIndex = event.menuItem._tabIndex;
    this.activeTab = tabIndex;
};


VMenu.eventHandler.pressItem = function (event) {
    this.emit('press', EventEmitter.copyEvent(event, { target: this }), this);
};


VMenu.property.items = {
    set: function (items) {
        this._childFromItems(items || []);
    },
    get: function () {
        return this.$items;
    }
}


VMenu.prototype.init = function (props) {
    Object.assign(this, props || {});
};


VMenu.prototype._childFromItems = function (items) {
    this.clearChild();
    this.$items = items.map(function (item, index) {
        var itemElt;
        if (typeof item === 'string' && (item.substr(0, 1) === '-' || item.substr(0, 1) === '=')) {
            itemElt = _('vmenuline');
        }
        else if (isDomNode(item)) {
            itemElt = item;
        }
        else if (item.child || item.class || item.tag || item.style || typeof item === 'string') {
            itemElt = _(item);
        }
        else {
            itemElt = _({
                tag: 'vmenuitem',
                props: Object.assign({ _tabIndex: index }, item),
                on: {
                    enter: { callback: this.eventHandler.enterItem, cap: true },
                    press: { callback: this.eventHandler.pressItem, cap: true }
                }
            });
        }
        this.addChild(itemElt);
        return itemElt;
    }.bind(this));
    //todo
};


export function HMenuItem() {
    this.blurTrigger = null;
    this.$vmenu = $('vmenu', this);
    this.$dropDown = this;
    this.$button = $('button.absol-hmenu-button', this);
    OOP.drillProperty(this, this.$button, 'text', 'innerHTML');
    OOP.drillProperty(this, this.$vmenu, 'items');
    OOP.drillProperty(this, this.$vmenu, 'activeTab');

    this.$button.on('click', this.eventHandler.clickButton);
    this.$button.on('mouseenter', this.eventHandler.enterButton, true);
    this.$vmenu.on('press', this.eventHandler.pressItem, true);

    //property show not need because dropdown is itself
    return this;
}

HMenuItem.tag = 'HMenuItem'.toLowerCase();

HMenuItem.render = function () {
    return _({
        tag: 'dropdown',
        extendEvent: ['press', 'enter'],
        child: ['button.absol-hmenu-button',
            'vmenu'
        ]
    });
};


HMenuItem.eventHandler = {};

HMenuItem.eventHandler.clickButton = function (event) {
    event.menuItem = this;
    event.hmenuItem = this;
    this.emit('press', EventEmitter.copyEvent(event, { target: this }), this);
};

HMenuItem.eventHandler.enterButton = function (event) {
    event.menuItem = this;
    this.emit('enter', EventEmitter.copyEvent(event, { target: this }), this);
};

HMenuItem.eventHandler.pressItem = function (event) {
    this.emit('press', EventEmitter.copyEvent(event, { target: this }), this);
};

HMenuItem.prototype = {};

HMenuItem.prototype.disable = VMenuItem.prototype.disable;


HMenuItem.prototype.init = function (props) {
    props = props || {};
    Object.assign(this, props);
};

/***
 * @extends AElement
 * @constructor
 */
export function HMenu() {
}

HMenu.tag = 'hmenu';

HMenu.render = function () {
    return _({
        class: 'absol-hmenu',
        extendEvent: ['press', 'enter', 'activetab', 'cancel']
    });
};


HMenu.eventHandler = {};
HMenu.eventHandler.pressItem = function (event) {
    /**
     * this.activeTab can be undefined
     * undefine >= 0 => false
     * undefine < 0 => false
     */

    if (event.menuItem.items && event.menuItem.items.length > 0 && !(this.activeTab >= 0)) {
        this.activeTab = event.menuItem._tabIndex;
    }
    else {
        event.isLeaf = (!event.menuItem.items || !event.menuItem.items.length);
        this.emit('press', event, this);
    }
};

HMenu.eventHandler.enterItem = function (event) {
    if (this.activeTab >= 0) {
        this.activeTab = event.menuItem._tabIndex;
    }
};


HMenu.eventHandler.clickSomewhere = function (event) {
    // if (EventEmitter.hitElement(this, event)) return;
    this.activeTab = -1;
    // window.removeEventListener('blur', this.eventHandler.clickSomewhere);
};


HMenu.prototype._childFromItems = function (items) {
    this.clearChild();
    this.$items = items.map(function (item, index) {
        var res = _({
            tag: 'hmenuitem',
            props: Object.assign({ _tabIndex: index }, item),
            on: {
                press: { callback: this.eventHandler.pressItem, cap: true },
                enter: { callback: this.eventHandler.enterItem, cap: true }
            }
        });
        this.addChild(res);
        return res;
    }.bind(this));
};

HMenu.prototype.init = function (props) {
    Object.assign(this, props || {});
};


HMenu.property = {};
HMenu.property.items = {
    set: function (items) {
        this._childFromItems(items || []);
    },
    get: function () {
        return this.$items;
    }
};


HMenu.property.activeTab = {
    /***
     * @this HMenu
     * @param tabIndex
     */
    set: function (tabIndex) {
        var lastValue = this._activeTab;
        this._activeTab = tabIndex;
        for (var i = 0; i < this.$items.length; ++i) {
            var item = this.$items[i];
            item.show = i == tabIndex && !item.disable;
            item.activeTab = -1;
            if (i == tabIndex && !item.disable) {
                item.$button && item.items && item.items.length > 0 && item.$button.addClass('absol-hmenu-button-hover');
            }
            else {
                item.$button && item.$button.removeClass('absol-hmenu-button-hover');
            }
        }
        if (!(lastValue >= 0) && (this._activeTab >= 0)) {
            if (this.blurTrigger){
                this.blurTrigger.destroy();
            }

            this.blurTrigger = new BlurTrigger([this], "click", this.eventHandler.clickSomewhere, 100, 10);

        }
        else if ((lastValue >= 0) && !(this._activeTab >= 0)) {
            if (this.blurTrigger){
                this.blurTrigger.destroy();
                this.blurTrigger = null;
            }
        }
        if (lastValue >= 0) {
            if (tabIndex >= 0 && tabIndex != lastValue) {
                this.emit('activetab', { type: 'activetab', tabIndex: tabIndex, target: this }, this);
            }
            else if (!(tabIndex >= 0)) {
                this.emit('cancel', { type: 'cancel', lastActiveIndex: lastValue, target: this }, this);
            }
        }
        else {
            if (tabIndex >= 0) {
                this.emit('activetab', { type: 'activetab', tabIndex: tabIndex, target: this }, this);
            }
        }
    },
    get: function () {
        return this._activeTab;
    }
};

/***
 * @extends AElement
 * @constructor
 */
export function VRootMenu() {
    this._items = [];
    this.items = [];
}

VRootMenu.tag = 'VRootMenu'.toLowerCase();

VRootMenu.render = function () {
    return _({
        class: ['as-v-root-menu'],
        extendEvent: ['press', 'enter', 'activetab', 'cancel']
    });
};


VRootMenu.prototype._childFromItems = function (items) {
    var thisM = this;
    this.clearChild();
    this.$items = items.map(function (item, i) {
        var itemElt;
        if (typeof item === 'string' && (item.substr(0, 1) === '-' || item.substr(0, 1) === '=')) {
            itemElt = _('vmenuline');
        }
        else if (isDomNode(item)) {
            itemElt = item;
        }
        else if (item.child || item.class || item.tag || item.style || typeof item === 'string') {
            itemElt = _(item);
        }
        else {
            itemElt = _({
                tag: 'vmenuitem',
                props: item,
                on: {
                    enter: thisM.eventHandler.enterItem,
                    press: thisM.eventHandler.pressItem
                }
            });
        }
        itemElt._tabIndex = i;
        thisM.addChild(itemElt);
        return itemElt;
    });
};

VRootMenu.property = Object.assign({}, HMenu.property);

VRootMenu.eventHandler = Object.assign({}, HMenu.eventHandler);


ACore.install([HMenu, VMenuItem, VMenu, Dropright, VMenuLine, Dropdown, HMenuItem, VRootMenu]);