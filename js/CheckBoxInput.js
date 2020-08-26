import '../css/checkboxinput.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

//new tech, not working version

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends Element
 * @constructor
 */
function CheckboxInput() {
    this.$input = $('input', this)
        .on('change', this.notifyChange.bind(this));
    this.checked = false;
    this.disabled = false;
    this.on('click', this.eventHandler.click);
    this.onchange = null;
}

CheckboxInput.tag = "CheckboxInput".toLowerCase();

CheckboxInput.render = function (data) {
    return _({
            tag: 'label',
            extendEvent: 'change',
            class: 'as-checkbox-input',
            child: [
                {
                    elt: data && data.$input,
                    tag: 'input',
                    class: 'as-checkbox-input-value',
                    attr: {
                        type: 'checkbox'
                    }
                },
                {
                    tag: 'span',
                    class: ['as-checkbox-input-check-mark', 'mdi', 'mdi-check']
                }
            ]
        }
    )
};

/***
 * as normal, change event will be fired when checkbox change by system
 */
CheckboxInput.prototype.notifyChange = function () {
    var event = { checked: this.checked };
    this.emit('change', event, this);
};

CheckboxInput.prototype._updateCheckedClass = function () {
    if (this.checked) {
        this.addClass('as-checked');
    }
    else {
        this.removeClass('as-checked');
    }
};


CheckboxInput.property = {};

CheckboxInput.property.disabled = {
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
 * @type {CheckboxInput}
 */
CheckboxInput.property.checked = {
    set: function (value) {
        this.$input.checked = !!value;
        this._updateCheckedClass();
    },
    get: function () {
        return this.$input.checked;
    }
}

CheckboxInput.attribute = {
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
 * @type {CheckboxInput}
 */
CheckboxInput.eventHandler = {};

CheckboxInput.eventHandler.click = function () {
    this._updateCheckedClass();
};


ACore.install(CheckboxInput);


CheckboxInput.autoReplace = function () {
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
            props: props
        });
        $(ph).selfReplace(newElt);
    }
};

CheckboxInput.initAfterLoad = function (){
  Dom.documentReady.then(function (){
      CheckboxInput.autoReplace();
  })
};


export default CheckboxInput;