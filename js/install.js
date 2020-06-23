import Dom from 'absol/src/HTML5/Dom';
import CheckboxInput from "./CheckBoxInput";

export var creators = [
    CheckboxInput
];

/***
 *
 * @param {Dom} core
 */
export default function install(core) {
    core.install(creators);
}