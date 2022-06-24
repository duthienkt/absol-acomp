import '../css/flexiconbutton.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function FlexiconButton() {
    this._icon = null;
    this.$content = $('.as-flexicon-button-content', this);
    this.$iconCtn = $('.as-flexicon-button-icon-container', this);
    this.$textCtn = $('.as-flexicon-button-text-container', this);
}

FlexiconButton.tag = 'FlexiconButton'.toLowerCase();

FlexiconButton.render = function () {
    return _({
        tag: 'button',
        class: 'as-flexicon-button',
        child: {
            class: 'as-icon-button-table-box',
            child: {
                class: 'as-flexicon-button-content',
                child: [
                    '.as-flexicon-button-icon-container',
                    '.as-flexicon-button-text-container',
                ]
            }
        }
    });
};

FlexiconButton.property = {};

FlexiconButton.property.icon = {
    set: function (value) {
        value = value || null;
        this._icon = value;
        this.$iconCtn.clearChild();
        if (value !== null) {
            this.$iconCtn.addChild(_(value));
        }
    },
    get: function () {
        return this._icon;
    }
};

FlexiconButton.property.text = {
    /***
     *
     * @param {string| {mlKey:string}|*} value
     */
    set: function (value) {
        value = value || null;
        this._text = value;
        this.$textCtn.clearChild();
        this.$textCtn.attr('data-ml-key', undefined);
        if (value === null || value === undefined) {

        }
        else if (typeof value === "object") {
            if (value.mlKey) {
                this.$textCtn.attr('data-ml-key', value.mlKey);
            }
        }
        else {
            this.$textCtn.addChild(_({ text: value + '' }));
        }
    },
    get: function () {
        return this._text;
    }
};


ACore.install(FlexiconButton);


export default FlexiconButton;