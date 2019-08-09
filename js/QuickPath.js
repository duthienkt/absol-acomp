import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;

function QuickPath() {
    var res = _({
        class: 'absol-quick-path',
        child: [
            {
                tag: 'button',
                class: 'absol-quick-path-btn',
                child: [
                    'toggler-ico',
                    {
                        tag: 'img',
                        class: "absol-quick-path-btn-ext-ico",
                        attr: {
                            src: 'https://volcanion.cf/exticons/vivid/js.svg'
                        }
                    },
                    {
                        tag: 'span',
                        child: { text: 'MyComputer' }
                    }

                ]
            },
            {
                tag: 'button',
                class: 'absol-quick-path-btn',
                child: [
                    'toggler-ico',

                    {
                        tag: 'img',
                        class: "absol-quick-path-btn-ext-ico",
                        attr: {
                            src: 'https://volcanion.cf/exticons/vivid/js.svg'
                        }
                    },
                    {
                        tag: 'span',
                        child: { text: 'MyComputer' }
                    }

                ]
            },
            {
                tag: 'button',
                class: 'absol-quick-path-btn',

                child: [
                    'toggler-ico',

                    {
                        tag: 'img',
                        class: "absol-quick-path-btn-ext-ico",
                        attr: {
                            src: 'https://volcanion.cf/exticons/vivid/js.svg'
                        }
                    },
                    {
                        tag: 'span',
                        child: { text: 'MyComputer' }
                    }

                ]
            }
        ]
    });

    res._itemSeq = [];
    return res;
}


QuickPath.prototype._createButton = function (text, extSrc) {
    var res = _({
        tag: 'button',
        child: [
            {
                tag: 'img',
            }
        ]
    });

    return res;
};


QuickPath.prototype.push = function (item) {

};

QuickPath.prototype.clear = function () {

}



QuickPath.prototype.pop = function () {
    //todo
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

    },
    get: function () {

    }
};


QuickPath.property.textPath = {
    get: function () {

    }
};

Acore.install('quickpath', QuickPath);

export default QuickPath;






