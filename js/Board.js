
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function Board() {
    this.$attachhook = _('attachhook').addTo(this)
    .on('error', this.notifySizeChange.bind(this));
    
}


Board.prototype.notifySizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (!this._lastBound || this._lastBound.width != bound.width || this._lastBound.height != this._lastBound.height) {
        this.emit('sizechange', {name: 'sizechange', target: this, bound: bound});
    }
    this._lastBound = { width: bound.width, height: bound.height };
};

Board.prototype.cancelWaitingSizeChange= function(){
    var bound = this.getBoundingClientRect();
    this._lastBound = { width: bound.width, height: bound.height };
    return bound;
};


Board.render = function () {
    return _({
        class: 'as-board',
        extendEvent: ['sizechange', 'changeposition']
    });
};


Board.prototype.getParent = function () {
    var parent = this.parentElement;
    while (parent) {
        if (parent.classList.contains('ac-board-table')) return parent;
        parent = parent.parentElement;
    }
    return null;
};


ACore.install('board', Board);

export default Board;