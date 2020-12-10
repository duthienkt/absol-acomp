import '../css/toast.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/Element";
import VariantColors from "./VariantColors";
import {buildCss} from "./utils";


var $ = ACore.$;
var _ = ACore._;

buildCss(VariantColors.keys.reduce(function (ac, cr) {
    ac['.as-toast.as-variant-'+cr+' .as-toast-variant-color'] = {
        'background-color': VariantColors.base[cr]
    }
    return ac;
}, {}))


/***
 * @extends {AElement}
 * @constructor
 */
function Toast() {
    this.$closeBtn = $('.as-toast-close-btn', this);
    this.$title = $('.as-toast-title', this);
    this.$timeText = $('.as-toast-time-text', this);
    this.$body = $('.toast-body', this);
    OOP.drillProperty(this, this.$title.firstChild, 'htitle', 'data');
    OOP.drillProperty(this, this.$timeText.firstChild, 'timeText', 'data');
    this._message = null;
    this.$message = null;

    this.htitle = 'Toast.htitle';
    this.timeText = 'Toast.timeText';
    this.message = null;
    this.variant = null;

}

Toast.tag = 'toast';

Toast.render = function () {
    return _({
        class: 'as-toast',
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
            }
        ]
    });
};

Toast.prototype.close = function () {
    this.remove();
    this.emit('close', { target: this, type: 'close' }, this);
};

Toast.property = {};

Toast.property.variant = {
    set: function (value) {
        if (this._variant && this._variant !== value){
            this.removeClass('as-variant-'+ this._variant);
        }
        if (VariantColors.has(value)){
            this._variant = value;
            this.addClass('as-variant-'+ this._variant);
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


ACore.install(Toast);

export default Toast;