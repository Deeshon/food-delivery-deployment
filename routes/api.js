const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const fs = require('fs')
const User = require('../models/User')
const Category = require('../models/Category')
const Item = require("../models/Item")
const Cart = require("../models/Cart")
const router = express.Router()
const stripe = require('stripe')('sk_test_51NFJyuSBfUGouUODjmvNFh8CngEE0CYilk41wpTUNWMpn0mwquzvgh74DsfJKX4D0ovm65SQv4mBfkemAGkOGIbx00h67BFhAL')


const salt = bcrypt.genSaltSync(10)

// USER ROUTES //

// POST req for creating user
router.post('/user/signup' , async (req, res) => {
    const {username, password} = req.body
    const user = new User({
        username,
        password: bcrypt.hashSync(password, salt)
    })

    await user.save()
    res.json(user)
})


// POST req for signing in user
router.post('/user/signin', async (req, res) => {
    const {username, password} = req.body
    const user = await User.findOne({username: username})

    if (bcrypt.compareSync(password, user.password)) {
        jwt.sign({user}, 'secretkey', {}, (err, token) => {
            if (err) throw err
            res.cookie('token', token).send('ok')
        })
    } else {
        res.sendStatus(400)
    }
})

router.get('/user/profile', (req, res) => {
    const {token} = req.cookies
    if (token) {
        jwt.verify(token, 'secretkey', {}, (err, authData) => {
            if (err) throw err
            res.json(authData)
        })
    } else {
        res.json("ok")
    }


})

// POST req for logging user out
router.post('/user/logout', async (req, res) => {
    res.cookie('token', '').json('ok')
})


// CATEGORY ROUTES //

// POST req for creating category
router.post("/categories", async (req, res) => {
    const {title} = req.body
    const category = new Category({
        title
    })

    await category.save()
    res.json(category)
})


// GET req for category list
router.get("/categories", async (req, res) => {
    const categoryList = await Category.find()

    res.json(categoryList)
})

// POST req for filtering items by category
router.post("/category/items", async (req, res) => {
    const items = await Item.find({category: req.body.category})

    res.json(items)
})


// ITEM ROUTES //


// POST req for creating item
router.post("/items", upload.single('cover'), async (req, res) => {

    const {originalname, path} = req.file
    const ext = originalname.split('.')[1]
    const newPath = path + '.' + ext
    fs.renameSync(path, newPath)

    const item = new Item({
        title: req.body.title,
        subTitle: req.body.subTitle,
        price: req.body.price,
        cover: newPath,
        category: req.body.category
    })

    await item.save()

    res.sendStatus(200)
})

// GET req for item list
router.get('/items', async (req, res) => {
    const itemList = await Item.find().populate('category')

    res.json(itemList)
})


// ROUTES FOR CART //

// POST req for adding items to cart
router.post("/cart/item", async (req, res) => {
    const cartItem = new Cart({
        item: req.body.item
    })

    await cartItem.save()

    res.json(cartItem)
})

// GET req for cart items
router.get("/cart", async (req, res) => {
    const cartItems = await Cart.find().populate("item")

    res.json(cartItems)
})

// DELETE req to clear cart
router.delete("/cart", async (req, res) => {
    await Cart.deleteMany({})
    res.json('ok')
})

// ROUTE FOR STRIPE PAYMENT //
router.post('/create-checkout-session', async (req, res) => {
    const line_items = req.body.data.cart.map((item) => {
        return{
            price_data: {
                currency: 'usd',
                product_data: {
                  name: item.item.title
                },
                unit_amount: item.item.price * 100
              },
              quantity: 1,
        }
    })
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/success',
    });
  
    res.send({url: session.url});
  });


module.exports = router