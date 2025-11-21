import '../../css/mobileapp.css';
import ACore, { _, $ } from "../../ACore";
import QuickMenu from "../QuickMenu";
import { isNaturalNumber } from "../utils";
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import EventEmitter from "absol/src/HTML5/EventEmitter";

/**
 * @augments HTMLElement
 * @exatends AElement
 * @constructor
 */
function MHeaderBar() {
    this._title = null;
    this._titleDesc = null;
    this._actionIcon = null;
    this._commands = [];

    this._quickmenuHolder = null;
    this._quickmenu = null;
    this.$right = $('.am-header-bar-right', this);
    this.$leftBtn = null;
    this.$titleCtn = null;
    this.$title = null;
    this.$titleDesc = null;
    // this.$notificationActionBtn = $(".as-header-bar-notification-action", this).on('click', (event) => {
    //     MHeaderBar.emit('clicknotification', { type: 'clicknotification', target: this }, this);
    // });
    this.$commands = [];
}

MHeaderBar.tag = 'MHeaderBar'.toLowerCase();
MHeaderBar.render = function () {
    return _({
        extendEvent: ['action', 'command'],
        class: 'am-header-bar',
        child: [
            {
                class: 'am-header-bar-right',
                child: [
                    // {
                    //     tag: 'button',
                    //     class: ['am-header-bar-command', 'as-header-bar-notification-action'],
                    //     child: [
                    //         'span.mdi.mdi-bell',
                    //         '.as-header-bar-notification-action-count',
                    //     ]
                    // }
                ]
            }
        ]
    });
};


MHeaderBar.prototype.notifyAction = function () {
    this.emit('action', { type: 'action', target: this }, this);
};


MHeaderBar.prototype.notifyCommand = function (commandItem) {
    this.emit('command', { type: 'command', target: this, commandName: commandItem.name, commandItem }, this);
};


MHeaderBar.prototype.showTitle = function (flag) {
    if (!this.$titleCtn && flag) {
        this.$titleCtn = _({
            class: 'am-header-bar-title-ctn',
            child: [
                {
                    class: 'am-header-bar-no-size-wrapper',
                    child: {
                        class: 'am-header-bar-title-wrapper',
                        child: [
                            {
                                class: 'am-header-bar-title',
                            },
                            {
                                class: 'am-header-bar-title-desc'
                            }
                        ]
                    }

                }
            ]
        });

        this.$title = $('.am-header-bar-title', this.$titleCtn);
        this.$titleDesc = $('.am-header-bar-title-desc', this.$titleCtn);
    }
    if (flag) {
        this.insertBefore(this.$titleCtn, this.$right);
    }
    else {
        if (this.$titleCtn) this.$titleCtn.remove();
    }
};

MHeaderBar.prototype.showActionBtn = function (flag) {
    if (!this.$leftBtn && flag) {
        this.$leftBtn = _({
            tag: 'button',
            class: 'am-header-bar-left-btn',
            child: 'span.mdi.mdi-chevron-left',
            on: {
                click: this.notifyAction.bind(this)
            }
        });
    }
    if (flag) {
        this.insertBefore(this.$leftBtn, this.firstChild);
    }
    else {
        if (this.$leftBtn) this.$leftBtn.remove();
    }
};


MHeaderBar.prototype.showQuickMenu = function (flag) {
    if (!this.$quickmenuBtn && flag) {
        this.$quickmenuBtn = _({
            tag: 'button',
            class: ['am-header-bar-action', 'am-header-bar-quickmenu-btn'],
            child: {
                class: 'am-header-bar-quickmenu-btn-circle',
                child: ['span.mdi.mdi-dots-horizontal-circle-outline', 'span.mdi.mdi-dots-horizontal-circle']
            }
        });
    }

    if (flag) {
        // this.$right.addChildBefore(this.$quickmenuBtn, this.$notificationActionBtn);
        this.$right.addChild(this.$quickmenuBtn);
    }
    else {
        if (this.$quickmenuBtn) this.$quickmenuBtn.remove();
    }
};


MHeaderBar.prototype._makeCommandBtn = function (item) {
    return _({
        tag: 'button',
        class: 'am-header-bar-command',
        child: item.icon || [],
        on: {
            click: this.notifyCommand.bind(this, item)
        }
    });
};

MHeaderBar.property = {};

/**
 * @type {MHeaderBar}
 */
MHeaderBar.property.quickmenu = {
    set: function (value) {
        if (this._quickmenuHolder) {
            this._quickmenuHolder.remove();
            this._quickmenu = null;
        }
        if (value) {
            this.showQuickMenu(true);
            var button = this.$quickmenuBtn;
            if (value.icon) {
                button.clearChild().addChild(_(value.icon));//custom icon
            }
            var onClose = value.onClose;
            var onOpen = value.onOpen;
            value.onOpen = function () {
                button.addClass('am-status-active');
                onOpen && onOpen.apply(this, arguments);
            };
            value.onClose = function () {
                button.removeClass('am-status-active');
                onClose && onClose.apply(this, arguments);
            };
            if (!value.getAnchor) {
                value.getAnchor = function () {
                    return [2];
                }
            }
            if (!value.getMenuProps && value.props) {
                value.getMenuProps = function () {
                    var res = Object.assign({}, value.props);
                    if (typeof res.items === "function") {
                        res.items = res.items();
                    }
                    return res;
                }
            }
            this._quickmenuHolder = QuickMenu.toggleWhenClick(this.$quickmenuBtn, value);
        }
        else {
            this.showQuickMenu(false);
            value = null;
        }
        this._quickmenu = value;
    },
    get: function () {
        return this._quickmenu;
    }
};


/**
 * @type {MHeaderBar}
 */
MHeaderBar.property.title = {
    set: function (value) {
        if (value) {
            this.showTitle(true);
            if (typeof value === 'string') {
                this.$title.innerHTML = value;
            }
            else {
                this.$title.clearChild().addChild(_(value));
            }
        }
        else {
            this.showTitle(false);
            value = null;
        }
        this._title = value;
    },
    get: function () {
        return this._title;
    }
};

/**
 * @type {MHeaderBar}
 */
MHeaderBar.property.titleDesc = {
    set: function (value) {
        if (value) {
            value = value + '';
            this.showTitle(true);
            this.$titleDesc.clearChild().addChild(_({ text: value }));
        }
        else {
            this.showTitle(false);
            if (this.$titleDesc) this.$titleDesc.clearChild();
            value = null;
        }
        this._titleDesc = value;
    },
    get: function () {
        return this._titleDesc;
    }
};

/**
 * @type {MHeaderBar}
 */
MHeaderBar.property.actionIcon = {
    set: function (value) {
        if (value) {
            this.showActionBtn(true);
            this.$leftBtn.clearChild()
                .addChild(_(value));
        }
        else {
            this.showActionBtn(false);
            value = null;
        }
        this._actionIcon = value;
    },
    get: function () {
        return this._actionIcon;
    }
};


/**
 * @type {MHeaderBar}
 */
MHeaderBar.property.commands = {
    set: function (value) {
        this.$commands.forEach(function (e) {
            e.selftRemove();
        });
        this.$commands = [];
        var commandBtn;
        var i;
        if (value) {
            var firstChild = this.$right.firstChild;
            if (firstChild) {
                for (i = 0; i < value.length; ++i) {
                    commandBtn = this._makeCommandBtn(value[i]);
                    this.$right.addChildBefore(commandBtn, firstChild)
                }
            }
            else {
                for (i = 0; i < value.length; ++i) {
                    commandBtn = this._makeCommandBtn(value[i]);
                    this.$right.addChild(commandBtn);
                }
            }
        }
        else {
            this._commands = [];
        }
        this._commands = value;
    },
    get: function () {
        return this._commands;
    }
};


ACore.install(MHeaderBar);

export default MHeaderBar;


var notyEmitter = new EventEmitter();

MHeaderBar.on = notyEmitter.on.bind(notyEmitter);
MHeaderBar.once = notyEmitter.once.bind(notyEmitter);
MHeaderBar.off = notyEmitter.off.bind(notyEmitter);
MHeaderBar.emit = notyEmitter.emit.bind(notyEmitter);


var notificationCount = 0;
/**
 *
 * @type {null|DynamicCSS}
 */
var ncCSS = null;

function updateNotificationCountText() {
    if (!ncCSS) ncCSS = new DynamicCSS();
    ncCSS.setRule("button .as-header-bar-notification-action-count::before", {
        display: notificationCount > 0 ? 'block' : 'none',
        content: `"${notificationCount > 9 ? "+9" : notificationCount}"`,
    }).commit();
}

Object.defineProperty(MHeaderBar, 'notificationCount', {
    set: function (value) {
        value = Math.round(value);
        if (!isNaturalNumber(value)) value = 0;
        notificationCount = value;
        updateNotificationCountText();
    },
    get: function () {
        return notificationCount;
    }
});
