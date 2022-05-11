import { stringHashCode } from "absol/src/String/stringUtils";

function stringOf(x) {
    if (x === null) return 'null';
    if (x === undefined) return 'undefined';
    var type = typeof x;
    if (type === 'string' || type === 'number') return JSON.stringify(x);
    if (x instanceof Date) return 'new Date(' + x.getTime() + ')';
    var keys;
    keys = Object.keys(x);
    keys.sort();
    return '{' + keys.map(function (key) {
        return JSON.stringify(key) + ':' + stringOf(x[key]);
    }).join(',') + '}';
}

export default function calcDTQueryHash(o) {
    var  s = stringOf(o);
    return stringHashCode(stringOf(o));
}