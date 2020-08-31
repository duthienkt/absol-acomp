import '../css/boardtable.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
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