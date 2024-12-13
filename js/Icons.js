import ACore, { _, $ } from "../ACore";
import SpinnerIcoText from '../assets/icon/spinner.tpl';
import MdiStoreMarkerOutlineText from '../assets/icon/mdi_store_marker_outline.tpl';
import FontColorIconText from '../assets/icon/font_color.tpl';
import InsertColLeftIconText from '../assets/icon/insert_col_left.tpl';
import InsertColRightIconText from '../assets/icon/insert_col_right.tpl';
import ProcessOutlineIconText from '../assets/icon/process_outline.tpl';
import ProcedureOutlineIconText from '../assets/icon/procedure_outline.tpl';
import MobileFormEditOutlineIconText from '../assets/icon/mobile_form_edit_outline.tpl';
import WindowsFormEditOutlineIconText from '../assets/icon/windows_form_edit_outline.tpl';
import InputFormOutlineText from '../assets/icon/input_form_outline.tpl';
import OutputFormOutlineText from '../assets/icon/output_form_outline.tpl';
import TemplateIconText from '../assets/icon/template.tpl';
import MobileInputFormOutlineIconText from '../assets/icon/mobile_input_form_outline.tpl';
import MobileOutputFormOutlineIconText from '../assets/icon/mobile_output_form_outline.tpl';
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

export function ProcessOutlineIcon() {
    return _(ProcessOutlineIconText);
}

ProcessOutlineIcon.tag = 'ProcessOutlineIcon'.toLowerCase();

ACore.install(ProcessOutlineIcon);

export function ProcedureOutlineIcon() {
    return _(ProcedureOutlineIconText);
}

ProcedureOutlineIcon.tag = 'ProcedureOutlineIcon'.toLowerCase();

ACore.install(ProcedureOutlineIcon);

export function WindowsFormEditOutlineIcon() {
    return _(WindowsFormEditOutlineIconText);
}

WindowsFormEditOutlineIcon.tag = 'WindowsFormEditOutlineIcon'.toLowerCase();

ACore.install(WindowsFormEditOutlineIcon);

export function MobileFormEditOutlineIcon() {
    return _(MobileFormEditOutlineIconText);
}

MobileFormEditOutlineIcon.tag = 'MobileFormEditOutlineIcon'.toLowerCase();
ACore.install(MobileFormEditOutlineIcon);

export function TemplateIcon() {
    return _(TemplateIconText);
}

TemplateIcon.tag = 'TemplateIcon'.toLowerCase();
ACore.install(TemplateIcon);

export function InputFormOutlineIcon() {
    return _(InputFormOutlineText);
}

InputFormOutlineIcon.tag = 'InputFormOutlineIcon'.toLowerCase();
ACore.install(InputFormOutlineIcon);

export function OutputFormOutlineIcon() {
    return _(OutputFormOutlineText);
}

OutputFormOutlineIcon.tag = 'OutputFormOutlineIcon'.toLowerCase();
ACore.install(OutputFormOutlineIcon);

export function MobileInputFormOutlineIcon() {
    return _(MobileInputFormOutlineIconText);
}

MobileInputFormOutlineIcon.tag = 'MobileInputFormOutlineIcon'.toLowerCase();
ACore.install(MobileInputFormOutlineIcon);

export function MobileOutputFormOutlineIcon() {
    return _(MobileOutputFormOutlineIconText);
}

MobileOutputFormOutlineIcon.tag = 'MobileOutputFormOutlineIcon'.toLowerCase();
ACore.install(MobileOutputFormOutlineIcon);

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

