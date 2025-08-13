import {
    findNextTextNode,
    findPrevTextNode,
    getFirstTextNode, getLastTextNode,
    isNewLine,
    isText,
    isToken,
    isTokenText
} from "./tiutils";
import { getSelectionRangeDirection, setSelectionRange } from "../utils";


/****
 *
 * @param {TokenizeInput} elt
 * @constructor
 */
function TISelectionController(elt) {
    this.elt = elt;
    this.prevRange = null;
}


TISelectionController.prototype.onSelect = function () {
    var key = (this.elt.prevKey && (new Date().getTime() - this.elt.prevKey.time < 100)) ? this.elt.prevKey.value : '';
    var sel = document.getSelection();
    var range = sel.getRangeAt(0);
    var direction = getSelectionRangeDirection(range);
    var newRange;

    var handleEmojiToken = () => {
        var startCtn = range.startContainer;
        var startOffset = range.startOffset;
        var startToken;


        var endCtn = range.endContainer;
        var endOffset = range.endOffset;
        var endToken;

        var changed = 0;

        var textData;
        var nextTextNode;
        var prevTextNode;
        var displayText;
        var newText;


        if (isTokenText(startCtn)) {
            startToken = startCtn.parentElement;
            displayText = startToken.getAttribute('data-display');
            textData = startCtn.data;
            if (range.collapsed) {
                if (textData.length < displayText.length) {
                    prevTextNode = this.getPrevTextNode(startCtn);
                    if (!isText(prevTextNode)) {
                        prevTextNode = document.createTextNode('');
                        startToken.parentElement.insertBefore(prevTextNode, startToken);
                    }
                    startToken.remove();
                    startCtn = prevTextNode;
                    startOffset = prevTextNode.data.length;
                    changed = 1;
                }
                else if (textData === displayText && startOffset < displayText.length && startOffset > 0) {
                    if (key === 'arrowright' || !key) {
                        startOffset = displayText.length;
                        changed = 1;
                    }
                    else if (key === 'arrowleft') {
                        startOffset = 0;
                        changed = 1;
                    }
                    else if (key === 'mouseup') {
                        startOffset = 0;
                        endOffset = displayText.length;
                        changed = 2;
                    }
                }
                else if (textData.length > displayText.length) {
                    if (startOffset === textData.length) {
                        nextTextNode = startToken.nextSibling;
                        if (!isText(nextTextNode)) {
                            newText = document.createTextNode('');
                            nextTextNode.parentElement.insertBefore(newText, nextTextNode);
                            nextTextNode = newText;
                        }
                        nextTextNode.data = textData.substring(displayText.length) + nextTextNode.data;
                        startCtn.data = displayText;
                        startCtn = nextTextNode;
                        startOffset = textData.length - displayText.length;
                        changed = 1;
                    }
                    else {
                        prevTextNode = startToken.previousSibling;
                        if (!isText(prevTextNode)) {
                            newText = document.createTextNode('');
                            startToken.parentElement.insertBefore(newText, startToken);
                            prevTextNode = newText;
                        }
                        prevTextNode.data += textData.substring(0, textData.length - displayText.length);
                        startCtn.data = displayText;
                        startCtn = prevTextNode;
                        startOffset = startCtn.data.length;
                    }

                }
            }
            else {
                if (startOffset > 0 && startOffset < displayText.length) {
                    startOffset = 0;
                    changed = 2;
                }
            }
        }

        if (isTokenText(endCtn)) {
            endToken = endCtn.parentElement;
            displayText = endToken.getAttribute('data-display');
            if (!range.collapsed) {
                if (endOffset < displayText.length) {
                    endOffset = displayText.length
                    changed = 2;
                }
            }
        }

        if (changed > 0) {
            newRange = document.createRange();
            newRange.setStart(startCtn, startOffset);
            if (changed > 1) {
                newRange.setEnd(endCtn, endOffset);
            }
            else {
                //for saving
                endOffset = startOffset;
                endCtn = startCtn;
            }
            setSelectionRange(newRange, direction === 'backward');
        }
        var nextToken, nextText;
        if (isToken(endCtn.nextSibling)) {
            nextToken = endCtn.nextSibling;
            displayText = nextToken.getAttribute('data-display');
            nextText = getFirstTextNode(nextToken);
            if (!nextText || nextText.data !== displayText) nextToken.remove();
        }

        this.prevRange = {
            startOffset: startOffset,
            startContainer: startCtn,
            endOffset: endOffset,
            endContainer: endCtn
        };

    }

    handleEmojiToken();

};


TISelectionController.prototype.getNextTextNode = function (current) {
    return findNextTextNode(this.elt, current);
};

TISelectionController.prototype.getPrevTextNode = function (current) {
    return findPrevTextNode(this.elt, current);
};

TISelectionController.prototype.setRangeByOffset = function (offset) {
    //todo: fix offset length
    var start, end, direction;

    if (typeof offset === "number") {
        start = offset;
        end = offset;
        direction = 'forward';
    }
    else {
        start = offset.start;
        end = offset.end;
        direction = offset.direction || 'forward';
    }

    var startCtn = null;
    var startOffset = 0;
    var endCtn = null;
    var endOffset = 0;

    var st = '';
    var nodes = Array.prototype.slice.call(this.elt.childNodes);
    if (isNewLine(nodes[nodes.length - 1])) nodes.pop();
    var node;
    for (var i = 0; i < nodes.length; ++i) {
        node = nodes[i];
        if (isText(node)) {
            st += node.data;
            if (!startCtn && st.length >= start) {
                startCtn = node;
                startOffset = node.data.length - (st.length - start);
            }

            if (!endCtn && st.length >= end) {
                endCtn = node;
                endOffset = node.data.length - (st.length - end);
            }
        }
        else if (isToken(node)) {
            st += node.getAttribute('data-text');
            if (!startCtn && st.length >= start) {
                startCtn = getFirstTextNode(node);
                startOffset = startCtn.data.length;
            }

            if (!endCtn && st.length >= end) {
                endCtn = getFirstTextNode(node);
                endOffset = endCtn.data.length;
            }
        }
        else if (isNewLine(node)) {
            st += '\n';
            if (!startCtn && st >= start) {
                startCtn = this.elt;
                startOffset = i + 1;
            }

            if (!endCtn && st.length >= end) {
                endCtn = this.elt;
                endOffset = i + 1;
            }
        }
    }

    if (!startCtn) {
        if (nodes.length > 0) {
            node = nodes[nodes.length - 1]
            if (isNewLine(node)) {
                startCtn = this.elt;
                startOffset = nodes.length;
            }
            else if (isText(node)) {
                startCtn = node;
                startOffset = node.length;
            }
            else {
                startCtn = getLastTextNode(node);
                startOffset = node.length;
            }
        }
        else {
            startCtn = this.elt;
            startOffset = 0;
        }
    }

    if (!endCtn) {
        endCtn = startCtn;
        endOffset = startOffset;
    }
    if (startCtn) {
        if (isText(startCtn)) {
            startOffset = Math.min(startOffset, startCtn.data.length);
        }
        else {
            startOffset = Math.min(startOffset, startCtn.childNodes.length);
        }
    }

    if (endCtn) {
        if (isText(endCtn)) {
            endOffset = Math.min(endOffset, endCtn.data.length);
        }
        else {
            endOffset = Math.min(endOffset, endCtn.childNodes.length);
        }
    }


    this.prevRange = {
        startContainer: startCtn,
        startOffset: startOffset,
        endContainer: endCtn,
        endOffset: endOffset
    }


    var range = document.createRange();
    range.setStart(startCtn, startOffset);
    range.setEnd(endCtn, endOffset);
    setSelectionRange(range, direction === 'backward');
};


TISelectionController.prototype.getOffset = function (range) {
    range = range || this.elt.selectionCtrl.prevRange;
    if (!range) return null;
    var nodes = Array.prototype.slice.call(this.elt.childNodes);
    if (isNewLine(nodes[nodes.length - 1])) nodes.pop();
    var startCtn = range.startContainer;
    var startOffset = range.startOffset;
    var endCtn = range.endContainer;
    var endOffset = range.endOffset;

    if (startCtn === this.elt) {
        startCtn = this.elt.childNodes[startOffset - 1];
        startOffset = 1;
    }
    else if (isTokenText(startCtn)) {
        startCtn = startCtn.parentElement;
        if (startOffset > 0) startOffset = startCtn.getAttribute('data-text').length;
    }

    if (endCtn === this.elt) {
        endCtn = this.elt.childNodes[endOffset];
        endOffset = 1;
    }
    else if (isTokenText(endCtn)) {
        endCtn = endCtn.parentElement;
        if (endOffset > 0) endOffset = endCtn.getAttribute('data-text').length;
    }

    var start = undefined;
    var end = undefined;
    var direction = getSelectionRangeDirection(range);
    var st = '';
    var node;
    for (var i = 0; i < nodes.length; ++i) {
        node = nodes[i];
        if (isText(node)) {
            if (start === undefined && node === startCtn) {
                start = st.length + startOffset;
            }
            if (end === undefined && node === endCtn) {
                end = st.length + endOffset;
            }
            st += node.data;
        }
        else if (isToken(node)) {
            if (start === undefined && node === startCtn) {
                start = st.length + startOffset;
            }
            if (end === undefined && node === endCtn) {
                end = st.length + endOffset;
            }

            st += node.getAttribute('data-text');
        }
        else if (isNewLine(node)) {
            st += '\n';
            if (start === undefined && node === startCtn) {
                start = st.length;
            }
            if (end === undefined && node === endCtn) {
                end = st.length;
            }
        }
    }

    if (start === undefined) start = 0;

    if (end === undefined) {
        end = start;
    }

    return {
        start: start,
        end: end,
        direction: direction
    }
}


export default TISelectionController;