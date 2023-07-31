import ACore, { $, _ } from "../ACore";
import OOP from "absol/src/HTML5/OOP";

/**
 * @typedef WindowBoxAction
 * @property icon
 * @property name
 *
 */

/***
 * @extends AElement
 * @constructor
 */
function WindowBox() {
    this.$header = $('.as-window-box-header', this);
    /***
     *
     * @type {WindowBoxAction[]}
     * @private
     */
    this._windowActions = [];
    this.$windowActionButtonCtn = $('.as-window-box-header-button-ctn', this);
    this._windowIcon = null;
    this.$windowIconCtn = $('.as-window-box-header-icon-ctn', this);


    /**
     *
     * @type {Text}
     */
    this.$windowTitleText = $('.as-window-box-header-title', this).firstChild;

    this.$body = $('.as-window-box-body', this);

    /***
     * @type {WindowBoxAction[]}
     * @name windowActions
     */
}

WindowBox.tag = 'WindowBox'.toLowerCase();

WindowBox.render = function () {
    return _({
        class: 'as-window-box',
        extendEvent: ['action'],
        child: [
            {
                class: 'as-window-box-header',
                child: [
                    {
                        class: 'as-window-box-header-icon-ctn'
                    },
                    {
                        class: 'as-window-box-header-title',
                        child: { text: '' }
                    },
                    {
                        class: "as-window-box-header-button-ctn"
                    }
                ]
            },
            {
                class: 'as-window-box-body'
            }
        ]
    });
};


['addChild', 'addChildBefore', 'addChildAfter', 'clearChild', 'findChildBefore', 'findChildAfter'].forEach(function (key) {
    WindowBox.prototype[key] = function () {
        return this.$body[key].apply(this.$body, arguments);
    };
});


WindowBox.property = {};


WindowBox.property.windowTitle = {
    set: function (value) {
        this.$windowTitleText.data = (value || '') + '';
    },
    get: function () {
        return this.$windowTitleText.data;
    },
    enumerable: true
};


WindowBox.property.windowIcon = {
    /***
     * @this WindowBox
     * @param value
     */
    set: function (value) {
        value = value || null;
        this.$windowIconCtn.clearChild();
        if (value) {
            this.$windowIconCtn.addChild(_(value));
        }
        this._windowIcon = value;
    },
    get: function () {
        return this._windowIcon;
    },
    enumerable: true
};

WindowBox.property.windowActions = {
    set: function (actions) {
        var self = this;
        this._windowActions = actions || [];
        this.$windowActionButtonCtn.clearChild();
        var buttons = this._windowActions.map(function (action) {
            return _({
                tag: 'button',
                class: action.class || [],
                child: action.icon,
                on: {
                    click: function (event) {
                        var eventData = { type: 'action', target: self, action: action, originalEvent: event };
                        OOP.drillProperty(eventData, eventData, 'actionData', 'action');
                        self.emit('action', eventData, self);
                    }
                }
            });
        });
        this.$windowActionButtonCtn.addChild(buttons);
    },
    get: function () {
        return this._windowActions;
    }
};


ACore.install(WindowBox);

export default WindowBox;