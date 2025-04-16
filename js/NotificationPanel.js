import ACore, { _, $ } from "../ACore";
import { findMaxZIndex, isNaturalNumber } from "./utils";
import '../css/notificationpanel.css';
import { getScreenSize, isDomNode } from "absol/src/HTML5/Dom";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import AElement from "absol/src/HTML5/AElement";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import QuickMenu, { QuickMenuInstance } from "./QuickMenu";
import { implicitDate } from "absol/src/Time/datetime";
import RelativeTimeText from "./RelativeTimeText";
import FlexiconButton from "./FlexiconButton";
import MHeaderBar from "./mobile/MHeaderBar";

/**
 * @extends AElement
 * @constructor
 */
function NotificationPanel() {
}


NotificationPanel.tag = 'NotificationPanel'.toLowerCase();

NotificationPanel.render = function () {
    return _({
        class: 'as-notification-panel',
    });
};

NotificationPanel.prototype.addChild = function () {
    var res = AElement.prototype.addChild.apply(this, arguments);
    ResizeSystem.updateUp(this, true);
    return res;
};


NotificationPanel.prototype.closeAllDropdown = function () {
    Array.prototype.forEach.call(this.childNodes, c => {
        if (typeof c.close === "function") c.close();
    });
};

ACore.install(NotificationPanel);
export default NotificationPanel;

/**
 /**
 * @extends AElement
 * @constructor
 */
export function NPDropdownButton() {
    this.$dropdown = $('.as-np-db-dropdown', this);
    this.$iconCtn = $('.as-np-db-icon-ctn', this);
    this.$icon = null
    this.$count = $('.as-np-db-count', this);
    this._count = 0;
    this.$btn = $('.as-np-db-btn', this);
    this.$btn.on('click', this.eventHandler.click);
    this.$body = $('.as-np-db-dropdown-body', this);
    this.$quickMenuBtn = $('.as-np-db-quick-menu-btn', this);
    this.$quickMenuCtn = $('.as-np-db-dropdown-quick-menu-ctn', this);

    /**
     * @name count
     * @type {number}
     * @memberOf NPDropdownButton#
     */
}


NPDropdownButton.tag = 'NPDropdownButton'.toLowerCase();


NPDropdownButton.render = function () {
    return _({
        class: 'as-np-dropdown-button',
        extendEvent: ['click', 'close', 'open'],
        child: [
            {
                tag: 'button',
                class: 'as-np-db-btn',
                child: [
                    {
                        class: 'as-np-db-icon-ctn',
                    },
                    {
                        class: 'as-np-db-count'
                    }
                ]
            },

            {
                class: ['as-np-db-dropdown', 'as-dropdown-box-common-style'],
                child: [
                    {
                        class: 'as-np-db-dropdown-quick-menu-ctn',
                        style: {
                            display: 'none'
                        },
                        child: [
                            {
                                tag: 'button',
                                class: ['as-transparent-button', 'as-np-db-quick-menu-btn'],
                                child: 'span.mdi.mdi-dots-horizontal'
                            }
                        ]
                    },
                    {
                        class: 'as-np-db-dropdown-body'
                    }
                ]
            }
        ]
    });
};

['addChild', 'removeChild', 'clearChild'].forEach(function (key) {
    NPDropdownButton.prototype[key] = function () {
        return this.$body[key].apply(this.$body, arguments);
    };
});

NPDropdownButton.prototype.getChildNodes = function () {
    return Array.prototype.slice.call(this.$body.childNodes);
};


NPDropdownButton.prototype.getFirstChild = function () {
    return this.$body.firstChild;
};


NPDropdownButton.prototype.getLastChild = function () {
    return this.$body.lastChild;
};


NPDropdownButton.prototype.addChildBefore = function (child, bf) {
    //adapt method
    if (bf && bf === this.lastChild) bf = this.$body.lastChild;
    else if (bf && bf === this.firstChild) bf = this.$body.firstChild;
    return this.$body.addChildBefore(child, bf);
};

NPDropdownButton.prototype.addChildAfter = function (child, at) {
    if (at === this.lastChild) at = this.$dropdown.lastChild;
    else if (at === this.firstChild) at = this.$dropdown.firstChild;
    return this.$body.addChildAfter(child, at);
};


NPDropdownButton.prototype.open = function () {
    if (this.hasClass('as-active')) return;
    this.addClass('as-active');
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    if (bound.left < screenSize.width / 2) {
        this.$dropdown.addStyle({
            top: bound.bottom + 5 + 'px',
            '--max-height': `calc(90vh - ${bound.bottom + 110}px)`,
            left: '20px',
            right: 'unset'
        });
    }
    else {
        this.$dropdown.addStyle({
            top: bound.bottom + 5 + 'px',
            '--max-height': `calc(90vh - ${bound.bottom + 110}px)`,
            right: '20px',
            left: 'unset'
        });
    }
    this.$dropdown.addStyle('z-index', findMaxZIndex(this) + 2);
    setTimeout(() => {
        if (this.hasClass('as-active'))
            window.addEventListener('click', this.eventHandler.clickOut);
    }, 3);
    this.emit('open', { type: 'open' }, this);
};


NPDropdownButton.prototype.close = function () {
    if (!this.hasClass('as-active')) return;
    this.removeClass('as-active');
    window.removeEventListener('click', this.eventHandler.clickOut);
    this.emit('close', { type: 'close' }, this);
};

NPDropdownButton.property = {};

NPDropdownButton.property.count = {
    set: function (value) {
        value = Math.round(value);
        if (!isNaturalNumber(value)) value = 0;
        this._count = value;
        if (value > 0) {
            this.$count.attr('data-count', value);
        }
        else {
            this.$count.attr('data-count', null);
        }
    },
    get: function () {
        return this._count;
    }
};

NPDropdownButton.property.icon = {
    set: function (value) {
        if (this.$icon) this.$icon.remove();
        this.$iconCtn.clearChild();
        var elt;
        if (isDomNode(value)) {
            if (value.parentElt)
                value = value.cloneNode(true);
            elt = value;
        }
        else if (value && (typeof value === 'string' || typeof value === 'object')) {
            if (value === 'default') value = 'span.mdi.mdi-equal';
            elt = _(value);
        }

        if (elt) {
            this.$iconCtn.addChild(elt);
            this.$icon = elt;
            this.addClass('as-has-icon');
        }
        else {
            this.$icon = null;
            value = null;
            this.removeClass('as-has-icon');
        }
        this._icon = value;
    },
    get: function () {
        return this._icon;
    }
};


NPDropdownButton.property.quickmenu = {
    set: function (value) {
        value = value || null;
        if (this.quickmenuInstance) {
            this.quickmenuInstance.remove();
        }
        this._quickmenu = value;
        if (value) {
            this.$quickMenuCtn.removeStyle('display');
            this.$dropdown.addClass('as-has-quick-menu');
            this.quickmenuInstance = new QuickMenuInstance(this.$quickMenuBtn, Object.assign({
                triggerEvent: 'click',
                anchor: [2, 5],
                menuCtn: this.$quickMenuCtn
            }, value));
        }
        else {
            this.$dropdown.removeClass('as-has-quick-menu');
            this.$quickMenuCtn.addStyle('display', 'none');
        }
    },
    get: function () {
        return this._quickmenu;
    }
}


NPDropdownButton.eventHandler = {};

/**
 * @this NPDropdownButton
 * @param {MouseEvent} event
 */
NPDropdownButton.eventHandler.click = function (event) {
    this.emit('click', { type: 'click', originalEvent: event }, this);
    if (this.hasClass('as-active')) {
        this.close();
    }
    else {
        this.open();
    }
};

/**
 * @this NPDropdownButton
 * @param {MouseEvent} event
 */
NPDropdownButton.eventHandler.clickOut = function (event) {
    if (hitElement(this, event)) return;
    this.close();
}


ACore.install(NPDropdownButton);


/**
 * @extends AElement
 * @constructor
 */
export function NPSection() {
    this.$body = $('.as-np-section-body', this);
    this.$name = $('.as-np-section-name', this);
    this.$action = $('.as-np-section-action', this);
    this.$action.on('click', (event) => {
        this.emit('action', { type: 'action', originalEvent: event }, this);
    });
}

NPSection.tag = 'NPSection'.toLowerCase();

NPSection.render = function () {
    return _({
        class: 'as-np-section',
        extendEvent: ['action'],
        child: [
            {
                class: 'as-np-section-header',
                child: [
                    {
                        class: 'as-np-section-name',
                        attr: {
                            'data-name': ''
                        }
                    },
                    {
                        class: 'as-np-section-action'
                    }
                ]
            },
            {
                class: 'as-np-section-body',
            }
        ]
    });
};


['addChild', 'removeChild', 'findChildAfter', 'findChildBefore'].forEach(key => {
    NPSection.prototype[key] = function () {
        return this.$body[key].apply(this.$body, arguments);
    }
});

NPSection.prototype.getChildNodes = function () {
    return Array.prototype.slice.call(this.$body.childNodes);
};

NPSection.prototype.getFirstChild = function () {
    return this.$body.firstChild;
};

NPSection.prototype.getLastChild = function () {
    return this.$body.lastChild;
};

NPSection.prototype.addChildBefore = function (child, bf) {
    if (bf === this.firstChild) bf = this.$body.firstChild;
    else if (bf === this.lastChild) bf = this.$body.lastChild;
    return this.$body.addChildBefore(child, bf);
};

NPSection.prototype.addChildAfter = function (child, at) {
    if (at === this.firstChild) at = this.$body.firstChild;
    else if (at === this.lastChild) at = this.$body.lastChild;
    return this.$body.addChildAfter(child, at);
};


NPSection.property = {};

NPSection.property.name = {
    set: function (value) {
        value = value || '';
        value = value + '';
        this.$name.attr('data-name', value);
    },
    get: function () {
        return this.attr('data-name');
    }
};

NPSection.property.actionText = {
    set: function (value) {
        value = value || '';
        value = value + '';
        if (value)
            this.$action.attr('data-text', value);
        else {
            this.$action.attr('data-text', null);
        }
    },
    get: function () {
        return this.attr('data-text');

    }
};

/**
 * @extends AElement
 * @constructor
 */
export function NPList() {
    this.$body = $('.as-np-list-body', this);
    this._moreText = '';
    this.$moreCtn = $('.as-np-list-more-ctn', this);
    this.$moreBtn = $('.as-np-list-more-btn', this.$moreCtn);
    this.$moreBtn.on('click', (event) => {
        this.emit('more', { type: 'more', originalEvent: event, target: this }, this);
    });
    /**
     * @name moreText
     * @type {string}
     * @memberOf NPList#
     */

}

NPList.tag = "NPList".toLowerCase();

NPList.render = function () {
    return _({
        class: 'as-np-list',
        extendEvent: ['more'],
        child: [
            {
                class: 'as-np-list-body',
            },
            {
                class: 'as-np-list-more-ctn',
                style: {
                    display: 'none'
                },
                child: {
                    tag: FlexiconButton,
                    class: 'as-np-list-more-btn'
                }
            }
        ]
    });
};


['addChild', 'removeChild', 'findChildAfter', 'findChildBefore'].forEach(key => {
    NPList.prototype[key] = function () {
        return this.$body[key].apply(this.$body, arguments);
    }
});

NPList.prototype.getChildNodes = function () {
    return Array.prototype.slice.call(this.$body.childNodes);
};

NPList.prototype.getFirstChild = function () {
    return this.$body.firstChild;
};

NPList.prototype.getLastChild = function () {
    return this.$body.lastChild;
};

NPList.prototype.addChildBefore = function (child, bf) {
    if (bf === this.firstChild) bf = this.$body.firstChild;
    else if (bf === this.lastChild) bf = this.$body.lastChild;
    return this.$body.addChildBefore(child, bf);
};

NPList.prototype.addChildAfter = function (child, at) {
    if (at === this.firstChild) at = this.$body.firstChild;
    else if (at === this.lastChild) at = this.$body.lastChild;
    return this.$body.addChildAfter(child, at);
};

NPList.prototype.scrollToEnd = function () {
    this.scrollTop = this.scrollHeight;
};


NPList.property = {};

NPList.property.moreText = {
    set: function (value) {
        value = value || '';
        if (value) {
            this.$moreCtn.removeStyle('display');
        }
        else {
            this.$moreCtn.addStyle('display', 'none');
        }
        this.$moreBtn.text = value;
    },
    get: function () {
        return this.$moreBtn.text;
    }
};

ACore.install(NPList);


/**
 * @extends AElement
 * @constructor
 */
export function NPItem() {
    this.$body = $('.as-np-item-body', this);
    this.$body.on('click', event => {
        this.emit('click', { type: 'click', originalEvent: event }, this);
    });
    this.$unreadBtn = $('.as-np-item-unread-btn', this);
    this.$unreadBtn.on('click', event => {
        this.unread = false;
        this.emit('unreadchange', { type: 'unreadchange', target: this }, this);
    });

    this.$pinBtn = $('.as-np-item-pin-btn', this);
    this.$pinBtn.on('click', event => {
        this.pin = false;
        this.emit('pinchange', { type: 'pinchange', target: this }, this);
    });

    this.$quickMenuBtn = $('.as-np-item-quick-menu-btn', this);
    this.$quickMenuCtn = $('.as-np-item-quick-menu-ctn', this);

    this._quickmenu = null;
    this.quickmenuInstance = null;

}

NPItem.tag = 'NPItem'.toLowerCase();

['addChild', 'removeChild', 'addChildBefore', 'addChildAfter', 'findChildAfter', 'findChildBefore', 'clearChild'].forEach(key => {
    NPItem.prototype[key] = function () {
        return this.$body[key].apply(this.$body, arguments);
    }
});

NPItem.render = function () {
    return _({
        class: 'as-np-item',
        extendEvent: ['click', 'unreadchange', 'pinchange'],
        child: [
            {
                tag: RelativeTimeText,
                class: 'as-np-item-body',
            },

            {
                tag: 'button',
                class: 'as-np-item-unread-btn'
            },
            {
                tag: 'button',
                class: 'as-np-item-pin-btn',
                child: 'span.mdi.mdi-pin'
            },
            {
                class: 'as-np-item-quick-menu-ctn',
                style: {
                    display: 'none'
                },
                child: [
                    {
                        tag: 'button',
                        class: ['as-np-item-quick-menu-btn'],
                        child: 'span.mdi.mdi-dots-horizontal'
                    }
                ]
            }
        ]
    });
};

NPItem.property = {};


NPItem.property.time = {
    set: function (value) {
        value = implicitDate(value);
        this.$body.time = value;
    },
    get: function () {
        return this.$time.time;
    }
};

NPItem.property.unread = {
    set: function (value) {
        if (value) {
            this.addClass('as-unread');
        }
        else {
            this.removeClass('as-unread');
        }
    },
    get: function () {
        return this.hasClass('as-unread');
    }
};

NPItem.property.pin = {
    set: function (value) {
        if (value) {
            this.addClass('as-pin');
        }
        else {
            this.removeClass('as-pin');
        }
    },
    get: function () {
        return this.hasClass('as-pin');
    }
};


NPItem.property.quickmenu = {
    set: function (value) {
        value = value || null;
        if (this.quickmenuInstance) {
            this.quickmenuInstance.remove();
        }
        this._quickmenu = value;
        if (value) {
            this.$quickMenuCtn.removeStyle('display');
            this.quickmenuInstance = new QuickMenuInstance(this.$quickMenuBtn, Object.assign({
                triggerEvent: 'click',
                anchor: [2, 5],
                menuCtn: this.$quickMenuCtn
            }, value));
        }
        else {
            this.$quickMenuCtn.addStyle('display', 'none');
        }
    },
    get: function () {
        return this._quickmenu;
    }
};


/**
 * similar to NPDropdownButton interface
 * @extends AElement
 * @constructor
 */
export function MNPNotificationVirtualDropdown() {
    document.body.appendChild(this);
    this.$body = $('.as-mb-vd-body', this);
    this.$headerBar = $('.as-mb-vd-header-bar', this)
        .on('action', this.eventHandler.action);
    MHeaderBar.on('clicknotification', () => {
        this.open();
    });
}

MNPNotificationVirtualDropdown.tag = 'MNPNotificationVirtualDropdown'.toLowerCase();

MNPNotificationVirtualDropdown.render = function () {
    return _({
        extendEvent: ['click', 'close', 'open'],
        class: ['as-mobile-notification-virtual-dropdown', 'as-hidden'],
        child: [
            {
                tag: MHeaderBar,
                class: 'as-mb-vd-header-bar',
                props: {
                    actionIcon: 'span.mdi.mdi-arrow-left'
                }
            },
            {
                class: 'as-mb-vd-body'
            }
        ]
    });
};

MNPNotificationVirtualDropdown.prototype.open = function () {
    this.emit('click', { type: 'click' }, this);
    if (!this.hasClass('as-hidden')) return;
    this.removeClass('as-hidden');
    this.emit('open', { type: 'close' }, this);
};


MNPNotificationVirtualDropdown.prototype.close = function () {
    this.emit('click', { type: 'click' }, this);
    if (this.hasClass('as-hidden')) return;
    this.addClass('as-hidden');
    this.emit('close', { type: 'close' }, this);
};

MNPNotificationVirtualDropdown.prototype.getChildNodes = function () {
    return Array.prototype.slice.call(this.$body.childNodes);
};


MNPNotificationVirtualDropdown.prototype.getChildren = function () {
    return this.getChildNodes();
};

MNPNotificationVirtualDropdown.prototype.getFirstChild = function () {
    return this.$body.firstChild;
};


MNPNotificationVirtualDropdown.prototype.getLastChild = function () {
    return this.$body.lastChild;
};

MNPNotificationVirtualDropdown.prototype.addChild = function (elt) {
    if (elt.tagName === 'H3' || elt.tagName === 'H4') {
        this.$headerBar.title = elt.innerText;
        elt.addStyle('display', 'none');
    }

    return this.$body.addChild(...arguments);
}


MNPNotificationVirtualDropdown.property = {};

MNPNotificationVirtualDropdown.property.count = {
    set: function (value) {
        MHeaderBar.notificationCount = value;
    },
    get: function () {
        return MHeaderBar.notificationCount;
    }
};


MNPNotificationVirtualDropdown.property.quickmenu = {
    set: function (value) {
        this.$headerBar.quickmenu = value;
    },
    get: function () {
        return this.$headerBar.quickmenu
    }
};
MNPNotificationVirtualDropdown.eventHandler = {};

MNPNotificationVirtualDropdown.eventHandler.action = function () {
    this.close();
};


ACore.install(MNPNotificationVirtualDropdown);