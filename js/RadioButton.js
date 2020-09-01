import '../css/radiobutton.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function RadioButton() {
    var thisRB = this;
    this.defineEvent('change');
    this.$input = $('input', this).on('change', this.notifyChange.bind(this));
    OOP.drillProperty(this, this.$input, ['value', 'checked']);

}

RadioButton.tag = 'radiobutton';

RadioButton.radioProto = _(
    '<svg class="absol-radio-icon" width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917"' +
    '   xmlns="http://www.w3.org/2000/svg">' +
    '    <g transform="translate(0 -291.71)">' +
    '        <circle class="bound" cx="2.6458" cy="294.35" r="2.4626" style="stroke-opacity:.99497;stroke-width:.26458;" />' +
    '        <circle class="dot" cx="2.6458" cy="294.35"  r= "0.92604" style="fill-rule:evenodd;" />' +
    '    </g>' +
    '</svg>'
)

RadioButton.render = function () {
    return _({
        tag:'label',
        class: 'absol-radio-button',
        child: [
            { tag: 'input', attr: { type: 'radio' } },
            RadioButton.radioProto.cloneNode(true)
        ]
    });
};


RadioButton.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', checked: this.checked, target: this }, this);
};


RadioButton.prototype.getAllFriend = function () {
    return Radio.getAllByName(this.name);
};


RadioButton.attribute = {
    checked: {
        set: function (value) {
            if (value == 'false' || value == null) {
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
            if (value == 'false' || value == null) {
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
    },
    name: {
        set: function (value) {
            this.name = value;
        },
        get: function () {
            return this.name;
        },
        remove: function () {
            this.name = null;
        }
    }
}

RadioButton.property = {
    name: {
        set: function (name) {
            if (name == null) this.$input.removeAttribute('name');
            else
                this.$input.setAttribute('name', name);

        },
        get: function () {
            return this.$input.getAttribute('name');
        }
    },
    disabled: {
        set: function (value) {
            this.$input.disabled = !!value;
            if (value) {
                this.addClass('disabled');
            }
            else {
                this.removeClass('disabled');
            }
        },
        get: function () {
            return this.$input.disabled;
        }
    }
};

RadioButton.getAllByName = function (name) {
    return (document.getElementsByTagName('input') || []).filter(function (elt) {
        return elt.getAttribute('type') == 'radio' && elt.getAttribute('name') == name;
    });
};

RadioButton.getValueByName = function (name) {
    var inputs = RadioButton.getAllByName(name);
    var res = null;
    var input;
    for (var i = 0; i < inputs.length; ++i) {
        input = inputs[i];
        if (input.checked) {
            res = input.value;
        }
    }
    return res;
};



RadioButton.autoReplace = function () {
    console.log(this.tag)
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

RadioButton.initAfterLoad = function (){
    Dom.documentReady.then(function (){
        RadioButton.autoReplace();
    })
};


ACore.install('RadioButton'.toLowerCase(), RadioButton);

export default RadioButton;