import '../css/radioinput.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

var circleIcon = [
    '<svg class="as-radio-input-circle-icon"width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917" xmlns="http://www.w3.org/2000/svg" >',
    ' <g transform="translate(0 -291.71)">',
    ' <circle class="dot" cx="2.6458" cy="294.35" r="0.92604" style="fill-rule:evenodd;" />',
    ' </g>',
    '</svg>'].join('')

/***
 * @extends Element
 * @constructor
 */
function RadioInput() {
    this.$input = $('input', this);
    this.checked = false;
    this.disabled = false;
    this.on('click', this.eventHandler.click);
    this.onchange = null;
}

RadioInput.tag = "RadioInput".toLowerCase();

RadioInput.render = function () {
    return _({
            tag: 'label',
            // extendEvent: 'change',
            class: 'as-radio-input',
            child: [
                {
                    class: 'as-radio-input-box',
                    child: [
                        {
                            tag: 'input',
                            attr: {
                                type: 'radio'
                            }
                        },
                        circleIcon
                    ]
                }
            ]
        }
    )
};

/***
 * as normal, change event will be fired when radio change by system
 */
RadioInput.prototype.notifyChange = function () {
    var event = {checked: this.checked };
    this.emit('change', event, this);
};

RadioInput.prototype._updateCheckedClass = function () {
    if (this.checked) {
        this.addClass('as-checked');
    }
    else {
        this.removeClass('as-checked');
    }
};


RadioInput.property = {};

RadioInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
        this.$input.disabled = !!value;
    },
    get: function () {
        this.$input.disabled;
    }
};

/***
 *
 * @type {RadioInput}
 */
RadioInput.property.checked = {
    set: function (value) {
        this.$input.checked = !!value;
        this._updateCheckedClass();
    },
    get: function () {
        return this.$input.checked;
    }
}

RadioInput.attribute = {
    checked: {
        set: function (value) {
            if (value === 'false' || value === null) {
                this.checked = false;
            }
            else {
                this.checked = true;
            }
        },
        get: function () {
            return this.checked ? 'true' : 'false'
        },
        remove: function () {
            this.checked = false;
        }
    },
    disabled: {
        set: function (value) {
            if (value === 'false' || value === null) {
                this.disabled = false;
            }
            else {
                this.disabled = true;
            }
        },
        get: function () {
            return this.disabled ? 'true' : 'false'
        },
        remove: function () {
            this.disabled = false;
        }
    }
};

/***
 *
 * @type {RadioInput}
 */
RadioInput.eventHandler = {};

RadioInput.eventHandler.click = function () {
    this._updateCheckedClass();
};


ACore.install(RadioInput);


RadioInput.autoReplace = function () {
    var placeHolders = Array.prototype.slice.call(document.getElementsByTagName(this.tag));
    var ph;
    var attOfPH;
    var attrs;
    var style;
    var classList;
    var attNode;
    var attrName, attrValue;
    var props;
    for (var i = 0; i < placeHolders.length; ++i) {
        ph = placeHolders[i];
        attOfPH = ph.attributes;
        classList = [];
        style = {};
        attrs = {};
        props = {};
        for (var j = 0; j < attOfPH.length; ++j) {
            attNode = attOfPH[j];
            attrName = attNode.nodeName;
            attrValue = attNode.nodeValue;
            if (attrName == 'style') {
                attrValue.trim().split(';').reduce(function (style, prop) {
                    var p = prop.split(':');
                    if (p.length == 2) {
                        style[p[0].trim()] = p[1].trim();
                    }
                    return style;
                }, style);
            }
            else if (attrName == 'class') {
                classList = attrValue.trim().split(/\s+/);
            }
            else if (attrName == 'onchange') {
                props.onchange = new Function('event', 'sender', attrValue);
            }
            else {
                attrs[attrName] = attrValue;
            }
        }
        var newElt = _({
            tag: this.tag,
            attr: attrs,
            class: classList,
            style: style,
            props:props
        });
        $(ph).selfReplace(newElt);
    }

};


export default RadioInput;