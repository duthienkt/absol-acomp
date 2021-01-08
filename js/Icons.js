import ACore from "../ACore";
import SpinnerIcoText from '../assets/icon/spinner.tpl';
export  function SpinnerIco(){
    return ACore._(SpinnerIcoText);
}

SpinnerIco.tag = 'SpinnerIco'.toLowerCase();

ACore.install(SpinnerIco);