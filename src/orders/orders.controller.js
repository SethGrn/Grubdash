const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists (req, res, next) {
    const orderId = req.params.orderId

    const findOrder = orders.find((order) => order.id === orderId)

    if(findOrder) {
        res.locals.order = findOrder
        next()
    } else {
        next({
            status: 404,
            message: `Cannot find order with id ${orderId}`
        })
    }
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

function validateDishes(req, res, next) {
    const { data: { dishes } = [] } = req.body
    
    if(!dishes) {
      next ({
            status: 400,
            message: "Order must include a dish"
        })
    }

    if (Array.isArray(dishes) && dishes.length !== 0) {
        return next()
    } else {
        next ({
            status: 400,
            message: "Order must include at least one dish"
        })
    }
}

function validateQuantity (req, res, next) {
    const { data: { dishes } = {} } = req.body;
  
    dishes.forEach((dish, index) => {
      const { quantity } = dish
      if(!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
          return next ({
              status: 400,
              message: `Dish ${index} must have a quantity that is an integer greater than 0`
          })
      }
    })
  
  next()
}

function orderIdMatchesRouteId (req, res, next) {
    const { data: { id } = {} } = req.body
    const orderId = req.params.orderId

    if(id) {
        if(id === orderId) {
            return next()
        } else {
            next({
                status: 400,
                message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
            })
        }
    } else {
        next()
    }
}

function validateStatus (req, res, next) {
    const { data: { status } = {} } = req.body;

    if(status === "delivered") {
        return next ({
            status: 400,
            message: "A delivered order cannot be changed"
        })
    }

    if(status === "pending" || status === "preparing" || status === "out-for-delivery") {
      return next()
    } else {
      return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }
}

function statusIsPending(req, res, next) {
    const orderId = req.params.orderId
    
    const order = orders.find((order) => order.id === orderId)

    if(order.status === "pending") {
        return next()
    } else {
        next({
            status: 400,
            message: "An order cannot be deleted unless it is pending."
        })
    }
}

function create (req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newId = nextId();

    const newOrder = {
        id: newId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }

    orders.push(newOrder)

    res.status(201).json({ data: newOrder })
}

function read (req, res, next) {
    const orderId = req.params.orderId

    const findOrder = orders.find((order) => order.id === orderId)

    if(findOrder) {
        res.status(200).json({ data: findOrder })
    } else {
        next({
            status: 404,
            message: `Could not find order with id ${orderId}`
        })
    }
}

function update (req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const orderId = req.params.orderId

    const findOrder = orders.find((order) => order.id === orderId)
    
    findOrder.id = orderId
    findOrder.deliverTo = deliverTo
    findOrder.mobileNumber = mobileNumber
    findOrder.status = status
    findOrder.dishes = dishes

    res.status(200).json({ data: findOrder })
}

function destroy (req, res, next) {
    const orderId = res.locals.order.id

    const index = orders.findIndex((order) => order.id === orderId)

    orders.splice(index, 1);

    res.sendStatus(204)
}

function list (req, res, next) {
    res.status(200).json({ data: orders})
}



module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        validateDishes,
        validateQuantity,
        create,
    ],
    read,
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        validateDishes,
        validateQuantity,
        orderIdMatchesRouteId,
        validateStatus,
        update,
    ],
    delete: [orderExists, statusIsPending, destroy],
    list,
}