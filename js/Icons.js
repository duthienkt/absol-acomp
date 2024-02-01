import ACore, { _, $ } from "../ACore";
import SpinnerIcoText from '../assets/icon/spinner.tpl';
import MdiStoreMarkerOutlineText from '../assets/icon/mdi_store_marker_outline.tpl';
import FontColorIconText from '../assets/icon/font_color.tpl';
import InsertColLeftIconText from '../assets/icon/insert_col_left.tpl';
import InsertColRightIconText from '../assets/icon/insert_col_right.tpl';
import '../css/icons.css';
import Color from "absol/src/Color/Color";

export function SpinnerIco() {
    return ACore._(SpinnerIcoText);
}

SpinnerIco.tag = 'SpinnerIco'.toLowerCase();

ACore.install(SpinnerIco);

export function InsertColLeftIcon() {
    return ACore._(InsertColLeftIconText);
}

InsertColLeftIcon.tag = 'InsertColLeftIcon'.toLowerCase();

ACore.install(InsertColLeftIcon);

export function InsertColRightIcon() {
    return ACore._(InsertColRightIconText);
}

InsertColRightIcon.tag = 'InsertColRightIcon'.toLowerCase();

ACore.install(InsertColRightIcon);

export function MdiStoreMarkerOutline() {
    return ACore._(MdiStoreMarkerOutlineText);
}

MdiStoreMarkerOutline.tag = 'mdi-store-marker-outline';

ACore.install(MdiStoreMarkerOutline);

export function FontColorIcon() {
    this._value = '#000000';
    this.$contract = $('.as-font-color-contract', this);
    this.$value = $('.as-font-color-value', this);
    this.value = 'cyan';
}

FontColorIcon.tag = 'FontColorIcon'.toLowerCase();

FontColorIcon.render = function () {
    return _(FontColorIconText);
};

FontColorIcon.property = {};
FontColorIcon.property.value = {
    set: function (value) {
        var cValue;
        if (typeof value === "string") {
            try {
                cValue = Color.parse(value);
                value = cValue.toString('hex6');
            } catch (err) {
                value = "#000000";
                cValue = Color.parse(value);
            }
        }
        else if (value instanceof Color) {
            cValue = value;
            value = value.toString('hex6');
        }
        else {
            value = "#000000";
            cValue = Color.parse(value);
        }
        this._value = value;
        var hColor = cValue.getContrastYIQ();
        this.$contract.addStyle('fill', hColor.toString("hex6"));
        this.$value.addStyle('fill', this._value.toString('hex6'));

    },
    get: function () {
        return this._value;
    }
};

