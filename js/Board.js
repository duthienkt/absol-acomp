import '../css/boardtable.css';
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function Board() {
}


Board.tag = "board";
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


ACore.install(Board);

export default Board;