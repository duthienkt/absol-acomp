import ACore, { _, $ } from "../ACore";
import { compareDate } from "absol/src/Time/datetime";
import QuickMenu from "./QuickMenu";
import { drillProperty } from "absol/src/HTML5/OOP";

/**
 * @extends {AElement}
 * @constructor
 */
function DateNLevelInput() {
    this.$level = $('.as-date-n-level-input-select-level', this);
    /**
     *
     * @type {DateInput}
     */
    this.$date = $('dateinput', this);
    this.ctrl = new DateNLevelInputCtrl(this);
    this._allowLevels = this.defaultAllowLevels.slice();
    drillProperty(this, this.$date, 'min');
    drillProperty(this, this.$date, 'max');
    /**
     * @name level
     * @type {"date"| "week" | "month" | "quarter" | "year"}
     * @memberOf DateNLevelInput#
     * */

    /**
     * @name allowLevels
     * @type {Array<"date"| "week" | "month" | "quarter" | "year">}
     * @memberOf DateNLevelInput#
     * */

    /**
     * @name value
     * @type {Date}
     * @memberOf DateNLevelInput#
     * */

    /**
     * @readonly
     * @name format
     * @type {string}
     * @memberOf DateNLevelInput#
     * */
}


DateNLevelInput.tag = 'DateNLevelInput'.toLowerCase();

DateNLevelInput.prototype.leve2format = {
    date: 'dd/MM/yyyy',
    week: 'Tuần ww, yyyy',
    month: 'MM/yyyy',
    quarter: 'Quý QQ, yyyy',
    year: 'yyyy'
};

DateNLevelInput.prototype.leve2Name = {
    date: 'Ngày',
    week: 'Tuần',
    month: 'Tháng',
    quarter: 'Quý',
    year: 'Năm'
}

DateNLevelInput.prototype.defaultAllowLevels = ['date', 'month', 'year'];

DateNLevelInput.render = function () {
    return _({
        class: 'as-date-n-level-input',
        extendEvent: ['change'],
        child: [
            {
                tag: 'dateinput',
                props: {
                    format: 'dd/MM/yyyy'
                }
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-date-n-level-input-select-level'],
                child: 'span.mdi.mdi-cog'
            }
        ]
    });
};


DateNLevelInput.property = {};

DateNLevelInput.property.allowLevels = {
    set: function (value) {
        if (typeof value === "string") {
            value = value.split(/\s*,\s*/);
        }
        if (!(value instanceof Array)) {
            value = this.defaultAllowLevels.slice();
        }
        value = value.filter(x => !!this.leve2format[x]);
        if (!value || value.length === 0) value = this.defaultAllowLevels.slice();
        var prevLevel = this.level;
        this._allowLevels = value;
        var newLevel = this.level;
        if (prevLevel !== newLevel) {
            this.level = newLevel;//update
        }

    },
    get: function () {
        return this._allowLevels.slice();
    }
};

DateNLevelInput.property.level = {
    set: function (value) {
        if (!this.leve2format[value]) value = 'date';
        this.attr('data-level', value);
        this.$date.format = this.leve2format[value];
        this.ctrl.prevVal = this.$date.value;
        this.ctrl.level = value;
    },
    get: function () {
        var level = this.ctrl.level;
        if (this._allowLevels.indexOf(level) < 0) level = this._allowLevels[0];
        return level;
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


DateNLevelInput.property.readOnly = {
    set: function (value) {
        this.$date.readOnly = value;
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.$date.readOnly;
    }
};


DateNLevelInput.property.disabled = {
    set: function (value) {
        this.$date.disabled = value;
        this.$level.disabled = value;
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.$date.disabled;
    }
};

function DateNLevelInputCtrl(elt) {
    this.elt = elt;
    this.prevVal = this.elt.value;
    this.elt.$date.on('change', this.ev_dateChange.bind(this));
    this.level = 'date';
    QuickMenu.toggleWhenClick(this.elt.$level, {
        getMenuProps: () => {
            var props = {};
            props.items = this.elt._allowLevels.map(name => {
                return {
                    text: `${this.elt.leve2Name[name]} (${this.elt.leve2format[name]})`,
                    level: name,
                    icon: name === this.level ? 'span.mdi.mdi-check' : null
                }
            });
            return props;
        },
        onSelect: item => {
            if (this.level !== item.level) {
                this.level = item.level;
                this.ev_levelChange();
            }
        }
    })
}

DateNLevelInputCtrl.prototype.ev_dateChange = function (event) {
    this.notifyCanBeChanged();
};


DateNLevelInputCtrl.prototype.ev_levelChange = function (event) {
    var value = this.level;
    this.elt.attr('data-level', value);
    this.elt.$date.format = this.elt.leve2format[value];
    this.elt.$date.value = null;
    this.notifyCanBeChanged();
};


DateNLevelInputCtrl.prototype.notifyCanBeChanged = function (force) {
    var value = this.elt.$date.value;
    if (force || !value !== !this.prevVal || (value && compareDate(value, this.prevVal) !== 0)) {
        this.elt.emit('change', Object.assign({}, {
            value: value,
            prevValue: this.prevVal,
            target: this.elt
        }), this.elt);
        this.prevVal = value;
    }
};
export default DateNLevelInput;

ACore.install(DateNLevelInput);