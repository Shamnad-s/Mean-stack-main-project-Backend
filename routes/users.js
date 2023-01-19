const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
router.get(`/`, async (req, res) => {
  const userList = await User.find();
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(500).json({
        title: "An error occurred",
        error: err,
      });
    }
    if (user) {
      return res.status(409).json({
        title: "Email already exists",
        error: { message: "A user with this email already exists" },
      });
    }
    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      password: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      city: req.body.city,
      country: req.body.country,
    });
    newUser.save((err, result) => {
      if (err) {
        return res.status(500).json({
          title: "An error occurred",
          error: err,
        });
      }
      res.status(201).json({
        message: "User created",
        obj: result,
      });
    });
  });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send("The user not found");
  }
  console.log(user.password);
  console.log(req.body.password);

  if (
    user &&
    bcrypt.compareSync(req.body.password, user.password, (err, res) => {
      if (err) {
        console.log(err);
      }
    })
  ) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      "secret",
      { expiresIn: "1d" }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong!");
  }
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    city: req.body.city,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

router.put("/:id", async (req, res) => {
  const userExist = await User.findById(req.params.id);

  if (req.body.password) {
    let newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.password;
  }
  console.log(newPassword);
  console.log(req.body.password);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      password: newPassword || userExist.password,
      phone: req.body.phone,
      city: req.body.city,
      country: req.body.country,
      isAdmin: req.body.isAdmin,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res.status(404).json({
          success: false,
          message: "user not found!",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

module.exports = router;
