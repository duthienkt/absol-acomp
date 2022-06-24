import { EmojiAnimByIdent } from "../EmojiAnims";
import { _ } from "../../ACore";
import { EMPTY_2_SPACES } from "./TITextController";

export function tokenizeMessageText(text) {
    var emojis = EmojiAnimByIdent;
    var splitter = Object.keys(EmojiAnimByIdent).concat(['\n']);
    var tagTokens = text.match(/@\[id:\d+]/g) || [];
    var otherTokens = text.split(/@\[id:\d+]/g);

    var tokens = otherTokens.reduce((ac, cr, i) => {
        ac.push(cr);
        if (i < tagTokens.length) ac.push(tagTokens[i]);
        return ac;
    }, []);

    tokens = splitter.reduce((chain, splitter) => {
        return chain.reduce((ac, token) => {
            var subChain = token.split(splitter);
            for (var i = 0; i < subChain.length; ++i) {
                if (subChain[i]) {
                    ac.push(subChain[i]);
                }
                if (i + 1 < subChain.length) {
                    ac.push(splitter);
                }
            }
            return ac;
        }, []);
    }, tokens);

    tokens = tokens.map(text => {
        var tagId;
        if (text === '\n') {
            return {
                type: 'NEW_LINE'
            };
        }
        else if (emojis[text]) {
            return {
                type: 'EMOJI',
                value: text
            };

        }
        else if (text.match(/^@\[id:\d+]$/)) {
            tagId = text.substring(5, text.length - 1);
            return {
                type: "TAG",
                value: tagId
            };
        }
        else return {
                type: 'TEXT',
                value: text
            };
    });
    return tokens;
}


export var isText = node => {
    return node && node.nodeType === Node.TEXT_NODE;
}

export var isNewLine = node =>{
    return node && node.tagName === 'BR';
}

/***
 *
 * @param {Text|AElement}node
 * @returns {null|*}
 */
export var getFirstTextNode = node => {
    if (node.nodeType === Node.TEXT_NODE || node.tagName === 'BR') return node;
    var nodes = node.childNodes;
    var res = null;
    for (var i = 0; i < nodes.length && !res; ++i) {
        res = res || getFirstTextNode(nodes[i]);
    }
    return res;
};

export var getLastTextNode = node => {
    if (node.nodeType === Node.TEXT_NODE || node.tagName === 'BR') return node;
    var nodes = node.childNodes;
    var res = null;
    for (var i = nodes.length - 1; i > 0 && !res; --i) {
        res = res || getLastTextNode(node);
    }
    return res;
};

export var isTokenText = node => {
    if (node.nodeType !== Node.TEXT_NODE) return false;
    return isToken(node.parentElement);
}

export var isToken = node => {
    return node && node.classList && (node.classList.contains('as-emoji-token') || node.classList.contains('as-tag-token'));
}


export function findNextTextNode(root, current) {
    var nextTextNode = node => {
        var res = null;
        var next = node.nextSibling;
        while (next && !res) {
            res = getFirstTextNode(next);
            next = next.nextSibling;
        }
        if (!res && node.parentElement !== root) {
            res = nextTextNode(node.parentElement);
        }
        return res;
    }
    return nextTextNode(current);
}

export function findPrevTextNode(root, current) {
    var prevTextNode = node => {
        var res = null;
        var prev = node.previousSibling;
        while (prev && !res) {
            res = getLastTextNode(prev);
            prev = prev.previousSibling;
        }
        if (!res && node.parentElement !== root) {
            res = prevTextNode(node.parentElement);
        }
        return res;
    }
    return prevTextNode(current);
}


export function text2ContentElements(text){
    return tokenizeMessageText(text).map((token) => {
        var textOfTag;
        switch (token.type) {
            case 'NEW_LINE':
                return _('br');
            case 'EMOJI':
                return _({
                    tag: 'span',
                    class: 'as-emoji-token',
                    attr: {
                        'data-display': EMPTY_2_SPACES,
                        'data-text': token.value
                    },
                    child: { text: EMPTY_2_SPACES }
                })
            case 'TAG':
                textOfTag = this.elt.tagMap && this.elt.tagMap[token.value];
                return _({
                    tag: 'span',
                    class: 'as-tag-token',
                    attr: {
                        'data-text': '@[id:' + token.value + ']',
                        'data-display': textOfTag ? '@' + textOfTag : '@[id:' + token.value + ']'
                    },
                    child: { text: textOfTag ? '@' + textOfTag : '@[id:' + token.value + ']' }
                });
            case 'TEXT':
            default:
                return _({ text: token.value });
        }
    });
}