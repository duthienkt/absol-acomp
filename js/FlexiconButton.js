import '../css/flexiconbutton.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import Attributes from "absol/src/AppPattern/Attributes";
import { mixClass } from "absol/src/HTML5/OOP";
import { AbstractStyleExtended } from "./Abstraction";

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

    AbstractStyleExtended.call(this);
}

mixClass(FlexiconButton, AbstractStyleExtended);

FlexiconButton.tag = 'FlexiconButton'.toLowerCase();

/**
 *
 * @type {Attributes &any}
 */
FlexiconButton.prototype.extendStyle.variant = 'v0';
FlexiconButton.prototype.extendStyle.iconPosition = 'start';


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


FlexiconButton.prototype.styleHandlers.variant = {
    set: function (value) {
        if (['v0', 'primary', 'tertiary', 'secondary', 'light', 'link', 'danger'].indexOf(value) < 0) {
            value = 'v0';
        }
        this.attr('data-variant', value);
        return value;
    },
};

FlexiconButton.prototype.styleHandlers.iconPosition = {
    /**
     * @this {FlexiconButton}
     * @param value
     */
    set: function (value) {
        if (['right', 'end'].indexOf(value) >= 0) {
            value = 'end';
        }
        else value = 'start';
        this.attr('data-icon-position', value);
    }
};


FlexiconButton.property = {};

FlexiconButton.property.icon = {
    set: function (value) {
        value = value || null;
        this._icon = value;
        this.$iconCtn.clearChild();
        if (value !== null) {
            this.addClass('as-has-icon');
            this.$iconCtn.addChild(_(value));
        }
        else {
            this.removeClass('as-has-icon');
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