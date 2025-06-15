import ACore, { _ } from "../ACore";
import Color from "absol/src/Color/Color";
import '../css/linearcolorbar.css';

/**
 * @extends AElement
 * @constructor
 */
function StackedHorizontalBar() {
    this.$rects = [];
    /**
     * @name colors
     * @type {Color[]|string[]}
     * @memberOf StackedHorizontalBar#
     */
}

StackedHorizontalBar.tag = 'stackedhorizontalbar';

StackedHorizontalBar.render = function () {
    return _({
        class: 'as-stacked-horizontal-bar',
    });
};


StackedHorizontalBar.prototype.updateColor = function () {
    var colors = this.colors || [];
    this.$rects.forEach((rect, i, arr) => {
        var color = colors[i] || `hsl(${i * 360 / arr.length}deg, 100%, 75%)`;
        var borderColor;
        color = Color.parse(color + '');
        var hsla;
        hsla = color.toHSLA();
        hsla[2] -= 0.2;
        hsla[1] -= 0.2;
        if (hsla[1] < 0) hsla[1] = 0;
        if (hsla[2] < 0) hsla[2] = 0;
        borderColor = Color.fromHSL(hsla[0], hsla[1], hsla[2]);
        rect.addStyle({
            border: '1px solid ' + borderColor.toString('hex6'),
            backgroundColor: color.toString('hsla'),
            color: color.getContrastYIQ()
        });
    });
};

StackedHorizontalBar.property = {};


StackedHorizontalBar.property.values = {
    set: function (values) {
        this._values = values || [];
        this.clearChild();
        this.$rects = this._values.map((value, i) => {
            return _({
                class: 'as-stacked-horizontal-bar-rect',
                attr: { title: value + '' },
                style: {
                    '--value': value + ''
                },
                child: {
                    text: value + ''
                }
            });
        });
        this.updateColor();
        this.addChild(this.$rects);
    }
};


StackedHorizontalBar.property.colors = {
    set: function (values) {
        this._colors = values || [];
        this.updateColor();
    },
    get: function () {
        return this._colors || [];
    }
};

StackedHorizontalBar.property.pxPerUnit = {
    set: function (value) {
        this._pxPerUnit = value || 1;
        this.addStyle('--px-per-unit', value + 'px');
    },
    get: function () {
        return this._pxPerUnit || 1;
    }
};

ACore.install(StackedHorizontalBar);
export default StackedHorizontalBar;