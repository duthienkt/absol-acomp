import '../css/toast.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/Element";
import VariantColors from "./VariantColors";
import {buildCss} from "./utils";
import Dom, {isDomNode} from "absol/src/HTML5/Dom";
import Color from "absol/src/Color/Color";


var $ = ACore.$;
var _ = ACore._;

var toastBg = {
    success: "#a4f3b6",
    info: "#67d5e7"
}

var toastTextColor = {
    success: '#454040',
    info: '#48433b'
}

buildCss(VariantColors.keys.reduce(function (ac, cr) {
    var color = Color.parse(toastBg[cr] || VariantColors.base[cr]);
    var textColor = color.getContrastYIQ();
    var headerColor = toastTextColor[cr] || VariantColors.mediumContract[cr] || color.getHightContrastColor();
    ac['.as-toast.as-variant-' + cr + ' .as-toast-variant-color'] = {
        'background-color': color.toString('hex6')
    }
    ac['.as-toast.as-variant-background.as-variant-' + cr] = {
        'background-color': color.toString('hex6'),
        color: textColor.toString('hex6')
    }

    ac['.as-toast.as-variant-background.as-variant-' + cr + ' .as-toast-header'] = {
        color: headerColor.toString('hex6')
    }

    return ac;
}, {}));


/***
 * @extends {AElement}
 * @constructor
 */
function Toast() {
    this._state = 0;
    this.$closeBtn = $('.as-toast-close-btn', this)
        .on('click', this.disappear.bind(this));
    this.$title = $('.as-toast-title', this);
    this.$timeText = $('.as-toast-time-text', this);
    this.$body = $('.toast-body', this);
    this.$attachhook = $('attachhook', this)
        .on('attached', this.appear.bind(this));
    OOP.drillProperty(this, this.$title.firstChild, 'htitle', 'data');
    this._message = null;
    this.$message = null;
    this.disappearTimeout = 0;
    this.htitle = 'Toast.htitle';
    this.timeText = new Date();
    this.message = null;
    this.variant = null;
}

Toast.tag = 'toast';

['addChild', 'removeChild', 'clearChild', 'addChildBefore', 'addChildAfter'].forEach(function (key) {
    Toast.prototype[key] = function () {
        this.$body[key].apply(this.$body, arguments);
    };
});

Toast.render = function () {
    return _({
        extendEvent: ['appeared', 'disappeared'],
        class: ['as-toast', 'as-not-appeared'],
        child: [
            {
                class: 'as-toast-header',
                child: [
                    '.as-toast-variant-color',
                    {
                        tag: 'strong',
                        class: 'as-toast-title',
                        child: { text: "Absol Js" }
                    },
                    {
                        tag: 'smal',
                        class: 'as-toast-time-text',
                        child: { text: '20 mis ago' }
                    },
                    {
                        tag: 'button',
                        class: 'as-toast-close-btn',
                        child: { tag: 'span', child: { text: '×' } }
                    }
                ]
            },
            {
                class: 'toast-body'
            },
            'attachhook'
        ]
    });
};

Toast.prototype.disappear = function () {
    if (this._state !== 2) return;
    this._state = 3;
    this.addClass('as-disappearing');
    setTimeout(function () {
        this.removeClass('as-disappeared')
            .removeClass('as-disappearing')
            .addClass('as-not-appeared');
        this.remove();
        this.emit('disappeared', { target: this, type: 'disappeared' }, this);
    }.bind(this), 500);
};

Toast.prototype.appear = function () {
    if (this._state !== 0) return;
    this._state = 1;
    this.addClass('as-appearing');
    setTimeout(function () {
        this.removeClass('as-not-appeared')
            .addClass('as-appeared')
            .removeClass('as-appearing');
        this._state = 2;
        this.emit('appeared', { target: this, type: 'appeared' }, this);
        if (this.disappearTimeout > 0 && this.disappearTimeout < Infinity) {
            setTimeout(this.disappear.bind(this), this.disappearTimeout);
        }
    }.bind(this), 100);
};


Toast.property = {};

Toast.property.variant = {
    set: function (value) {
        if (this._variant && this._variant !== value) {
            this.removeClass('as-variant-' + this._variant);
        }
        if (VariantColors.has(value) || (['sticky-note'].indexOf(value) >= 0)) {
            this._variant = value;
            this.addClass('as-variant-' + this._variant);
        }
    },
    get: function () {
        return this._variant;
    }
};

Toast.property.message = {
    set: function (value) {
        if (typeof value !== "string" || value.length === 0) {
            value = null;
        }
        if (value) {
            if (!this.$message) {
                this.$message = _({
                    class: 'as-toast-message',
                    child: { text: '' }
                });
            }
            if (!this.$message.parentElement)
                this.$body.addChild(this.$message);
            this.$message.firstChild.data = value;
        }
        else {
            if (this.$message && this.$message.parentElement) {
                this.$message.remove();
            }
        }
        this._message = value;
    },
    get: function () {
        return this._message;
    }
};


Toast.property.timeText = {
    set: function (value) {
        if (value instanceof Date) {
            value = value.toLocaleTimeString();

        }
        else {
            value = value + '';
        }
        this.$timeText.firstChild.data = value;

    },
    get: function () {
        return this.$timeText.firstChild.data;
    }
};

Toast.$toastList = _('.as-toast-list.as-se.as-bscroller');
Toast.$toastList4Pos = {
    se: Toast.$toastList,
    sw: _('.as-toast-list.as-sw.as-bscroller'),
    nw: _('.as-toast-list.as-nw.as-bscroller'),
    ne: _('.as-toast-list.as-ne.as-bscroller'),
};

Dom.documentReady.then(function () {
    Toast.$toastList.addTo(document.body);
    Toast.$toastList4Pos.sw.addTo(document.body);
    Toast.$toastList4Pos.nw.addTo(document.body);
    Toast.$toastList4Pos.ne.addTo(document.body);
});

/***
 *
 * @param {AbsolConstructDescriptor|{}} aObject,
 * @param {"se"|"sw"|"ne"|"nw" } [pos="se"]
 * @return {AElementNS|AElement|Text}
 */
Toast.make = function (aObject, pos) {
    pos = pos || 'se';
    aObject = aObject || {};
    if (typeof aObject !== "object") throw  new Error("param must be AbsolConstructDescriptor object!");

    if (isDomNode(aObject)) {

    }
    else {
        aObject.tag = aObject.tag || 'toast';

    }
    var toastElt = _(aObject);
    var toastListElt = Toast.$toastList4Pos[pos] || Toast.$toastList4Pos;
    toastListElt.addChild(toastElt);
    return toastElt;
};


ACore.install(Toast);

export default Toast;

