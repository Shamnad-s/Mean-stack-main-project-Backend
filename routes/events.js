const express = require("express");
const router = express.Router();
const { Event } = require("../models/event");
const { Category } = require("../models/category.js");
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const eventList = await Event.find(filter).populate("category");

  if (!eventList) {
    res.status(500).json({ success: false });
  }
  res.send(eventList);
});

router.get(`/:id`, async (req, res) => {
  const event = await Event.findById(req.params.id).populate("category");

  if (!event) {
    res.status(500).json({ success: false });
  }
  res.send(event);
});

router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  let event = new Event({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  event = await event.save();

  if (!event) return res.status(500).send("The product cannot be created");

  res.send(event);
});
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Event Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!event) return res.status(500).send("the product cannot be updated!");

  res.send(event);
});

router.delete("/:id", (req, res) => {
  Event.findByIdAndRemove(req.params.id)
    .then((event) => {
      if (event) {
        return res
          .status(200)
          .json({ success: true, message: "the event is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "event not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
