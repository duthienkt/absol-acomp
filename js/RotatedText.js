import ACore, {_, $} from '../ACore';
import '../css/rotatedtext.css';
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

/***
 * @extends AElement
 * @constructor
 */
function RotatedText() {
    this.$attachHook = $('attachhook', this);
    this.$attachHook.requestUpdateSize = this.eventHandler.positionChange;
    this.$attachHook.on('attached', this.eventHandler.attached);
    this.$anchor = $('.as-rotated-text-anchor', this);
    this.$content = $('.as-rotated-text-content', this);
    this.$contentText = this.$content.firstChild;
    this.$trackElts = [];
    this._angle = 0;
    this.angle = 0;
    this.text = '';
    this._trackInterval = -1;

}

RotatedText.tag = 'RotatedText';

RotatedText.render = function () {
    return _({
        tag: 'span',
        class: 'as-rotated-text',
        child: [
            'attachhook',
            {
                class:'as-rotated-text-anchor',
                child: {
                    tag: 'span',
                    class: 'as-rotated-text-content',
                    child: { text: '' }
                }
            }
        ]
    });
};

RotatedText.prototype._trackPosition = function () {
    this._cancelTrackPosition();
    var parent = this.parentElement;
    while (parent) {
        parent.addEventListener('scroll', this.eventHandler.positionChange);
        this.$trackElts.push(parent);
        parent = parent.parentElement;
    }
    document.addEventListener('scroll', this.eventHandler.positionChange);
    this.$trackElts.push(document);
    this._trackInterval = setInterval(this.eventHandler.intervalCheck, 3000);
};


RotatedText.prototype._cancelTrackPosition = function () {
    if (this._trackInterval >= 0) {
        clearInterval(this._trackInterval);
        this._trackInterval = -1;
    }
    while (this.$trackElts.length > 0) {
        this.$trackElts.pop().removeEventListener('scroll', this.eventHandler.positionChange);
    }
};


RotatedText.property = {};

RotatedText.property.text = {
    get: function () {
        return this.$contentText.data;
    },
    set: function (value) {
        value = value || '';
        value = value + '';
        this.$contentText.data = value;
    }
};

RotatedText.property.angle = {
    set: function (value) {
        value = value || 0;
        var matched;
        if (typeof value === 'number') {
            this._angle = value;
            this.$content.addStyle('transform', 'rotate(' + value + 'deg)');
        }
        else if (value.match) {
            matched = value.match(/([0-9.+\-e]+)deg/);
            if (matched) {
                value = parseFloat(matched[1]);
                if (isFinite(value)) {
                    this._angle = value;
                    this.$content.addStyle('transform', 'rotate(' + this._angle + 'deg)');
                }
                return;
            }
            matched = value.match(/([0-9.+\-e]+)rad/);
            if (matched) {
                value = parseFloat(matched[1]);
                if (isFinite(value)) {
                    this._angle = value * 180 / Math.PI;
                    this.$content.addStyle('transform', 'rotate(' + this._angle + 'deg)');
                }
            }

        }

    },
    get: function () {
        return this._angle;
    }
};

RotatedText.eventHandler = {};

RotatedText.eventHandler.attached = function () {
    ResizeSystem.add(this);
    this.eventHandler.positionChange();
    this.$content.addStyle('transform-origin',Math.round(0.3 * this.$content.getFontSize())  + 'px 50%');
    this._trackPosition();
};

RotatedText.eventHandler.detached = function () {
    this._cancelTrackPosition();
};

RotatedText.eventHandler.intervalCheck = function () {
    if (!this.isDescendantOf(document.body)) {
        this.eventHandler.detached();
    }
}

RotatedText.eventHandler.positionChange = function () {
    var bound = this.getBoundingClientRect();
    this.$anchor.addStyle({
        top: Math.round(bound.top) + 'px',
        left: Math.round(bound.left) + 'px'
    });
};

ACore.install(RotatedText);

export default RotatedText;


