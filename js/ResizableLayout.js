import Acore from "../ACore";



var _ = Acore._;
var $ = Acore.$;

function ResizableLayout() {
    var res = _({
        class: 'absol-resizablelayout',
        child:'.absol-resizablelayout-cell'
    });

    return res;
}

ResizableLayout.prototype.insertRow = function (index) {

};


ResizableLayout.prototype.addRow = function (index) {

}


ResizableLayout.prototype.updateSize = function () {

};


ResizableLayout.prototype.init = function (props) {
    this._cell = [];
    Object.assign(this, props || {});
};

Acore.creator.resizablelayout = ResizableLayout;

export default ResizableLayout;