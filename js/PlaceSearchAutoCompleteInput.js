import ACore, { _ } from "../ACore";
import AutoCompleteInput from "./AutoCompleteInput";
import PlaceSearchAutoCompleteAdapter from "./adapter/PlaceSearchAutoCompleteAdapter";
import '../css/placesearchautocomplete.css'

/***
 * @extends AutoCompleteInput
 * @constructor
 */
function PlaceSearchAutoCompleteInput() {
    this.$service = _('.as-place-search-auto-complete-input-service');
    this.insertBefore(this.$service, null);
    this.adapter = new PlaceSearchAutoCompleteAdapter(this);
}

PlaceSearchAutoCompleteInput.tag = 'PlaceSearchAutoCompleteInput'.toLowerCase();
PlaceSearchAutoCompleteInput.render = function () {
    return _({
        tag: AutoCompleteInput.tag
    }, true);
}

ACore.install(PlaceSearchAutoCompleteInput);

export default PlaceSearchAutoCompleteInput;