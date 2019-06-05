import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;


function CheckBox() {

    var svgIcon = function (pos) {
        return _([
            '<svg class="absol-checkbox-icon absol-checkbox-icon-' + pos + '" width="18mm" height="18mm" version="1.1" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" >',
            ' <g transform="translate(0 -279)">',
            '  <path class="bound" d="m3 279.69h12c1.3434 0.0111 2.3298 1.5259 2.3131 2.4775v11.836c0.05005 0.89373-1.1834 2.2964-2.3131 2.3131h-12c-0.82692 0.0166-2.3131-1.1834-2.3131-2.3131v-12.237c0.0022374-1.171 0.3775-2.0759 2.3131-2.0759z" style="stroke-linejoin:round;"/>',
            '  <path class="tick" d="m3.1656 288.66c-0.10159 0.0612-0.11743 0.12506-0.12993 0.18899l3.7473 4.3467c0.066638 0.0459 0.11813 0.0263 0.16832 1e-3 0 0 1.7699-4.2166 4.7251-7.4568 1.4783-1.6208 3.2406-3.3659 3.2406-3.3659 0.0054-0.14125-0.10946-0.15807-0.1754-0.22551 0 0-2.5832 1.6364-4.7524 3.8336-1.8697 1.8939-3.6666 4.4016-3.6666 4.4016z"/>',
            ' </g>',
            '</svg>'].join(''));
    }

    var res = _({
        class: ['absol-checkbox'],
        child: [
            '<input type="checkbox" />',
            svgIcon('left'),
            '<label style="display:none"></label>',
            svgIcon('right')
        ]
    });
    res.defineEvent('change');
    res.$input = $('input', res);
    res.$label = $('label', res);

    res.on('click', function (event) {
        event.preventDefault();
        if (!this.disabled) {
            res.checked = !res.checked;
            res.emit('change', event, res);
        }

    });
    return res;
};

//v, labelText, checked

CheckBox.attribute = {
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
    }
};

CheckBox.property = {
    checked: {
        set: function (value) {
            this.$input.checked = !!value;
            if (this.checked) {
                this.addClass('checked');
            }
            else {
                this.removeClass('checked');
            }
        },
        get: function () {
            return this.$input.checked;
        }
    },

    text: {
        set: function (value) {
            value = (value || '').trim();
            this.$label.innerHTML = value;
            if (value.length == 0) this.$label.addStyle('display', 'none');
            else this.$label.removeStyle('display');
        },
        get: function () {
            return this.$label.innerHTML;
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

Acore.creator.checkbox = CheckBox;
export default CheckBox;