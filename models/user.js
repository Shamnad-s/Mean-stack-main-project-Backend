const mongoose = require("mongoose");

const userShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userShema.virtual("id").get(function () {
  return this._id.toHexString();
});

userShema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userShema);
exports.userSchema = userShema;
