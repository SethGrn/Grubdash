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

function dishExists (req, res, next) {
    const dishId = req.params.dishId

    const findDish = dishes.find((dish => dish.id === dishId))

    if(findDish) {
        res.locals.dish = findDish
        next()
    } else {
        next({
            status: 404,
            message: `No dish was found with id ${dishId}`
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



module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        create
    ],
    list,
    read: [dishExists, read],
}