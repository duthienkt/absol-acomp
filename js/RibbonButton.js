import '../css/ribbonbutton.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import RibbonSplitButton from "./RibbonSplitButton";
import { AbstractStyleExtended } from "./Abstraction";
import { mixClass } from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function RibbonButton() {
    this.$icon = null;
    this._icon = null;
    this.$content = $('.as-ribbon-button-content', this);
    this.$textCtn = $('.as-ribbon-button-text-ctn', this);
    this.$text = $('.as-ribbon-button-text', this);
    this.$textNode = this.$text.firstChild;
    this._menuHolder = null;
    AbstractStyleExtended.call(this);
}

mixClass(RibbonButton, AbstractStyleExtended);

RibbonButton.tag = 'RibbonButton'.toLowerCase();

RibbonButton.prototype.extendStyle.variant = 'v0';

RibbonButton.prototype.styleHandlers.variant = {
    set: function (value) {
        if (['v0', 'primary', 'tertiary', 'secondary', 'light', 'link','danger'].indexOf(value) < 0) {
            value = 'v0';
        }
        if (value !== 'v0' && this.extendStyle.size === 'v0') {
            this.extendStyle.size = 'regular';//auto set new style
        }
        this.attr('data-variant', value);
        return value;
    }
};

RibbonButton.render = function () {
    return _({
        tag: 'button',
        extendEvent: ['select'],
        attr: {
            'tabindex': '0'
        },
        class: ['as-ribbon-button', 'as-no-dropdown'],
        child: {
            class: 'as-ribbon-button-content',
            child: [
                {
                    class: 'as-ribbon-button-text-ctn',
                    child: [
                        {
                            tag: 'span', class: 'as-ribbon-button-text',
                            child: { text: '' }
                        },
                        'span.mdi.mdi-chevron-down.as-ribbon-dropdown-icon'
                    ]
                }
            ]
        }
    });
};

RibbonButton.property = Object.assign({}, RibbonSplitButton.property);


RibbonButton.property.icon = {
    set: function (icon) {
        icon = icon || null;
        this._icon = icon;
        if (this.$icon) this.removeChild(this.$icon);
        if (icon) {
            this.$icon = _(icon);
            this.$content.addChildBefore(this.$icon, this.$textCtn);
            if (this.$icon.addClass) this.$icon.addClass('as-ribbon-button-icon');
        }
        else {
            this.$icon = null;
        }
    },
    get: function () {
        return this._icon;
    }
};


RibbonButton.eventHandler = {};

ACore.install(RibbonButton);

export default RibbonButton;