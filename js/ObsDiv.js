import { _, $ } from '../ACore';
import { revokeResource } from "absol/src/DataStructure/Object";
import Rectangle from "absol/src/Math/Rectangle";
import { isRealNumber } from "absol/src/Converter/DataTypes";
import { drillProperty } from "absol/src/HTML5/OOP";
import BoundingObserver from "absol/src/HTML5/BoundingObserver";


/**
 * @extends AElement
 * @constructor
 */
function ObsDiv() {
    this.addClass('as-obs-div');
    this.defineEvent(['resize', 'viewchange']);
    this.obs = new BoundingObserver(this, {autoStart: true});
    this.ruleCtrl = new ODRuleController(this);
    this.obs.on('viewchange', event =>{
        this.ruleCtrl.apply(event.borderRect);
        this.emit('viewchange', event);
    });
    this.obs.on('bound', event=>{
        this.ruleCtrl.apply(event.borderRect);
        this.emit('resize', event);
    });
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


ObsDiv.property = {};

ObsDiv.property.reusable = {
    set: function (value) {
        this.obs.reusable = !!value;
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