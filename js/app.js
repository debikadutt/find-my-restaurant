/**
 *  Search app for restaurants
 *
 *  Author: Debika Dutt debikadutt@gmail.com
 *  Date:   7/3/2018
 */

/* Configure the algoliaSearch and algoliasearchHelper with API ID and API Key */
const appID = '4Z7088AFXM';
const apiKey = 'b618b764a571af507905bb18488a0fa9';
const index = 'restaurant_data';
const client = algoliasearch(appID, apiKey);
const helper = algoliasearchHelper(client, index, {
  facets: ['food_type', 'payment_options']
});

/* Call the methods to be rendered on the page */
helper.on('result', function(result) {
    renderFacetList(result);
    displayResults(result);
    displayPaymentOptions(result);
    displayProcessingDetails(result);
});

/**
 * Display the results on search
 * 
 * @param {object} result
 */
const displayResults = (result) => {
    let html = '';
    html += (displayProcessingDetails(result));
    result.hits.forEach((hit) => {
        html += "<div class='result' id='result'>";
		html += "<div><img class='rest-logo' src=\' " + hit.image_url+  "\'></div>"
		html += "<div class=result-content>"
		html += "<h2 class='text-left'>"+ "<a href=" + hit.mobile_reserve_url + " target='_blank'>" + hit.name +"</a></h2>"
		html += "<span class='h4 info-text'>" + "<span class='info-stars'>" + hit.stars_count + "</span>" + "<span class='info-stars'>" + displayRating(hit.stars_count) +"</span>"
		html += " ("+ hit.reviews_count + " Reviews) </span>"
		html += "<div class='info-text'>"
		html += "<h4 class='d-flex'>" + hit.food_type + " | "
		html +=  hit.neighborhood + " | "
        html +=  hit.price_range + "</h4> </div> </div> </div>"
    });
    document.getElementById("search-results").innerHTML =  html;
}

/**
 * Display customer rating/reviews
 * 
 * @param {Number} count
 * @returns {string} 
 */
const displayRating = (count) => {
    let html = '';
    if (count > 0) {
        for (let i = 0; i < count; i++) {
            html += "<span><img class='result-reviews' src='./graphics/stars-plain.png' /></span>" 
        }
    } else if (count < 1) {
        for (let i = 0; i < 5; i++) {
            html += "<span><img class='result-reviews' src='./graphics/star-empty.png' /></span>" 
        }
    }
    return html;
}

/**
 * Render the food type list
 * 
 * @param {object} result
 * @returns {string} 
 */
const renderFacetList = (result) => {
    $('#facet-list').html(function() {
        //console.log('hey', content.getFacetValues('food_type'));
        let arr = [];
        let counts = {};
        let uniqueItems = [];
        result.hits.map((hit) => {
            arr.push(hit.food_type);
            /* count the number of food types available */
            for (let i = 0; i < arr.length; i++) {
                counts[arr[i]] = 1 + (counts[arr[i]] || 0);
            }
            uniqueItems = [...new Set(arr)];
            return uniqueItems;
        });
        return $.map(uniqueItems.slice(0,5), function(facet) {
            let label = $('<label class="food-type-title">').html(facet 
                + ' <span class="food-type-count"> (' + counts[facet] + ')</span>')
                .attr('for', 'fl-' + facet);
            return $('<li data-facet="'+facet+'" id="fl-'+facet+'">').append(label);
        });
    });
}

/**
 * Refine according to food type
 */
$('#facet-list').on('click', 'li', function(e) {
    let facetValue = $(this).data('facet');
    //console.log('e',facetValue);
    helper.toggleFacetRefinement ('food_type', facetValue).search();
});

/**
 * Display payment options
 * 
 * @param {object} result
 * @returns {string} 
 */
const displayPaymentOptions = (result) => {
    $('#payment-list').html(function() {
        let arr = [];
        let counts = {};
        let uniqueItems = [];
        result.hits.map((hit) => {
            arr.push(...hit.payment_options);
            // count the number of payment types available
            for (let i = 0; i < arr.length; i++) {
                counts[arr[i]] = 1 + (counts[arr[i]] || 0);
            }
            // account for only the valid card options
            const validCard = (value) => (value === 'AMEX' || value === 'MasterCard' || value === 'Visa' || value === 'Discover');
            uniqueItems = [...new Set(arr)].filter(validCard);

            return uniqueItems;
        });
        return $.map(uniqueItems, function(facet) {
            let label = $('<label class="payment-type-title">').html(facet 
                + ' <span class="payment-type-count"> (' + counts[facet] + ')</span>')
                .attr('for', 'fl-' + facet);
            return $('<li data-facet="'+facet+'" id="fl-'+facet+'">').append(label);
        });
    });
}


/*Refine according to payment options type*/
$('#payment-list').on('click', 'li', function(e) {
    let facetValue = $(this).data('facet');
    //console.log('e',facetValue);
    helper.toggleFacetRefinement ('payment_options', facetValue).search();
});

/**
 * Display the processing result statistics
 * 
 * @param {object} result
 * @returns {string}
 */
const displayProcessingDetails = (result) => {
    let html = '';
    html += "<span id='result-stats'>";
    html += "<span id='result-hits'><strong>" + result.nbHits+  " results found </strong></span>";
    let time = (result.processingTimeMS/1000);
    html += "<span id='result-time'>in " + time +  " seconds</span>";
    html +=  "</span>"
    return  html;
}

let user_location;
let isLocationSet = false;
/**
 * Get User's location
 */
const getUserLocation = () => {
    if (navigator.geolocation) {
    	isLocationSet = true;
        navigator.geolocation.getCurrentPosition(getCoordinates);
    } else {
    	isLocationSet = false;
    }
}

/**
 * Get user's latitude and longitude coords
 * 
 * @param {object} position
 */
const getCoordinates = (position) => (
    user_location = position.coords.latitude + ", " + position.coords.longitude
);

/* Start searching on user input*/
$('#search-input').on('keyup', function() {
  helper.setQuery($(this).val()).search();
  isLocationSet ? 
    helper.setQueryParameter('aroundLatLng', user_location).search() :
    helper.setQueryParameter('aroundLatLngViaIP', 'true').search();
});
// leverage the user's location to show results closer to them if location is not permitted
isLocationSet ? 
helper.setQueryParameter('aroundLatLng', user_location).search() : 
helper.setQueryParameter('aroundLatLngViaIP', 'true').search();
