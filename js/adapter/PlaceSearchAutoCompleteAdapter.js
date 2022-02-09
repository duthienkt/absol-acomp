/***
 *
 * @param {PlaceSearchAutoCompleteInput} inputElt
 * @constructor
 */
function PlaceSearchAutoCompleteAdapter(inputElt) {
    this.inputElt = inputElt;
    this.service = new google.maps.places.AutocompleteService(this.inputElt.$service);
}


PlaceSearchAutoCompleteAdapter.prototype.queryItems = function (query, mInput) {
    var request = {
        input: query,
    };
    return new Promise(function (resolve) {
        this.service.getPlacePredictions(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            }
            else
                resolve([]);
        });
    }.bind(this));
};

PlaceSearchAutoCompleteAdapter.prototype.getItemText = function (item, mInput) {
    return item.description;
};

PlaceSearchAutoCompleteAdapter.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent, mInput) {
    return _({
        class: 'as-place-search-auto-complete-item',
        child: [
            {
                class: 'as-place-search-auto-complete-item-desc',
                child: { text: item.description }
            }
        ]
    })
};

export default PlaceSearchAutoCompleteAdapter;