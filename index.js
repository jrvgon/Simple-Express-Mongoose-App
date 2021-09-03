const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')

const Product = require('./models/product')
const categories = ['fruit', 'vegetable', 'dairy']

mongoose
	.connect('mongodb://localhost:27017/farmStand', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('Mongo Connection Open!!')
	})
	.catch((err) => {
		console.log('Oh No Mongo Connection Error!!')
		console.log(err)
	})

// All middleware.
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Product list.
app.get('/products', async (req, res) => {
	const { category } = req.query
	if (category) {
		const products = await Product.find({ category })
		res.render('products/index', { products, category })
	} else {
		const products = await Product.find({})
		res.render('products/index', { products, category: 'All' })
	}
})

// Form for creating a product.
app.get('/products/new', (req, res) => {
	res.render('products/new', { categories })
})

// Update page to which the new product form is submitted.
app.post('/products', async (req, res) => {
	const newProduct = new Product(req.body)
	await newProduct.save()
	res.redirect(`/products/${newProduct._id}`)
})

// Show details about product found by _id.
app.get('/products/:id', async (req, res) => {
	const { id } = req.params
	const product = await Product.findById(id)
	res.render('products/show', { product })
})

// Update a product endpoint.
app.put('/products/:id', async (req, res) => {
	const { id } = req.params
	const product = await Product.findByIdAndUpdate(id, req.body, {
		runValidators: true,
		new: true,
	})
	const newProduct = Product.findById(id)
	res.redirect(`/products/${product._id}`)
})

// Edit a product.
app.get('/products/:id/edit', async (req, res) => {
	const { id } = req.params
	const product = await Product.findById(id)
	res.render('products/edit', { product, categories })
})

// Delete a product.
app.delete('/products/:id', async (req, res) => {
	const { id } = req.params
	const deletedProduct = await Product.findByIdAndDelete(id)
	res.redirect('/products')
})

// Local port to start a server
app.listen(3000, () => {
	console.log('Listening on port 3000')
})
