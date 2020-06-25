import Dom from 'absol/src/HTML5/Dom';
import CheckboxInput from "./CheckBoxInput";
import RadioInput from "./RadioInput";

export var creators = [
    CheckboxInput,
    RadioInput
];

/***
 *
 * @param {Dom} core
 */
export default function install(core) {
    core.install(creators);
}