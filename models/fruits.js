const mongoose = require('../connect_mongo');
const mschema = require('mongoose').Schema;

const FruitSchema = new mschema({
    name: String,
    price: Number,
    fresh_till: Date
});

const Fruit = mongoose.model("Fruit", FruitSchema);

module.exports = {
    FruitSchema,
    Fruit,
};