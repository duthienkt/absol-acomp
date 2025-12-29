import { AbstractInput } from "./Abstraction";
import { drillProperty, mixClass } from "absol/src/HTML5/OOP";
import { _, $ } from '../ACore';
import { beginOfDay, compareDate, formatDateTime, implicitDate } from "absol/src/Time/datetime";
import SelectBoxItem from "./SelectBoxItem";
import MultiCheckTreeMenu from "./MultiCheckTreeMenu";
import Follower from "./Follower";
import ChromeCalendar from "./ChromeCalendar";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import Rectangle from "absol/src/Math/Rectangle";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { parseMeasureValue } from "absol/src/JSX/attribute";

/**
 * @augments {AElement}
 * @augments {AbstractInput}
 * @constructor
 */
function MultiDateInput() {
    /**
     *
     * @type {Date[]}
     */
    this.rawValue = [];
    this.$body = $('.as-multi-date-input-body', this);
    this.$itemCtn = this.$body;//adapt style
    this.$icon = $('.as-date-input-icon-ctn span', this);

    this.listCtrl = new MDIItemList(this);
    this.dropdownCtrl = new MDIDropdownController(this);
    drillProperty(this, this, 'values', 'value');
    AbstractInput.call(this);

    this.observer = new IntersectionObserver((entries, observer) => {
        if (this.isDescendantOf(document.body)) {
            ResizeSystem.add(this.$icon);
            if (entries.length > 0) {
                this.listCtrl.viewChange();
            }
        }
    }, { root: document.body });

    this.observer.observe(this.$itemCtn);
    this.$icon.requestUpdateSize = this.listCtrl.viewChange.bind(this.listCtrl);

    /**
     * @name value
     * @type {Date[]}
     * @memberOf MultiDateInput#
     *
     */
    /**
     * @name min
     * @type {Date[]}
     * @memberOf MultiDateInput#
     *
     */
    /**
     * @name max
     * @type {Date[]}
     * @memberOf MultiDateInput#
     *
     */
}

mixClass(MultiDateInput, AbstractInput);

MultiDateInput.tag = 'MultiDateInput'.toLowerCase();

['maxWidth', 'width', 'flexGrow', 'overflow'].forEach(key => {
    MultiDateInput.prototype.styleHandlers[key] = MultiCheckTreeMenu.prototype.styleHandlers[key];
});

MultiDateInput.render = function () {
    return _({
        class: 'as-multi-date-input',
        extendEvent: ['change'],
        child: [
            {
                tag: 'button',
                class: 'as-date-input-icon-ctn',
                child: 'span.mdi.mdi-calendar-multiselect-outline'
            },
            {
                attr: {
                    'data-ml-key': 'txt_select_value'
                },
                class: 'as-multi-date-input-body'
            }
        ]
    });
};

MultiDateInput.property.value = {
    set: function (value) {
        value = value || [];
        value = value.map(it => implicitDate(it)).filter(it => !!value).map(x => beginOfDay(x));
        value.sort((a, b) => {
            return compareDate(a, b);
        });
        var t = -1;
        var value2 = [];
        var d;
        for (var i = 0; i < value.length; i++) {
            d = value[i];
            if (d.getTime() !== t) {
                value2.push(d);
                t = d.getTime();
            }
        }

        this.rawValue = value2;

        var computedValue = this.value;//apply minmax
        this.listCtrl.viewItems(computedValue);
        this.emittedValue = computedValue;
    },
    get: function () {
        var value = (this.rawValue || []).slice();
        var minD = this.min;
        var maxD = this.max;
        return value.filter(it => {
            if (minD && compareDate(it, minD) < 0) return false;
            if (maxD && compareDate(it, maxD) > 0) return false;
            return true;
        });
    }
};

MultiDateInput.property.min = {
    set: function (value) {
        this.rawMin = implicitDate(value);
        if (this.rawMin) {
            this.rawMin = beginOfDay(this.rawMin);
        }
        var computedValue = this.value;//apply minmax
        this.listCtrl.viewItems(computedValue);
        this.emittedValue = computedValue;
    },
    get: function () {
        return this.rawMin || null;
    }
};
MultiDateInput.property.max = {
    set: function (value) {
        this.rawMax = implicitDate(value);
        if (this.rawMax) {
            this.rawMax = beginOfDay(this.rawMax);
        }

        var computedValue = this.value;//apply minmax
        this.listCtrl.viewItems(computedValue);
        this.emittedValue = computedValue;
    },
    get: function () {
        var rawMin = this.rawMin;
        var rawMax = this.rawMax;
        if (rawMin && rawMax) {
            if (compareDate(rawMin, rawMax) > 0) {
                rawMax = rawMin;
            }
        }
        return rawMax || null;
    }
};

MultiDateInput.prototype.revokeResource = function () {
    if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
    }
};

MultiDateInput.prototype.notifyIfChange = function () {
    var emittedValue = this.emittedValue || [];
    var value = this.value;
    var changed = false;
    if (value.length !== emittedValue.length) {
        changed = true;
    }
    if (!changed) {
        return value.some((x, i) => compareDate(x, emittedValue[i]) !== 0);
    }
    if (changed) {
        this.emit('change', { type: 'change', value: value });
        this.emittedValue = value;
    }

};

export default MultiDateInput;


/**
 *
 * @param {MultiDateInput} elt
 * @constructor
 */
function MDIItemList(elt) {
    this.elt = elt;
    this.$items = [];
}

MDIItemList.prototype.isFixedHeight = function () {
    if (this.elt.hasClass('as-height-auto')) return false;
    var height = this.elt.style.height;
    var parsed = parseMeasureValue(height);
    if (parsed && (parsed.unit === 'px' || parsed.unit === '%')) return true;
    if (height && height !== 'auto') return true;
    height = parseMeasureValue(this.elt.style.getPropertyValue('--as-height'));
    parsed = parseMeasureValue(height);
    if (parsed && (parsed.unit === 'px' || parsed.unit === '%')) return true;
    return false;

};


MDIItemList.prototype.viewChange = function () {
    var t, d;
    var isFixedHeight = this.isFixedHeight();
    var bound = Rectangle.fromClientRect(this.elt.getBoundingClientRect());
    var prevHeightStyle = this.elt.style.height;//
    var prevWidthStyle = this.elt.style.width;//
    this.elt.style.height = bound.height + 'px';
    this.elt.style.width = bound.width + 'px';
    //prevent flick size

    Array.prototype.map.call(this.elt.$body.childNodes, e => {
        e.removeStyle('display');
    });
    /**
     *
     * @type {Rectangle[]}
     */
    var rects = Array.prototype.map.call(this.elt.$body.childNodes, e => {
        var rect = Rectangle.fromClientRect(e.getBoundingClientRect());
        if (!t) {
            t = t || e.getComputedStyleValue('margin-top') || '4px';
            d = parseFloat(t.replace('px', ''))
        }

        rect.y -= d;
        rect.height += d * 2;
        return rect;
    });
    var height;
    if (rects.length === 0) height = 27;
    else height = rects.reduce((ac, cr) => {
        return ac.merge(cr);
    }, rects[0]).height;

    if (!height) return;
    this.elt.addStyle('--content-height', Math.min(height, 90) + 'px');
    var k = 0;
    var i;
    if (isFixedHeight) {
        rects.forEach(rect => {//origin bound
            rect.y += d;
            rect.height -= d * 2;
        });
        for (k = 0; k < rects.length; k++) {
            if (!bound.contains(rects[k])) {
                break;
            }
        }
        if (k > 1 && k < rects.length) {
            k--;
            if (rects[k].B().x + 24 + 38 > bound.B().x) {
                k--;
            }
            this.elt.$body.addClass('as-has-more');
            for (i = k+1; i < this.elt.$body.childNodes.length; i++) {
                this.elt.$body.childNodes[i].addStyle('display', 'none');
            }
        }
        else {
            this.elt.$body.removeClass('as-has-more')
        }

    }
    else {
        this.elt.$body.removeClass('as-has-more');
    }


    this.elt.style.height = prevHeightStyle;
    this.elt.style.width = prevWidthStyle;

};

/**
 *
 * @param {Date[]} items
 */
MDIItemList.prototype.viewItems = function (items) {
    this.$items.forEach(it => {
        it.remove();
    })
    this.$items = items.map(item => {
        var itemElt = _({
            tag: SelectBoxItem,
            props: {
                data: {
                    text: formatDateTime(item, 'dd/MM/yyyy'),
                    value: item.getTime()
                }
            },
            on: {
                close: () => {
                    var value = this.elt.rawValue.filter(it => compareDate(it, item));
                    itemElt.remove();
                    this.elt.rawValue = value;
                    this.elt.dropdownCtrl.viewItems(value);
                    this.viewChange();
                    this.elt.notifyIfChange();
                },
                press: () => {

                }
            }
        });
        return itemElt;
    });
    this.elt.$body.addChild(this.$items);
    this.viewChange();
};


/**
 *
 * @param {MultiDateInput} elt
 * @constructor
 */
function MDIDropdownController(elt) {
    this.elt = elt;
    this.$btn = $('.as-date-input-icon-ctn', elt);
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this [key] = this[key].bind(this);
        }
    }
    this.elt.on('click', this.ev_click);
}

MDIDropdownController.prototype.prepare = function () {
    //only create a modal for the first time
    if (this.$follower) return;
    this.$calendar = _({
        tag: ChromeCalendar,
        class: ['as-dropdown-box-common-style'],
        props: {
            multiSelect: true
        },
        on: {
            pick: this.ev_pick
        }
    });
    this.$follower = _({
        tag: Follower,
        style: {
            backgroundColor: 'red'
        },
        props: {
            followTarget: this.$btn,
            anchor: [2, 5, 9, 11]
        },
        child: [
            this.$calendar
        ]
    });
    this.$follower.cancelWaiting();

};

MDIDropdownController.prototype.destroy = function () {
    if (this.$follower) {
        this.$follower.remove();
        this.$follower = null;
        this.$calendar.off('pick', this.ev_pick);
    }
};

MDIDropdownController.prototype.open = function () {
    this.prepare();
    this.elt.off('click', this.ev_click);
    this.$calendar.min = this.elt.min;
    this.$calendar.max = this.elt.max;
    this.$calendar.selectedDates = this.elt.value;
    this.$follower.followTarget = this.$btn;
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
    }, 5);
    this.$follower.addTo(document.body);
};


MDIDropdownController.prototype.close = function () {
    document.removeEventListener('click', this.ev_clickOut);
    setTimeout(() => {
        this.elt.on('click', this.ev_click);
    }, 50);
    this.$follower.followTarget = null;
    this.$follower.selfRemove();
};

MDIDropdownController.prototype.viewItems = function (items) {
    if (this.$follower && this.$follower.parentElement) {
        this.$calendar.selectedDates = items.slice();
    }
}

MDIDropdownController.prototype.ev_click = function (event) {
    if (hitElement(this.$btn, event) || event.target === this.elt.$body || event.target === this.elt
        || event.target === this.elt) {
        this.open();
    }
};

MDIDropdownController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.$follower, event)) return;
    this.close();
    this.elt.notifyIfChange();
};


MDIDropdownController.prototype.ev_pick = function () {
    var selectedDates = this.$calendar.selectedDates;
    selectedDates.sort((a, b) => compareDate(a, b));
    this.elt.rawValue = selectedDates.slice();
    this.elt.listCtrl.viewItems(selectedDates);
};
