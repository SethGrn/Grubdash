const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list (req, res, next) {
    res.status(200).json({ data: dishes })
}

function bodyDataHas (propertyName) {
    return function (req, res, next) {
        const hasProperty = req.body.data[propertyName];
        if(hasProperty) {
            next()
        } else {
            next({
                status: 400,
                message: `Dish must include a ${propertyName}`
            })
        }
    }
}

function validatePrice (req, res, next) {
    const { data: { price } = {} } = req.body

    if(Number.isInteger(price) && price > 0) {
        next()
    } else {
        next ({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
}

function dishExists (req, res, next) {
    const dishId = req.params.dishId

    const findDish = dishes.find((dish => dish.id === dishId))

    if(findDish) {
        res.locals.dish = findDish
        next()
    } else {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}.`
        })
    }
}

function bodyIdMatchesRouteId (req, res, next) {
    const { data: { id } = {} } = req.body;
    if (!id) return next()
    const dishId = req.params.dishId;
    if (id === dishId) {
        return next()
    } else {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }


}

function create (req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body

    const newId = nextId();

    newDish = {
        newId,
        name,
        description,
        price,
        image_url,
    }

    dishes.push(newDish)

    res.status(201).json({ data: newDish });
}

function read (req, res, next) {
    const dish = res.locals.dish

    res.status(200).json({ data: dish })
}

function update (req, res, next) {

}



module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validatePrice,
        create
    ],
    read: [dishExists, read],
    update: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validatePrice,
        dishExists,
        bodyIdMatchesRouteId,
        update
    ],
    list,
}