import ACore, { _, $ } from "../ACore";
import '../css/messagedialog.css';
import MessageDialog from "./MessageDialog";


/***
 * @extends MessageDialog
 * @constructor
 */
function YesNoQuestionDialog() {
    this.dialogActions = [
        {
            class: 'secondary',
            text: 'No'
        },
        {
            class: 'primary',
            text: 'Yes'
        }
    ];

    this.$yesBtn = this.$actionBtns[1];
    this.$noBtn = this.$actionBtns[0];
    this.$message = $('.as-message-dialog-message', this);
    /*{
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
        }*/
}

YesNoQuestionDialog.tag = 'YesNoQuestionDialog'.toLowerCase();

YesNoQuestionDialog.render = function () {
    return _({
        tag: MessageDialog.tag,
        child: [
            {
                tag: 'span',
                class: 'as-message-dialog-message',
                child: { text: '' }
            }
        ]
    });

};

YesNoQuestionDialog.eventHandler = {};


YesNoQuestionDialog.property = {};


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
        this.dialogActions[1].text = value;
    },
    get: function () {
        return this.$yesBtn.text;
    }
};


YesNoQuestionDialog.property.textNo = {
    set: function (value) {
        value = (value || 'No') + '';
        this.$noBtn.text = value;
        this.dialogActions[0].text = value;
    },
    get: function () {
        return this.$noBtn.text;
    }
};


ACore.install(YesNoQuestionDialog);


export default YesNoQuestionDialog;