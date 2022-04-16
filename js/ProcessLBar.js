import { $, _ } from "../ACore";
import '../css/processlbar.css';
import { measureText } from "./utils";

/***
 * @extends AElement
 * @constructor
 */
function ProcessLBar() {
    this.$stepCtn = $('.as-process-l-bar-step-ctn', this);
    this.$stepName = $('.as-process-l-bar-step-name', this);
    this.$items = [];
    this._items = [];
    this._lHeight = 3;
    this._value = null;
}


ProcessLBar.tag = 'ProcessLBar'.toLowerCase();

ProcessLBar.render = function () {
    return _({
        class: 'as-process-l-bar',
        extendEvent: 'change',
        child: [
            {
                class: 'as-process-l-bar-step-ctn'

            },
            {
                class: 'as-process-l-bar-step-name'
            }
        ]
    });
};

ProcessLBar.prototype._updateCol = function () {
    var colN = Math.max(this.$items.length - this._lHeight + 1, 0);
    while (this.$stepCtn.childNodes.length > colN) {
        this.$stepCtn.lastChild.remove();
    }

    while (this.$stepCtn.childNodes.length < colN) {
        this.$stepCtn.addChild(_('.as-process-l-bar-col'));
    }
    var i;
    for (i = 0; i < colN; ++i) {
        this.$stepCtn.childNodes[i].clearChild()
            .addChild(this.$items[i])
    }
    for (i = colN; i < this.$items.length; ++i) {
        this.$stepCtn.lastChild.addChild(this.$items[i]);
    }

    this.nameWidth = this._items.reduce(function (ac, cr) {
        return Math.max(ac, measureText(cr.name, 'bold 14px Arial, Helvetica, sans-serif').width);
    }, 0);
    if (colN <= 1) {
        this.addClass('as-col-layout');
    }
    else {
        this.removeClass('as-col-layout');
    }

    if (colN <= 2) {
        this.addStyle('--as-process-l-bar-item-min-width', this.nameWidth + 'px');
    }
    else {
        this.addStyle('--as-process-l-bar-item-min-width', ((this.nameWidth + 10) / (colN - 1) - 10) + 'px');
    }

};

ProcessLBar.prototype._updateValue = function () {
    var value = this._value;
    this.$items.forEach(function (elt) {
        if (elt.itemData.value === value) {
            elt.addClass('as-active');
            this.$stepName.clearChild().addChild(_({
                tag: 'span',
                child: { text: elt.itemData.name }
            }));
        }
        else {
            elt.removeClass('as-active');
        }
    }.bind(this));

};


ProcessLBar.prototype.notifyChange = function (originalEvent) {
    this.emit('change', { type: 'change', target: this, originalEvent: originalEvent || null }, this);
};

ProcessLBar.prototype._makeItem = function (item) {
    var self = this;
    var stepElt = _({
        class: 'as-process-l-bar-step',
        attr: {
            title: item.name
        },
        props: {
            itemData: item
        },
        on: {
            click: function (event) {
                if (self.disabled) return;
                var value = this._value;
                if (item.value === value) return;
                self.value = item.value;
                self.notifyChange(event);
            }
        }
    });
    if (item.color) {
        stepElt.addStyle('--as-process-l-bar-active-color', item.color);
    }

    return stepElt;
};

ProcessLBar.property = {};

ProcessLBar.property.items = {
    set: function (items) {
        items = items || [];
        this._items = items;
        this.$itemByValue = {};
        this.$items = this._items.map(function (item) {
            return this._makeItem(item);
        }.bind(this));
        this._updateCol();
        this._updateValue();
    },
    get: function () {
        return this._items;
    }
};


ProcessLBar.property.value = {
    set: function (value) {
        this._value = value;
        this._updateValue();
    },
    get: function () {
        return this._value;
    }
};

ProcessLBar.property.lHeight = {
    set: function (value) {
        this._lHeight = value;
        if (value === 1){
            this.addClass('as-single-line');
        }
        else {
            this.removeClass('as-single-line');
        }
        this._updateCol();
    },
    get: function () {
        return this._lHeight;
    }
};

ProcessLBar.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};


export default ProcessLBar;