import ACore, { _ , $} from "../../ACore";
import '../../css/spectrumcolor.css';

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


ACore.install('spectrumcolor', SpectrumColor);

export default SpectrumColor;