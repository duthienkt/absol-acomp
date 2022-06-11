import ACore from "../ACore";
import EmojiPickerTooltip from "./EmojiPickerTooltip";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function EmojiCounterList() {
    this._counters = [];
    this.counters = [];
}

EmojiCounterList.tag = 'EmojiCounterList'.toLowerCase();

EmojiCounterList.render = function () {
    return _({
        class: 'as-emoji-counter-list'
    });
};

EmojiCounterList.iconOrdering = EmojiPickerTooltip.defaultIcons.reduce(function (ac, cr, idx) {
    ac[cr] = idx + 1;
    return ac;
}, {});

EmojiCounterList.prototype._updateCounters = function () {
    var newCounters = this._counters;
    var newCounterNameArr = Object.keys(newCounters);
    newCounterNameArr.sort(function (a, b) {
        return (EmojiCounterList.iconOrdering[a] || 1000) - (EmojiCounterList.iconOrdering[b] || 1000);
    })

    var counterElements = Array.prototype.filter.call(this.childNodes, function (e) {
        return e.hasClass && e.hasClass('as-emoji-counter');
    });

    var newCounterElements = [];
    var elt, name;
    var oe, on;
    while (counterElements.length > 0 || newCounterNameArr.length > 0) {
        elt = counterElements[0];
        name = newCounterNameArr[0];

        if (elt && name) {
            if (elt.text === name) {
                newCounterElements.push(elt);
                counterElements.shift();
                newCounterNameArr.shift();
            }
            else {
                oe = EmojiCounterList.iconOrdering[elt.text];
                on = EmojiCounterList.iconOrdering[name];
                if (oe < on) {
                    newCounterElements.push(elt);
                    counterElements.shift();
                }
                else {
                    newCounterElements.push(name);
                    newCounterNameArr.shift();
                }
            }
        }
        else if (elt) {
            newCounterElements.push(elt);
            counterElements.shift();
        }
        else {
            newCounterElements.push(name);
            newCounterNameArr.shift();
        }
    }

    var cElt, prevElt;
    while (newCounterElements.length > 0) {
        cElt = newCounterElements.pop();
        if (typeof cElt === "string") {
            cElt = _({
                tag: 'emojicounter',
                props: {
                    text: cElt,
                    users: newCounters[cElt].users || [],
                    count: newCounters[cElt].count
                }
            });
            if (!prevElt) {
                this.addChild(cElt);
            }
            else {
                this.addChildBefore(cElt, prevElt);
            }
            prevElt = cElt;
        }
        else {
            if (newCounters[cElt.text]) {
                cElt.count = newCounters[cElt.text].count;
                cElt.users = newCounters[cElt.text].users || [];
                prevElt = cElt;
            }
            else {
                cElt.remove();
            }
        }

    }

};

EmojiCounterList.property = {};

EmojiCounterList.property.counters = {
    set: function (counters) {
        this._counters = Object.keys(counters || {}).reduce(function (ac, key) {
            var counter = counters[key];
            if (typeof counter === "object") {
                if (counter.count > 0 && EmojiPickerTooltip.emojiDict[key]) {
                    ac[key] = counter;
                }
            }
            return ac;
        }, {})
        this._updateCounters();
    },
    get: function () {
        return this._counters;
    }
}

ACore.install(EmojiCounterList);

export default EmojiCounterList;