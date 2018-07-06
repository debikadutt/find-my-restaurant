// import package
const csvFile = require('convert-csv-to-json');
const fs = require('fs');
// import file containing datasets
const restaurants_list = require("./dataset/restaurants_list.json");
// generate Array of Object in JSON format 
const restaurant_info = csvFile.getJsonFromCsv("./dataset/restaurants_info.csv");

// create an object containing the data for restaurant
const restaurant_data  = {};
// create a map of objectID as keys and the information as values of the object
restaurant_info.forEach((item) => restaurant_data[item.objectID] = item);

/**
 * Normalize the restaurant data
 * 
 * @param {array} restaurants_list
 * @param {object} restaurant_data
 * @returns {array} 
 */
const normalizeRestaurantData = (restaurants_list, restaurant_data) => {
  // Retrieve relevant information to be written to file
  restaurants_list.forEach((restaurant) => {
    let restaurantObj = restaurant_data[restaurant.objectID];
    restaurant['food_type'] = restaurantObj.food_type;
    restaurant['stars_count'] = restaurantObj.stars_count;
    restaurant['reviews_count'] = restaurantObj.reviews_count;
    restaurant['neighborhood'] = restaurantObj.neighborhood;
    restaurant['phone_number'] = restaurantObj.phone_number;
    restaurant['price_range'] = restaurantObj.price_range;
    restaurant['dining_style'] = restaurantObj.dining_style;
  })
  return restaurants_list;
}

//write master data to json file after normalizing
fs.writeFile("dataset/master_restaurant_data.json",
  JSON.stringify(normalizeRestaurantData(restaurants_list, restaurant_data), null, 2));

