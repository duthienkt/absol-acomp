import '../css/ribbonbutton.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import RibbonSplitButton from "./RibbonSplitButton";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function RibbonButton() {
    this.$icon = null;
    this._icon = null;
    this.$text = $('.as-ribbon-button-text', this);
    this.$textNode = this.$text.firstChild;
    this._menuHolder = null;
}

RibbonButton.tag = 'RibbonButton'.toLowerCase();

RibbonButton.render = function () {
    return _({
        tag: 'button',
        extendEvent: ['select'],
        attr: {
            'tabindex': '0'
        },
        class: ['as-ribbon-button', 'as-no-dropdown'],
        child: [
            {
                tag: 'span', class: 'as-ribbon-button-text',
                child: { text: '' }
            },
            'span.mdi.mdi-chevron-down.as-ribbon-dropdown-icon'
        ]
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
            this.addChildBefore(this.$icon, this.$text);
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