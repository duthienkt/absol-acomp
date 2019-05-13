import Acore from "../ACore";
import Color from "../../Color/Color";



var _ = Acore._;
var $ = Acore.$;

function ResizableLayout() {
    var res = _({
        class: 'absol-resizablelayout',
        child: '.absol-resizablelayout-cell'
    });

    res._colsSize = [1];
    res._rowSize = [1];
    setTimeout(u=> res.debug(), 400);
   
    return res;
}

ResizableLayout.prototype.debug = function(){
    $('div', this, function(e){
        e.addStyle('background-color', Color.fromHSLA(Math.random(), Math.random(), 0.2, 0.2).toString())
    });
};

/**
 * @param {Number} index -1: end of table
 * @param {Number} size 
 * @returns {Array<Element>}
 */
ResizableLayout.prototype.insertRow = function (index, size) {
    if (!(size>=0 && size<=1)){
        this._rowSize.reduce(function(ac, cr){return ac+ cr},0)/this._rowSize.length;
    }

    
};


ResizableLayout.prototype.addRow = function (index) {

}


ResizableLayout.prototype.updateSize = function () {

};

ResizableLayout.prototype.property = {};

ResizableLayout.prototype.property.nCol = {
    set: function (value) {
        if (value > 0) {
            value = Math.ceil(value);
        }
        else {
            throw new Error('Invalid number');
        }

    },
    get: function () {

    }
};

ResizableLayout.prototype.property.nRow = {
    set: function (value) {
        if (value > 0) {
            value = Math.ceil(value);
        }
        else {
            throw new Error('Invalid number');
        }
    },
    get: function () {
       
    }
};





ResizableLayout.prototype.init = function (props) {
    this._cell = [];
    Object.assign(this, props || {});
};

Acore.creator.resizablelayout = ResizableLayout;

export default ResizableLayout;