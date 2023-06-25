import ACore, { _, $, $$ } from "../ACore";
import { isDomNode } from "absol/src/HTML5/Dom";
import Tooltip from "./Tooltip";
import { copyText } from "absol/src/HTML5/Clipboard";
import Snackbar from "./Snackbar";
import MultiLanguageText from "./MultiLanguageText";


/***
 * @extends {AElement}
 * @constructor
 */
function CopyableIconTooltip() {
    this._content = '';
    this.$content = null;
    this._value = '';
    this._icon = 'span.mdi.mdi-information-outline';
    this.$icon = $('.as-cit-icon', this);
    this.tooltip = new TooltipController(this);
}

CopyableIconTooltip.tag = 'CopyableIconTooltip'.toLowerCase();

CopyableIconTooltip.render = function () {
    return _({
        tag: 'button',
        class: 'as-copyable-icon-tooltip',
        child: 'span.mdi.mdi-information-outline.as-cit-icon'
    });
};


CopyableIconTooltip.property = {};

CopyableIconTooltip.property.content = {
    set: function (value) {
        this._content = value || '';
        if (typeof this._content === "object") {
            this.$content = _(this._content);
        }
        else if (typeof this._content === "string") {
            this.$content = _({
                tag: 'span',
                style:{'white-space':'pre-wrap'},
                props:{
                    innerHTML: this._content
                }
            });

            MultiLanguageText.replaceAll(this.$content);
        }
    },
    get: function () {
        return this._content;
    }
};

CopyableIconTooltip.property.icon = {
    set: function (value) {
        value = value || '';
        this._icon = value;
        this.clearChild();
        this.$icon = null;
        if (value) {
            if (isDomNode(value)) {
                if (value.parentElement) value = value.cloneNode(true);
            }
            else value = _(value);
            this.$icon = $(value).addClass('as-cit-icon');
            this.addChild(this.$icon);
        }
    },
    get: function () {
        return this._icon;
    }
};

CopyableIconTooltip.property.value = {
    set: function (value) {
        this._value = value;
    },
    get: function () {
        return this._value;
    }
};

/***
 *
 * @param {CopyableIconTooltip} elt
 * @constructor
 */
function TooltipController(elt) {
    /***
     *
     * @type {CopyableIconTooltip}
     */
    this.elt = elt;
    this.elt.on('mouseenter', this.ev_mouseEnter.bind(this));
    this.elt.on('mouseleave', this.ev_mouseLeave.bind(this));
    this.elt.on('click', this.ev_click.bind(this));
    this.session = -2;
    this.timeout = -1;
}


TooltipController.prototype.ev_mouseEnter = function () {
    clearTimeout(this.timeout);
    if (this.elt.$content)
    this.session = Tooltip.show(this.elt, this.elt.$content, 'auto');
};

TooltipController.prototype.ev_mouseLeave = function () {
    this.timeout = setTimeout(() => {
        Tooltip.close(this.session);
    }, 500)
};


TooltipController.prototype.ev_click = function () {
    var text;
    if (this.elt._value !== null && this.elt._value !== undefined) {
        text = this.elt._value + '';
    }
    else if (typeof this.elt._content === "string") {
        text = this.elt._content;
    }
    else {
        text = this.elt.$content.innerText;
    }

    copyText(text);
    Snackbar.show('Copied: ' + text);
};
export default CopyableIconTooltip;