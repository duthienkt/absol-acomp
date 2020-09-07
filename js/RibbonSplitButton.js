import '../css/ribbonsplitbutton.css';
import ACore from "../ACore";
import QuickMenu from "./QuickMenu";
import {cleanMenuItemProperty} from "./utils";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function RibbonSplitButton() {
    this.$icon = null;
    this._icon = null;
    this.$text = $('.as-ribbon-split-button-text', this);
    this.$textNode = this.$text.firstChild;
    this.$primaryBtn = $('.as-ribbon-split-button-primary', this)
        .on('click', this.eventHandler.clickPrimaryBtn);
    this.$extendBtn = $('.as-ribbon-split-button-extend', this);
    this._menuHolder = null;
}

RibbonSplitButton.tag = 'RibbonSplitButton'.toLowerCase();

RibbonSplitButton.render = function () {
    return _({
        extendEvent: ['press', 'select'],
        attr: {
            'tabindex': '0'
        },
        class: ['as-ribbon-split-button', 'as-no-dropdown'],
        child: {
            class: 'as-ribbon-split-button-content',
            child: [
                {
                    tag: 'button',
                    attr: {
                        'tabindex': '-1'
                    },
                    class: 'as-ribbon-split-button-primary',
                    child: { tag: 'span', class: 'as-ribbon-split-button-text', child: { text: '' } }
                },
                {
                    tag: 'button',
                    attr: {
                        'tabindex': '-1'
                    },
                    class: 'as-ribbon-split-button-extend',
                    child: 'span.mdi.mdi-chevron-down'
                }
            ]
        }
    });
};

RibbonSplitButton.property = {};

RibbonSplitButton.property.items = {
    set: function (items) {
        var thisB = this;
        this._items = items || [];
        if (this._items && this._items.length > 0) {
            if (!this._menuHolder) {
                this.removeClass('as-no-dropdown');
                this._menuHolder = QuickMenu.toggleWhenClick(this.$extendBtn, {
                    getMenuProps: function () {
                        return {
                            items: thisB._items
                        }
                    },
                    getFlowedElement: function () {
                        return thisB;
                    },
                    anchor: [1, 2, 6, 5],
                    onSelect: function (item) {
                        thisB.emit('select', { item: cleanMenuItemProperty(item), type: 'select', target: thisB });
                    }
                });
            }
        }
        else {
            if (this._menuHolder) {
                this.addClass('as-no-dropdown');

            }
        }
    },
    get: function () {
        return this._items;
    }
};

RibbonSplitButton.property.text = {
    set: function (value) {
        value = value || '';
        this.$textNode.data = value;
    },
    get: function () {
        return this.$textNode.data;
    }
};


RibbonSplitButton.property.icon = {
    set: function (icon) {
        icon = icon || null;
        this._icon = icon;
        if (this.$icon) this.removeChild(this.$icon);
        if (icon) {
            this.$icon = _(icon);
            this.$primaryBtn.addChildBefore(this.$icon, this.$text);
            if (this.$icon.addClass) this.$icon.addClass('as-ribbon-split-button-icon');
        }
        else {
            this.$icon = null;
        }
    },
    get: function () {
        return this._icon;
    }
};


RibbonSplitButton.eventHandler = {};

RibbonSplitButton.eventHandler.clickPrimaryBtn = function () {
    this.emit('press', { type: 'press', target: this, item: cleanMenuItemProperty(this) })
}

ACore.install(RibbonSplitButton);

export default RibbonSplitButton;