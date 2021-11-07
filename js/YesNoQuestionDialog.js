import ACore, {_, $} from "../ACore";
import '../css/messagedialog.css';
import FlexiconButton from "./FlexiconButton";


/***
 * @extends AElement
 * @constructor
 */
function YesNoQuestionDialog() {
    this.$yesBtn = $('.as-message-dialog-yes-btn', this)
        .on('click', this.eventHandler.action.bind(null, 'yes'));
    this.$noBtn = $('.as-message-dialog-no-btn', this)
        .on('click', this.eventHandler.action.bind(null, 'no'));
    this.$title = $('.as-message-dialog-title', this);
    this.$message = $('.as-message-dialog-message', this);
}

YesNoQuestionDialog.tag = 'YesNoQuestionDialog'.toLowerCase();

YesNoQuestionDialog.render = function () {
    return _({
        extendEvent: ['action'],
        class: 'as-message-dialog',
        child: [
            {
                class: 'as-message-dialog-header',
                child: {
                    tag: 'span',
                    class: 'as-message-dialog-title',
                    child: {text: ''}
                }
            },
            {
                class: 'as-message-dialog-body',
                child: {
                    tag: 'span',
                    class: 'as-message-dialog-message',
                    child: {text: ''}
                }
            },
            {
                class: 'as-message-dialog-footer',
                child: [
                    {
                        tag: FlexiconButton.tag,
                        class: ['as-message-dialog-no-btn', 'secondary'],
                        props: {
                            text: 'No'
                        }
                    },
                    {
                        tag: FlexiconButton.tag,
                        class: ['as-message-dialog-yes-btn', 'primary'],
                        props: {
                            text: 'Yes'
                        }
                    }
                ]
            }
        ]
    });
};

YesNoQuestionDialog.eventHandler = {};


YesNoQuestionDialog.eventHandler.action = function (action, event) {
    this.emit('action', {type: 'action', target: this, originalEvent: event, action: action}, this);
};

YesNoQuestionDialog.property = {};

YesNoQuestionDialog.property.dialogTitle = {
    set: function (value) {
        value = (value || '') + '';
        this.$title.firstChild.data = value;
    },
    get: function () {
        return this.$title.firstChild.data;
    }
};

YesNoQuestionDialog.property.message = {
    set: function (value) {
        value = (value || '') + '';
        this.$message.firstChild.data = value;
    },
    get: function () {
        return this.$message.firstChild.data;
    }
};

YesNoQuestionDialog.property.textYes = {
    set: function (value) {
        value = (value || 'Yes') + '';
        this.$yesBtn.text = value;
    },
    get: function () {
        return this.$yesBtn.text;
    }
};


YesNoQuestionDialog.property.textNo = {
    set: function (value) {
        value = (value || 'No') + '';
        this.$noBtn.text = value;
    },
    get: function () {
        return this.$noBtn.text;
    }
};


ACore.install(YesNoQuestionDialog);


export default YesNoQuestionDialog;