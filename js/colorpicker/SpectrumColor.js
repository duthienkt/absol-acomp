import CPCore from "./CPCore";
var _ = CPCore._;
var $ = CPCore.$;

function SpectrumColor() {

}

SpectrumColor.tag = 'SpectrumColor'.toLowerCase();

SpectrumColor.render = function () {
    return _({
        class:'as-spectrum-color',
        child: {
            class:'as-spectrum-color-sat',
            child:'.as-spectrum-color-val'
        }
    });
};


CPCore.install('spectrumcolor', SpectrumColor);

export default SpectrumColor;