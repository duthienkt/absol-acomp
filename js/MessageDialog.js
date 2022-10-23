import ACore, { $, _ } from "../ACore";
import FlexiconButton from "./FlexiconButton";
import '../css/messagedialog.css';

/***
 * @extends AElement
 * @constructor
 */
function MessageDialog() {
    this.$header = $('.as-message-dialog-header', this);
    this.$title = _({
        tag: 'span',
        class: 'as-message-dialog-title',
        child: { text: '' }
    });
    this.$body = $('.as-message-dialog-body', this);
    this.$footer = $('.as-message-dialog-footer', this);
    this.$actionBtns = [];
}


MessageDialog.tag = 'MessageDialog'.toLowerCase();


MessageDialog.render = function () {
    return _({
        extendEvent: ['action'],
        class: 'as-message-dialog',
        child: [
            {
                class: 'as-message-dialog-header',

            },
            {
                class: 'as-message-dialog-body'
            },
            {
                class: 'as-message-dialog-footer'
            }
        ]
    });
};


['addChild', 'removeChild', 'clearChild', 'addChildBefore', 'addChildAfter'].forEach(key => {
    MessageDialog.prototype[key] = function () {
        this.$body[key].apply(this.$body, arguments);
        return this;
    };
});


MessageDialog.prototype._makeActionBtn = function (action) {
    var button =  _({
        tag: FlexiconButton.tag,
        class: action.class || [],
        props: {
            text: action.text || action.name,
            icon: action.icon || null
        },
        on: {
            click: (event) => {
                this.emit('action', { type: 'action', target: this, originalEvent: event, action: action }, this);
            }
        }
    });

    if (action.name) button.attr('data-name', action.name);

    return button;
};

MessageDialog.property = {};


MessageDialog.property.dialogActions = {
    /***
     * @this MessageDialog
     * @param actions
     */
    set: function (actions) {
        this._actions = actions || [];
        this.$actionBtns.forEach(button => button.remove());
        this.$actionBtns = this._actions.map(action => this._makeActionBtn(action));
        this.$footer.addChild(this.$actionBtns);
    },
    get: function () {
        return this._actions;
    }
};

MessageDialog.property.dialogTitle = {
    set: function (value) {
        this._dialogTitle = value;
        this.$title.firstChild.data = '';
        this.$title.attr('data-ml-key', undefined);
        if (typeof value === "string") {
            this.$title.firstChild.data = value;

        }
        else if (value && value.mlKey) {
            this.$title.firstChild.data = '';
            this.$title.attr('data-ml-key', value.mlKey);
        }

        if (value && !this.$title.parentElement) {
            this.$header.addChild(this.$title);
        }
        else if (!value && this.$title.parentElement) {
            this.$title.remove();
        }
    },
    get: function () {
        return this._dialogTitle;
    }
};


ACore.install(MessageDialog);

export default MessageDialog;