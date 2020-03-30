
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function Board() {
}


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