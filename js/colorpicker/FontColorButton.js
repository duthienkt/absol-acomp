import "../RibbonSplitButton";
import { _, $ } from '../../ACore';
import { FontColorIcon } from "../Icons";
import Follower from "../Follower";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { findMaxZIndex } from "../utils";
import SolidColorPicker from "./SolidColorPicker";

/**
 * @extends AElement
 * @constructor
 */
function FontColorButton() {
    this.$value = $('.as-font-color-button-value', this);
    this.$primary = $('.as-ribbon-split-button-primary', this).on('click', () => {
        this.emit('submit', {
            type: 'submit',
            target: this
        }, this);
    });
    this.$extend = $('.as-ribbon-split-button-extend', this);
    new FCBPickerController(this);

    /**
     * @type {string}
     * @name value
     * @memberof FontColorButton#
     */
}

FontColorButton.tag = 'FontColorButton'.toLowerCase();

FontColorButton.render = function () {
    return _({
        extendEvent: ['submit', 'change'],
        attr: {
            'tabindex': '0'
        },
        class: ['as-ribbon-split-button'],
        child: {
            class: 'as-ribbon-split-button-content',
            child: [
                {
                    tag: 'button',
                    attr: {
                        'tabindex': '-1'
                    },
                    class: 'as-ribbon-split-button-primary',
                    child: {
                        tag: FontColorIcon,
                        class: 'as-font-color-button-value',
                        style: {
                            width: '18px',
                            height: '18px'
                        }
                    }
                },
                {
                    tag: 'button',
                    attr: {
                        'tabindex': '-1'
                    },
                    class: 'as-ribbon-split-button-extend',
                    child: ['span.as-ribbon-split-button-text', 'span.mdi.mdi-chevron-down']
                }
            ]
        }
    });
};

FontColorButton.property = {};
FontColorButton.property.value = {
    set: function (value) {
        this.$value.value = value;
    },
    get: function () {
        return this.$value.value;
    }
};


export default FontColorButton;

/**
 *
 * @param {FontColorButton} elt
 * @constructor
 */
function FCBPickerController(elt) {
    this.elt = elt;
    this['ev_clickExtend'] = this['ev_clickExtend'].bind(this);
    this['ev_clickOut'] = this['ev_clickOut'].bind(this);
    this['ev_submit'] = this['ev_submit'].bind(this);
    this['ev_change'] = this['ev_change'].bind(this);
    this.elt.$extend.on('click', this.ev_clickExtend);
}

FCBPickerController.prototype.ev_clickExtend = function () {
    this.openPicker();
};

FCBPickerController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.share.$picker, event)) return;
    this.closePicker();
};

FCBPickerController.prototype.ev_submit = function () {
    var prevValue = this.elt.value;
    this.elt.value = this.share.$picker.value;
    this.closePicker();
    if (prevValue !== this.elt.value) {
        this.elt.emit('change', { type: 'change', target: this.elt }, this.elt);
    }
    this.elt.emit('submit', { type: 'submit', target: this.elt }, this.elt);
};

FCBPickerController.prototype.ev_change = function () {
    var prevValue = this.elt.value;
    this.elt.value = this.share.$picker.value;
    if (prevValue !== this.elt.value) {
        this.elt.emit('change', { type: 'change', target: this.elt }, this.elt);
    }
};

FCBPickerController.prototype.share = {
    $picker: null,
    $follower: null,
    holder: null
};

FCBPickerController.prototype.prepare = function () {
    if (this.share.$follower) return;
    this.share.$picker = _({
        tag: SolidColorPicker,
        props: {
            hasOpacity: false
        }
    });
    this.share.$follower = _({
        tag: Follower,
        child: this.share.$picker,
        props: {
            anchor: [2, 1, 6, 5, 9, 11]
        }
    });
};

FCBPickerController.prototype.openPicker = function () {
    this.prepare();
    if (this.share.holder) this.share.holder.closePicker();
    this.share.holder = this;
    this.share.$follower.addStyle('visibility', 'hidden');
    this.share.$follower.addTo(document.body);
    this.share.$follower.followTarget = this.elt.$extend;
    this.share.$follower.sponsorElement = this.elt.$extend;
    this.share.$follower.addStyle('z-index', findMaxZIndex(this.elt.$extend));
    this.share.$follower.removeStyle('visibility');
    this.elt.$extend.off('click', this.ev_clickExtend);
    this.share.$picker.on('submit', this.ev_submit);
    this.share.$picker.on('change', this.ev_change);
    this.share.$picker.value = this.elt.value;
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
    }, 5);
};


FCBPickerController.prototype.closePicker = function () {
    if (this.share.holder !== this) return;
    this.share.holder = null;
    document.removeEventListener('click', this.ev_clickOut);
    this.share.$picker.off('submit', this.ev_submit);
    this.share.$picker.off('change', this.ev_change);

    setTimeout(() => {
        this.elt.$extend.on('click', this.ev_clickExtend);
    }, 5)
    this.share.$follower.followTarget = null;
    this.share.$follower.remove();
};