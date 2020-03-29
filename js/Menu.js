import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";

var _ = ACore._;
var $ = ACore.$;



export function MenuButton() {
    var res = _({
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

    res.$text = $('.absol-vmenu-button-text', res);
    res.$key = $('.absol-vmenu-button-key', res);


    res.$arrow = $('.absol-vmenu-arrow', res);
    res.$iconCtn = $('.absol-vmenu-button-ext-icon-container', res);

    OOP.drillProperty(res, res.$text, 'text', 'innerHTML');
    OOP.drillProperty(res, res.$key, 'key', 'innerHTML');


    return res;
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
            value = value.split(/\s+/).filter(function (c) { return c.length > 0 });
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

ACore.install('menubutton', MenuButton);


export function Dropdown(data) {
    data = data || {};

    var res = _({
        class: ['absol-drop-hidden', 'absol-dropdown'], child: '.absol-dropdown-content'
    });

    res.$container = $('.absol-dropdown-content', res);

    return res;
};



Dropdown.property = {};
Dropdown.property.show = {
    set: function (value) {
        if (value) {
            this.removeClass('absol-drop-hidden');
            var aPst = this.findAvailablePosition();
            if (aPst.overlapRight) {
                this.removeClass('overlap-left');
            }
            else if (aPst.overlapLeft) {
                this.addClass('overlap-left');
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
    var outBound = Dom.traceOutBoundingClientRect(this);
    var containerBound = this.$container.getBoundingClientRect();
    var bound = this.getBoundingClientRect();
    var distTop = bound.top - outBound.top;
    var distLeft = bound.left - outBound.left;
    var distRight = -bound.right + outBound.right;
    var distBottom = -bound.right + outBound.right;
    var result = {};
    if (distTop >= containerBound.height) result.top = true;
    if (distBottom >= containerBound.height) result.bottom = true;
    if (distLeft >= containerBound.width) result.left = true;
    if (distRight >= containerBound.width) result.right = true;
    if (distRight + bound.width >= containerBound.width) result.overlapRight = true;
    if (distLeft + bound.width >= containerBound.width) result.overlapLeft = true;
    //todo: more
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



export function Dropright(data) {
    data = data || {};
    //default : hidden
    var res = _({
        class: ['absol-drop-hidden', 'absol-dropright'], child: '.absol-dropright-content', data: { $trigger: undefined, $content: undefined, _isShow: false }
    });

    res.$container = $('.absol-dropright-content', res);

    return res;
};


Object.assign(Dropright.prototype, Dropdown.prototype);


//is the same
Dropright.prototype.addChild = Dropdown.prototype.addChild;
Dropright.prototype.clearChild = Dropdown.prototype.clearChild;
Dropright.property = Object.assign({}, Dropdown.property);


export function VMenuLine() {
    return _('<div class="absol-vmenu-line"><div></div></div>');
}

export function VMenuItem() {

    var res = _({
        tag: 'dropright',
        extendEvent: ['press', 'enter'],
        child: ['menubutton',
            {
                tag: 'vmenu',
            }]
    });

    res.sync = new Promise(function (rs) {
        _('attachhook').addTo(res).on('error', function () {
            this.remove();
            rs();
        })
    });
    res.$dropper = $('dropright', res);
    res.$vmenu = $('vmenu', res);
    res.$button = $('menubutton', res);

    res.$text = res.$button.$text;

    res.$key = res.$button.$key;
    res.$arrow = res.$button.$arrow;
    res.$iconCtn = res.$button.$iconCtn;


    OOP.drillProperty(res, res.$button, ['text', 'extendClasses', 'extendStyle', 'key', 'icon', 'iconSrc']);
    OOP.drillProperty(res, res.$vmenu, ['activeTab']);

    res.eventHandler = OOP.bindFunctions(res, VMenuItem.eventHandler);
    res.$vmenu.on('press', res.eventHandler.pressItem, true);

    res.$button.on('click', res.eventHandler.clickButton, true);
    res.$button.on('mouseenter', res.eventHandler.enterButton, true);

    return res;
};

VMenuItem.prototype.init = function (props) {
    Object.assign(this, props || {});
    this.sync = this.sync.then(this.autoFixParrentSize.bind(this));
};


VMenuItem.prototype.autoFixParrentSize = function () {
    var parentWidth = this.$dropper.getBoundingClientRect().width;// dropper is fixed parent content size
    var buttonWidth = this.$button.getBoundingClientRect().width;
    var fontSize = this.$text.getFontSize();
    this.$text.addStyle('margin-right', (parentWidth - buttonWidth) / fontSize + 'em');
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
    var res = _({
        class: 'absol-vmenu',
        extendEvent: 'press'
    });

    res.sync = new Promise(function (rs) {
        _('attachhook').addTo(res).on('error', function () {
            this.remove();
            rs();
        })
    });
    res.eventHandler = OOP.bindFunctions(res, VMenu.eventHandler);
    return res;
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
            value = value.split(/\s+/).filter(function (c) { c.length > 0 });
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
        var res;
        if (typeof (item) == 'string') {
            res = _('vmenuline');
        }
        else {
            res = _({
                tag: 'vmenuitem',
                props: Object.assign({ _tabIndex: index }, item),
                on: {
                    enter: { callback: this.eventHandler.enterItem, cap: true },
                    press: { callback: this.eventHandler.pressItem, cap: true }
                }
            });
        }
        this.addChild(res);
        return res;
    }.bind(this));
    //todo
};


function HMenuItem() {

    var res = _({
        tag: 'dropdown',
        extendEvent: ['press', 'enter'],
        child: ['button.absol-hmenu-button',
            'vmenu'
        ]
    });

    res.$vmenu = $('vmenu', res);
    res.$dropDown = res;
    res.$button = $('button.absol-hmenu-button', res);
    OOP.drillProperty(res, res.$button, 'text', 'innerHTML');
    OOP.drillProperty(res, res.$vmenu, 'items');
    OOP.drillProperty(res, res.$vmenu, 'activeTab');

    res.eventHandler = OOP.bindFunctions(res, HMenuItem.eventHandler);

    res.$button.on('click', res.eventHandler.clickButton);
    res.$button.on('mouseenter', res.eventHandler.enterButton, true);
    res.$vmenu.on('press', res.eventHandler.pressItem, true);

    //property show not need because dropdown is itself
    return res;
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



export function HMenu() {


    var res = _({
        class: 'absol-hmenu',
        extendEvent: ['press', 'enter']
    });

    res.eventHandler = OOP.bindFunctions(res, HMenu.eventHandler);

    return res;
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
        setTimeout(function () {
            $(document.body).once('click', this.eventHandler.clickSomewhere, false);
        }.bind(this), 100);
    }
    else {
        this.emit('press', event, this);
    }
};

HMenu.eventHandler.enterItem = function (event) {
    if (this.activeTab >= 0) {
        this.activeTab = event.menuItem._tabIndex;
    }
};


HMenu.eventHandler.clickSomewhere = function (event) {
    if (event.menuItem) {
        //  wait for next time
        setTimeout(function () {
            $(document.body).once('click', this.eventHandler.clickSomewhere, false);
        }.bind(this), 100);
    }
    else {
        this.activeTab = -1;
    }
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
    set: function (tabIndex) {
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
    },
    get: function () {
        return this._activeTab;
    }
};



ACore.creator.hmenu = HMenu;
ACore.creator.vmenuitem = VMenuItem;
ACore.creator.vmenu = VMenu;
ACore.creator.dropright = Dropright;
ACore.creator.vmenuline = VMenuLine;

ACore.creator.dropdown = Dropdown;
ACore.creator.hmenuitem = HMenuItem;