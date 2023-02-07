const express = require('express');
const router = express.Router();
const { Event } = require('../models/event');
const { Category } = require('../models/category.js');
const mongoose = require('mongoose');
const multer = require('multer');
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const eventList = await Event.find(filter).populate('category');

    if (!eventList) {
        res.status(500).json({ success: false });
    }
    res.send(eventList);
});

router.get(`/:id`, async (req, res) => {
    const event = await Event.findById(req.params.id).populate('category');

    if (!event) {
        res.status(500).json({ success: false });
    }
    res.send(event);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const categoryId = mongoose.Types.ObjectId(req.body.category);
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).send('Invalid Category');
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let event = new Event({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    event = await event.save();

    if (!event) return res.status(500).send('The product cannot be created');

    res.send(event);
});
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Event Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = event.image;
    }

    const eventList = await Event.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: category.id,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!eventList) return res.status(500).send('the product cannot be updated!');

    res.send(eventList);
});

router.delete('/:id', (req, res) => {
    Event.findByIdAndRemove(req.params.id)
        .then((event) => {
            if (event) {
                return res.status(200).json({ success: true, message: 'the event is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'event not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
