import '../css/treechart.css';
import ACore, { _, $ } from "../ACore";
import { copyJSVariable } from "absol/src/JSMaker/generator";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { isNaturalNumber } from "./utils";
import Color from "absol/src/Color/Color";
import DomSignal from "absol/src/HTML5/DomSignal";


function autoThemeVariable(viewElt) {
    var cp = getComputedStyle(document.body);
    var color = cp.getPropertyValue('--menu-background-color') || cp.getPropertyValue('--variant-color-primary') || 'blue';
    color = Color.parse(color.trim());
    var hsla = color.toHSLA();
    hsla[2] = (hsla[2] + 1) / 2;
    hsla[1] = (hsla[1] + 0.2) / 2;
    var nColor = Color.fromHSLA(hsla[0], hsla[1], hsla[2], hsla[3]);
    viewElt.addStyle('--node-background-color', nColor.toString('rgba'));
    nColor = nColor.getContrastYIQ();
    viewElt.addStyle('--node-text-color', nColor.toString('rgba'));
}

/***
 * @extends AElement
 * @constructor
 */
function TreeChart() {
    autoThemeVariable(this);
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('formatSize', this._formatSize.bind(this));
    this.$root = null;
    this._maxHorizonLevel = 2;
    /***
     * @name data
     * @type {any}
     * @memberOf TreeChart#
     */
    /***
     * @name maxHorizonLevel
     * @type {number}
     * @memberOf TreeChart#
     */
}


TreeChart.tag = 'TreeChart';


TreeChart.render = function () {
    return _({
        class: 'as-tree-chart'
    });
};

TreeChart.prototype._updateContent = function () {
    if (this.$root) {
        this.$root.remove();
        this.$root = null;
    }
    var data = this.data;
    if (!data) return;
    var makeTree = (nodeData, level) => {
        var textChildren = [];
        if (nodeData.icon) {
            textChildren.push(_(nodeData.icon).addClass('as-as-tree-chart-icon'));
        }
        textChildren.push({
            tag: 'span',
            class: 'as-tree-chart-text',
            child: { text: nodeData.text || nodeData.name }
        });
        var elt = _({
            class: 'as-tree-chart-node',
            attr: { "data-level": level + '' },
            child: [
                {
                    class: 'as-tree-chart-content-ctn',
                    child: {
                        class: 'as-tree-chart-content',
                        child: textChildren
                    }
                },
                {
                    class: 'as-tree-chart-child-ctn'
                }
            ]
        });
        elt.$content = $('.as-tree-chart-content', elt);
        elt.$childCtn = $('.as-tree-chart-child-ctn', elt);

        var fillColor, textColor;
        if (typeof nodeData.fill === "string") {
            fillColor = Color.parse(nodeData.fill);
        }
        else if (nodeData.fill instanceof Color) {
            fillColor = nodeData.fill;
        }

        if (fillColor) {
            textColor = fillColor.getContrastYIQ();
            elt.$content.addStyle({
                color: textColor.toString('hex8'),
                backgroundColor: fillColor.toString('hex8'),
            });
        }



        if (level === this.maxHorizonLevel) elt.addClass('as-horizontal');
        if (nodeData.items && nodeData.items.length > 0) {
            elt.addClass('as-has-children');
            /***
             * @type {AElement[]}
             */
            elt.$children = nodeData.items.map((it) => makeTree(it, level + 1));
            elt.$childCtn.addChild(elt.$children);
        }


        return elt;
    };

    this.$root = makeTree(data, 0).addTo(this);
    this.domSignal.emit('formatSize');

};


TreeChart.prototype._formatSize = function () {
    if (!this.$root) return;
    var cBound = this.getBoundingClientRect();
    var maxHorizonLevel = this.maxHorizonLevel;
    var visit = (elt, level) => {
        if (!elt.$children) return;
        var sArr, maxS;
        if (level < maxHorizonLevel) {
            sArr = elt.$children.map(e => e.$content.getBoundingClientRect().height);
            maxS = Math.max.apply(Math, sArr);
            elt.$children.forEach((elt, i) => {
                if (sArr[i] < maxS) {
                    elt.$content.addStyle('height', maxS + 'px');
                }
            });
        }
        else {
            sArr = elt.$children.map(e => e.$content.getBoundingClientRect().width);
            maxS = Math.max.apply(Math, sArr);
            console.log(elt.$children, sArr)
            elt.$children.forEach((elt, i) => {
                if (sArr[i] < maxS) {
                    elt.$content.addStyle('width', maxS + 'px');
                }
            });
        }
        elt.$children.forEach(c => visit(c, level + 1));
    };

    visit(this.$root, 0);
    var newBound = this.getBoundingClientRect();
    if (cBound.width !== newBound.width || cBound.height !== newBound.height) {
        ResizeSystem.update();
    }
};

TreeChart.property = {};

TreeChart.property.data = {
    set: function (data) {
        data = copyJSVariable(data || null);
        this._data = data;
        this._updateContent();
    },
    get: function () {
        return this._data;
    }
};

TreeChart.property.maxHorizonLevel = {
    set: function (value) {
        if (!isNaturalNumber(value)) value = 2;//default
        this._maxHorizonLevel = value;
        this._updateContent();
    },
    get: function () {
        return this._maxHorizonLevel;
    }
}


ACore.install(TreeChart);
export default TreeChart;
