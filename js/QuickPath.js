import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

function QuickPath() {
    var res = _({
        class: 'absol-quick-path',
        extendEvent: ['change', 'press']
    });

    res.eventHandler = OOP.bindFunctions(res, QuickPath.eventHandler);
    res._itemSeq = [];
    res.on('click', res.eventHandler.click);
    return res;
}


QuickPath.eventHandler = {};

QuickPath.eventHandler.click = function (event) {
    var button = this._fileButton(event.target)
    if (button) this.pressButton(button);

};


QuickPath.prototype.pressButton = function (button) {
    var index = parseInt(button.attr('data-index'));
    this.emit('press', { target: this, button: button, isActive: button.containsClass('toggle'), index: index, pathElement: this.path[index] }, this);
    if (button.containsClass('toggle')) return;
    if (!this.path[index].items || this.path[index].items.length == 0) return;// don't display dropdown
    var self = this;
    button.addClass('toggle');
    var buttonBound = button.getBoundingClientRect();
    var rootBound = this.getBoundingClientRect();
    var outBound = Dom.traceOutBoundingClientRect(this);
    var atop = rootBound.top - outBound.top - 5;
    var abot = outBound.bottom - buttonBound.bottom - 10;
    var dx = buttonBound.left - rootBound.left;


    var dropdown = _({
        class: 'absol-quick-path-dropdown',
        style: {
            left: dx + 'px',
            'min-width': buttonBound.width + 'px'
        },
        tag: 'bscroller',
        child: 'vmenu'
    }).addTo(this);
    var menu = $('vmenu', dropdown).on('press', function (event) {
        var text = event.menuItem.text;
        var iconSrc = event.menuItem.iconSrc;
        self.path[index].text = text;
        button.$text.clearChild().addChild(_({ text: text }));
        if (iconSrc) {
            button.$iconImg.attr('src', iconSrc);
        }
        else {
            button.$iconImg.attr('src', undefined);
        }

        self.emit('change', { type: 'change', target: self, text: text, index: index, iconSrc: iconSrc });
    });

    var items = this.path[index].items;
    if (atop > abot) {
        menu.items = items;
        dropdown.addStyle({
            'max-height': atop + 'px',
            bottom: '100%'
        });
        var dropdownBound = dropdown.getBoundingClientRect();
        if (dropdownBound.height < abot) {
            dropdown.addStyle({
                'max-height': abot + 'px',
                top: '100%',
                overflow: 'visible'
            }).removeStyle('bottom');
        }
        else if (dropdownBound.height < atop) {
            dropdown.addStyle('overflow', 'visible')
        }
    }
    else {
        menu.items = items;
        dropdown.addStyle({
            'max-height': abot + 'px',
            top: '100%'
        });
        var dropdownBound = dropdown.getBoundingClientRect();
        if (dropdownBound.height < abot) {
            dropdown.addStyle('overflow', 'visible')
        }
    }
    setTimeout(function () {
        $(document.body).once('click', function () {
            dropdown.remove();
            button.removeClass('toggle');
        });
    }, 100);
};

QuickPath.prototype._fileButton = function (elt) {
    while (elt != this && elt) {
        if (elt.tagName == 'BUTTON' && elt.containsClass && elt.containsClass('absol-quick-path-btn')) {
            return elt;
        }
        elt = elt.parentNode;
    }
    return false;
};


QuickPath.prototype.updatePath = function () {
    this.clearChild();
    var self = this;
    this.path.forEach(function (data, index) {
        var buttom = self._createButton(data, index);
        self.addChild(buttom);
    });

};

QuickPath.prototype._createButton = function (data, index) {
    var buttom = _({
        tag: 'button',
        class: 'absol-quick-path-btn',
        attr: {
            'data-index': '' + index
        },
        child: [
            'toggler-ico',
            {
                tag: 'img',
                class: "absol-quick-path-btn-ext-ico",

            },
            {
                tag: 'span',
                child: { text: data.text }
            }
        ]
    });

    buttom.$iconImg = $('.absol-quick-path-btn-ext-ico', buttom);
    if (data.iconSrc) {
        buttom.$iconImg.src = data.iconSrc;
    }
    buttom.$text = $('span', buttom);
    return buttom;
}

QuickPath.prototype.push = function (item) {
    this.path.push(item);
    var buttom = this._createButton(item, this.path.length - 1);
    this.addChild(buttom);
};

QuickPath.prototype.clear = function () {
    this.path = [];
}



QuickPath.prototype.pop = function () {
    //todo
    var res = this.path.pop();
    var button = $('button[data-index="' + this.path.length + '"]');
    if (button) button.remove();
    return res;
};



QuickPath.property = {};

/**
 * @typedef PathElement 
 * @property {String} name
 * @property {Array<String>} items
 *  
 */

QuickPath.property.path = {
    /**
     * @param {Array<PathElement>} value 
     */
    set: function (value) {
        this._path = value || [];
        this.updatePath();
    },
    get: function () {
        return this._path || [];
    }
};


QuickPath.property.textPath = {
    get: function () {

    }
};

Acore.install('quickpath', QuickPath);

export default QuickPath;






