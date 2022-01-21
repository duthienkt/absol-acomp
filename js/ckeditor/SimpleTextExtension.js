import { _ } from "../../ACore";

var name = 'simple_text';

var parserDiv = _('div');

function explicit(data, placeHolderElt) {
    parserDiv.innerHTML = data.replace(/&nbsp;/g, ' ');
    return parserDiv.innerText;
}

function implicit(data, placeHolderElt) {
    return data
        //.replace(/</g, '&lt;').replace(/</g, '&gt;').replace(/"/g, '&quot;').replace(/&/g, '&amp;')
        .replace(/[\r\n]/g, '');
}


export default {
    name: name,
    implicit: implicit,
    explicit: explicit,
}