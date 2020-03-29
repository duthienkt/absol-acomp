import ACore from "../ACore";

function Draggable(element) {
    if (!element) element = ACore._('div');
    else ACore.$(element);
    element.defineEvent(['predrag', 'drag', 'begindrag', 'enddrag']);
    var body = ACore.$('body');
    var isMoving = false;
    var firstMove = false;
    var offsetX;
    var offsetY;
    var fontSize;
    var left0em, top0em, left0, top0;
    var finishMoving = function (event) {
        if (isMoving) {
            isMoving = false;
            body.off('mousemove', mouseMoveEventHandler);

            event.moveDX = event.clientX - offsetX;
            event.moveDY = event.clientY - offsetY;
            event.moveDXem = event.moveDX / fontSize;
            event.moveDYem = event.moveDY / fontSize;
            event.moveToX = left0 + event.moveDX;
            event.moveToY = top0 + event.moveDY;
            element.emit('enddrag', event);
        }
    };

    var mouseUpEventHandler = function (event) {
        finishMoving(event);
    };

    var mouseMoveEventHandler = function (event) {
        event.preventDefault();
        event.moveDX = event.clientX - offsetX;
        event.moveDY = event.clientY - offsetY;
        event.moveDXem = event.moveDX / fontSize;
        event.moveDYem = event.moveDY / fontSize;
        event.moveToX = left0 + event.moveDX;
        event.moveToY = top0 + event.moveDY;

        event.moveToXem = left0em + event.moveDXem;
        event.moveToYem = top0em + event.moveDYem;
        if (firstMove) {
            firstMove = false;
            element.emit('begindrag', event);
        }
        element.emit('drag', event);

    };

    var mouseOutEventHandler = function (event) {
        finishMoving(event);
    };


    var mouseDownEventHandler = function (event) {
        isMoving = true;
        firstMove = true;
        body.on('mousemove', mouseMoveEventHandler);
        body.once('mouseleave', mouseOutEventHandler);
        body.once('mouseup', mouseUpEventHandler);

        fontSize = this.getFontSize();
        offsetX = event.clientX;
        offsetY = event.clientY;
        left0 = parseFloat(element.getComputedStyleValue('left').replace('px', ''));
        top0 = parseFloat(element.getComputedStyleValue('top').replace('px', ''));
        left0em = left0 / fontSize;
        top0em = top0 / fontSize;
        event.x0 = left0;
        event.y0 = top0;
        event.y0em = left0em;
        event.y0em = top0em;
        element.emit('predrag', event);
    };

    element.on('mousedown', mouseDownEventHandler);
    return element;
};


export default Draggable;