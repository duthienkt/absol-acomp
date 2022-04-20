import ACore from "../ACore";
import SpinnerIcoText from '../assets/icon/spinner.tpl';
import MdiStoreMarkerOutlineText from '../assets/icon/mdi_store_marker_outline.tpl';
import '../css/icons.css';

export function SpinnerIco() {
    return ACore._(SpinnerIcoText);
}

SpinnerIco.tag = 'SpinnerIco'.toLowerCase();

ACore.install(SpinnerIco);

export function MdiStoreMarkerOutline() {
    return ACore._(MdiStoreMarkerOutlineText);
}

MdiStoreMarkerOutline.tag = 'mdi-store-marker-outline';

ACore.install(MdiStoreMarkerOutline);
