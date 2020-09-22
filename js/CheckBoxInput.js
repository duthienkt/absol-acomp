import '../css/checkboxinput.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";


var _ = ACore._;
var $ = ACore.$;

var tickIcon = _(['<svg class="as-checkbox-input-check-icon" width="18px" height="18px" version="1.1" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" >',
        ' <g transform="translate(0 -279)">',
        '  <path class="bound" d="m3 279.69h12c1.3434 0.0111 2.3298 1.5259 2.3131 2.4775v11.836c0.05005 0.89373-1.1834 2.2964-2.3131 2.3131h-12c-0.82692 0.0166-2.3131-1.1834-2.3131-2.3131v-12.237c0.0022374-1.171 0.3775-2.0759 2.3131-2.0759z" style="stroke-linejoin:round; stroke-width: 1"/>',
        '  <path class="tick" d="m3.1656 288.66c-0.10159 0.0612-0.11743 0.12506-0.12993 0.18899l3.7473 4.3467c0.066638 0.0459 0.11813 0.0263 0.16832 1e-3 0 0 1.7699-4.2166 4.7251-7.4568 1.4783-1.6208 3.2406-3.3659 3.2406-3.3659 0.0054-0.14125-0.10946-0.15807-0.1754-0.22551 0 0-2.5832 1.6364-4.7524 3.8336-1.8697 1.8939-3.6666 4.4016-3.6666 4.4016z"/>',
        ' </g>',
        '</svg>'
    ].join('')
);


/***
 * @extends AElement
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
                tickIcon.cloneNode(true)
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

CheckboxInput.initAfterLoad = function () {
    Dom.documentReady.then(function () {
        CheckboxInput.autoReplace();
    })
};


export default CheckboxInput;