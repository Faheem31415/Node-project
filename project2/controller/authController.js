const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");


exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pagetitle: "Login",
    isLogin: false,
    oldInput: {email: "", password: ""}, // <-- provide default empty fields
    errors: [], // <-- provide default empty array
    user: {}
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user=await User.findOne({email:email});
  if (!user) {
    return res.status(422).render("auth/login", {
      pagetitle: "Login",
      isLogin: false,
      errors: ["Invalid email or password"],
      oldInput: { email, password },
      user: req.session.user,
    });
  }
  const isMatch=await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pagetitle: "Login",
      isLogin: false,
      errors: ["Invalid password"],
      oldInput: { email },
      user: req.session.user,
    });
  } 

  req.session.isLogin = true;
  req.session.user = user;
  await req.session.save();
  res.redirect("/");
};



exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

// In authController.js
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pagetitle: "SignUp",
    errors: [], // <-- provide default empty array
    oldInput: {
      // <-- provide default empty fields
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      UserType: "",
      terms: false,
    },
    isLogin: false,
    user:{}
  });
};

exports.postSignup = [
  check("firstname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastname") // ✅ Fix typo: was 'latname'
    .trim()
    .notEmpty()
    .withMessage("Last Name is required")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(), // ✅ Fix typo: was 'normallizeEmail'

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("UserType")
    .isIn(["guest", "host"])
    .withMessage("Please select a valid user type"),

  check("terms")
    .equals("on")
    .withMessage("You must agree to the terms and conditions"),

  (req, res, next) => {
    const { firstname, lastname, password, UserType, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // You can render the form again with error messages here
      return res.status(422).render("auth/signup", {
        pagetitle: "SignUp",
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstname, lastname, password, UserType, email },
        isLogin: false,
        user:{}
      });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstname,
          lastname,
          email,
          password: hashedPassword,
          UserType,
        });
        return user.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).render("auth/signup", {
          pagetitle: "SignUp",
          errors: ["An error occurred while signing up."],
          oldInput: { firstname, lastname, password, UserType },
          isLogin: false,
          user: {}
        });
      });
  },
];
