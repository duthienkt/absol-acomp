import { _, $ } from '../ACore';
import { revokeResource } from "absol/src/DataStructure/Object";
import Rectangle from "absol/src/Math/Rectangle";
import { isRealNumber } from "absol/src/Converter/DataTypes";
import { drillProperty } from "absol/src/HTML5/OOP";

/**
 * @extends AElement
 * @constructor
 */
function ObsDiv() {
    this.addClass('as-obs-div');
    this.defineEvent(['resize', 'viewchange']);
    this.startObserver();
    this.ruleCtrl = new ODRuleController(this);
    drillProperty(this, this.ruleCtrl, 'respRules', 'data');
    /**
     * @type {Array}
     * @name respRules - Responsive rules to apply on this ObsDiv.
     * @memberOf ObsDiv#
     */

    /**
     * Whether this ObsDiv is reusable. If true, when the ObsDiv is hidden or removed from document, it will keep observing size and visibility changes. Default is false.
     * @type {boolean}
     * @name reusable
     * @memberOf ObsDiv#
     */
}

ObsDiv.tag = 'ObsDiv'.toLowerCase();

ObsDiv.render = function () {
    return _({
        tag: 'div'
    });
};

ObsDiv.prototype.startObserver = function () {
    if (this._resizeObserver || this._intersectionObserver) return;
    // ResizeObserver: emit 'resize' event
    this._resizeObserver = new ResizeObserver(entries => {
        var eventData = new ODResizeEvent(this, entries[0]);
        this.ruleCtrl.apply(eventData.borderRect);
        this.emit('resize', eventData);
    });
    this._resizeObserver.observe(this);

    // IntersectionObserver: emit 'visible'/'hidden' events
    this._intersectionObserver = new IntersectionObserver(entries => {
        var eventData = new ODIntersectionEvent(this, entries[0]);
        this.ruleCtrl.apply(eventData.borderRect);
        this.emit('viewchange', eventData);
        if (eventData.action === 'remove' && !this.reusable) {
            this.stopObserver();
        }
    });
    this._intersectionObserver.observe(this);
};

ObsDiv.prototype.stopObserver = function () {
    if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
    }
    if (this._intersectionObserver) {
        this._intersectionObserver.disconnect();
        this._intersectionObserver = null;
    }
};

ObsDiv.property = {};

ObsDiv.property.reusable = {
    set: function (value) {
        if (value) {
            this.addClass('as-reusable');
        }
        else {
            this.removeClass('as-reusable');
        }
    },
    get: function () {
        return this.hasClass('as-reusable');
    }
}


export default ObsDiv;


/**
 *
 * @param {ObsDiv} elt
 * @param {ResizeObserverEntry} entry
 * @constructor
 */
function ODResizeEvent(elt, entry) {
    this.target = elt;
    this.contentRect = Rectangle.fromClientRect(entry.contentRect);
    var boundRect;
    var adaptKeys = ['x', 'y'];
    this.borderRect = new Rectangle(0, 0, 0, 0);
    if (entry.borderBoxSize.length > 0) {
        this.borderRect.width = entry.borderBoxSize[0].inlineSize;
        this.borderRect.height = entry.borderBoxSize[0].blockSize;
    }
    else {
        adaptKeys.push('width', 'height');
    }

    adaptKeys.forEach(key => {
        Object.defineProperty(this.borderRect, key, {
            get: function () {
                boundRect = boundRect || Rectangle.fromClientRect(elt.getBoundingClientRect());
                return boundRect[key];
            }
        });
    });
}

ODResizeEvent.prototype.type = 'resize';

/**
 *
 * @param {ObsDiv} elt
 * @param {IntersectionObserverEntry} entry
 * @constructor
 */
function ODIntersectionEvent(elt, entry) {
    this.target = elt;
    this.borderRect = Rectangle.fromClientRect(entry.boundingClientRect);
    this.action = entry.isIntersecting ? 'visible' : 'hidden';
    if (!entry.isIntersecting) {
        if (!elt.isDescendantOf(document.body)) {
            this.action = 'remove';
        }
    }
}

ODIntersectionEvent.prototype.type = 'viewchange';


/**
 * Responsive rule for ObsDiv. Defines a class list to apply when the element size matches the given min/max width/height constraints.
 * @constructor
 * @param {Object} opt - Rule options.
 * @param {number} [opt.minWidth] - Minimum width (inclusive) for the rule to match.
 * @param {number} [opt.maxWidth] - Maximum width (inclusive) for the rule to match.
 * @param {number} [opt.minHeight] - Minimum height (inclusive) for the rule to match.
 * @param {number} [opt.maxHeight] - Maximum height (inclusive) for the rule to match.
 * @param {string|string[]} [opt.class] - Class name(s) to apply when the rule matches.
 * @param {string|string[]} [opt.className] - Alternative to `class`, class name(s) to apply when the rule matches.
 */
function ODRule(opt) {
    this.maxWidth = 9e6;
    this.maxHeight = 9e6;
    this.minWidth = -9e6;
    this.minHeight = -9e6;
    this.classList = opt.class || opt.className || [];
    if (typeof this.classList === "string") {
        this.classList = this.classList.split(/\s+/).filter(x => !!x);
    }
    if (isRealNumber(opt.minWidth)) {
        this.minWidth = opt.minWidth;
    }
    if (isRealNumber(opt.maxWidth)) {
        this.maxWidth = opt.maxWidth;
    }
    if (isRealNumber(opt.minHeight)) {
        this.minHeight = opt.minHeight;
    }
    if (isRealNumber(opt.maxHeight)) {
        this.maxHeight = opt.maxHeight;
    }
}


ODRule.prototype.match = function (width, height) {
    if (width < this.minWidth) return false;
    if (width > this.maxWidth) return false;
    if (height < this.minHeight) return false;
    if (height > this.maxHeight) return false;
    return true;
}

/**
 *
 * @param {ObsDiv} elt
 * @constructor
 */
function ODRuleController(elt) {
    this.elt = elt;
    this.rules = [];
    this._data = [];
    this.appliedRules = null;
}


ODRuleController.prototype.apply = function (rect) {
    if (!this.elt.isDescendantOf(document.body)) return;
    var rules = this.rules;
    rect = rect || Rectangle.fromClientRect(this.elt.getBoundingClientRect());
    var width = rect.width;
    var height = rect.height;
    var i, rule;
    for (i = 0; i < rules.length; ++i) {
        rule = rules[i];
        if (rule.match(width, height)) {
            if (rule !== this.appliedRules) {
                if (this.appliedRules) {
                    this.elt.removeClass(this.appliedRules.classList);
                }
                this.elt.addClass(rule.classList);
                this.appliedRules = rule;
            }
            break;
        }
    }
};

Object.defineProperty(ODRuleController.prototype, 'data', {
    set: function (rules) {
        if (!Array.isArray(rules)) rules = [];
        rules = rules.filter(x => !!x);
        this._data = rules;
        this.rules = rules.map(x => new ODRule(x));
        console.log(this.rules)
        this.apply();
    },
    get: function () {
        return this._data;
    }
});