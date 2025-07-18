import ACore, { _, $, $$ } from "../ACore";
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
import CityIconText from '../assets/icon/city.tpl';
import CountryIconText from '../assets/icon/country.tpl';
import ConfigurationFormOutlineIconText from '../assets/icon/configuration_form_outline.tpl';
import FunctionManagerText from '../assets/icon/function_manager.tpl';
import DataTypeConfiguratorOutlineIconText from '../assets/icon/data_type_configuration_outline.tpl';
import TimeBasedPayrollReportIconText from '../assets/icon/time_based_payroll_report.tpl';
import ImportantOutlineIconText from '../assets/icon/important_outline.tpl';
import SmileIconText from '../assets/icon/smile.tpl';
import EmojiMutedIconText from '../assets/icon/emoji_muted.tpl';
import '../css/icons.css';
import Color from "absol/src/Color/Color";
import { isNaturalNumber } from "./utils";

export function SpinnerIco() {
    this._circleRadius = 4;
    this.$circles = $$('circle', this);

    //default
    this.color = '#2E9DB5';
    this.circleRadius = 6;
}

SpinnerIco.tag = 'SpinnerIco'.toLowerCase();

SpinnerIco.prototype.variant2colors = {
    rainbow: [
        '#e15b64', '#f47e60', '#f8b26a',
        '#abbd81', '#849b87', '#6492ac',
        '#637cb5', '#6a63b6'
    ]
};

SpinnerIco.render = function () {
    return _(SpinnerIcoText);
};

SpinnerIco.property = {};

SpinnerIco.property.circleRadius = {
    /**
     * @this SpinnerIco
     * @param value
     */
    set: function (value) {
        if (typeof value !== 'number' || value < 0) {
            value = 4;
        }
        this._circleRadius = value;
        this.$circles.forEach(elt => {
            elt.attr('r', value);
        })
    },
    /**
     * @this SpinnerIco
     */
    get: function () {
        return this._circleRadius;
    }
};

SpinnerIco.property.color = {
    set: function (cl) {
        if (this.variant2colors[cl]) {
            cl = this.variant2colors[cl];
        }
        else if (typeof cl === 'string') {
            try {
                cl = Color.parse(cl);
                cl = Array(8).fill(cl)
                    .map((c, i) => c.withAlpha(1 / 8 * (i + 1)));
            } catch (e) {
                cl = this.variant2colors['rainbow'];
            }
        }
        cl = cl || [];
        if (!Array.isArray(cl)) cl = [];
        var n = Math.min(this.$circles.length, cl.length);
        for (var i = 0; i < n; i++) {
            this.$circles[i].attr('fill', cl[i]);
        }
    },
    get: function () {
        return this.$circles.map(elt => elt.attr('fill'));
    }
};


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

export function CityIcon() {
    return _(CityIconText);
}

CityIcon.tag = 'CityIcon'.toLowerCase();

ACore.install(CityIcon);

export function CountryIcon() {
    return _(CountryIconText);
}

CountryIcon.tag = 'CountryIcon'.toLowerCase();

ACore.install(CountryIcon);

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

export function ConfigurationFormOutlineIcon() {
    return _(ConfigurationFormOutlineIconText);
}

ConfigurationFormOutlineIcon.tag = 'ConfigurationFormOutlineIcon'.toLowerCase();

ACore.install(ConfigurationFormOutlineIcon);

export function FunctionManagerIcon() {
    return _(FunctionManagerText);
}

FunctionManagerIcon.tag = 'FunctionManagerIcon'.toLowerCase();

ACore.install(FunctionManagerIcon);

export function DataTypeConfiguratorOutlineIcon() {
    return _(DataTypeConfiguratorOutlineIconText);
}

DataTypeConfiguratorOutlineIcon.tag = 'DataTypeConfiguratorOutlineIcon'.toLowerCase();

ACore.install(DataTypeConfiguratorOutlineIcon);

export function TimeBasedPayrollReportIcon() {
    return _(TimeBasedPayrollReportIconText);
}

TimeBasedPayrollReportIcon.tag = 'TimeBasedPayrollReportIcon'.toLowerCase();

ACore.install(TimeBasedPayrollReportIcon);

export function ImportantOutlineIcon() {
    return _(ImportantOutlineIconText).addStyle({
        width: '1em', height: '1em'
    });
}

ImportantOutlineIcon.tag = 'ImportantOutlineIcon'.toLowerCase();


ACore.install(ImportantOutlineIcon);

export function EmojiMutedIcon() {
    return _(EmojiMutedIconText);
}

EmojiMutedIcon.tag = 'EmojiMutedIcon'.toLowerCase();

ACore.install(EmojiMutedIcon);

/**
 * @extends AElement
 * @constructor
 */
export function SmileIcon() {
    this.$frames = $$('g', this);
    this.frame = 0;
}

SmileIcon.tag = 'SmileIcon'.toLowerCase();

SmileIcon.render = function () {
    return _(SmileIconText);
};

SmileIcon.property = {};

SmileIcon.property.frame = {
    set: function (value) {
        if (!isNaturalNumber(value)) value = 0;
        value = Math.min(4, Math.max(value, 0));
        this._frame = value;
        for (var i = 0; i < this.$frames.length; i++) {
            if (value === i) {
                this.$frames[i].removeStyle('display');
            }
            else {
                this.$frames[i].addStyle('display', 'none');
            }
        }
    },
    get: function () {
        return this._frame || 0;
    }
};

ACore.install(SmileIcon);

function SmileRate() {

}

SmileRate.tag = 'SmileRate'.toLowerCase();

SmileRate.render = function () {
    return _({
        class: 'as-smile-rate',
        child: Array(5).fill(SmileIcon.tag)
    });
};
