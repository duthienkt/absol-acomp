import ACore, { _, $ } from "../ACore";
import { compareDate } from "absol/src/Time/datetime";

/**
 * @extends {AElement}
 * @constructor
 */
function DateNLevelInput() {
    this.$level = $('selectmenu', this);
    this.$date = $('dateinput', this);
    this.ctrl = new DateNLevelInputCtrl(this);
}


DateNLevelInput.tag = 'DateNLevelInput'.toLowerCase();

DateNLevelInput.prototype.leve2format = {
    date: 'dd/MM/yyyy',
    week: 'Tuần ww, yyyy',
    month: 'MM/yyyy',
    quarter: 'Quý QQ, yyyy',
    year: 'yyyy'

}

DateNLevelInput.render = function () {
    return _({
        class: 'as-date-n-level-input',
        extendEvent: ['change'],
        child: [
            {
                tag: 'selectmenu',
                props: {
                    items: ['date', 'week', 'month', 'quarter', 'year'].map(it => ({
                        text: DateNLevelInput.prototype.leve2format[it],
                        value: it
                    }))
                }
            },
            {
                tag: 'dateinput',
                props: {
                    format: 'dd/MM/yyyy'
                }
            }
        ]
    });
};


DateNLevelInput.property = {};

DateNLevelInput.property.level = {
    set: function (value) {
        if (!this.leve2format[value]) value = 'date';
        this.attr('data-level', value);
        this.$date.format = this.leve2format[value];
        this.ctrl.prevVal = this.$date.value;
    },
    get: function () {
        return this.attr('data-level');
    }
};

DateNLevelInput.property.format = {
    get: function () {
        return this.$date.format;
    }
};

DateNLevelInput.property.value = {
    set: function (value) {
        this.$date.value = value;
        this.ctrl.prevVal = this.$date.value;
    },
    get: function () {
        return this.$date.value;
    }
};

function DateNLevelInputCtrl(elt) {
    this.elt = elt;
    this.prevVal = this.elt.value;
    this.elt.$date.on('change', this.ev_dateChange.bind(this));
    this.elt.$level.on('change', this.ev_levelChange.bind(this));
}

DateNLevelInputCtrl.prototype.ev_dateChange = function (event) {
    this.notifyCanBeChanged();
};


DateNLevelInputCtrl.prototype.ev_levelChange = function (event) {
    var value = this.elt.$level.value;
    this.elt.attr('data-level', value);
    this.elt.$date.format = this.elt.leve2format[value];
    this.elt.$date.value = null;
};


DateNLevelInputCtrl.prototype.notifyCanBeChanged = function (force) {
    var value = this.elt.$date.value;
    if (force || !value !== !this.prevVal || (value && compareDate(value, this.prevVal) !== 0)) {
        this.elt.emit('change', Object.assign({}, event, {
            value: value,
            prevValue: this.prevVal,
            target: this.elt
        }), this.elt);
        this.prevVal = value;
    }
};
export default DateNLevelInput;

ACore.install(DateNLevelInput);