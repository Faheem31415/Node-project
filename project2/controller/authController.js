const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pagetitle: "Login",
    isLogin: false,
    oldInput: { email: "", password: "" },
    errors: [],
    user: null,
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).render("auth/login", {
        pagetitle: "Login",
        isLogin: false,
        errors: ["Invalid email or password"],
        oldInput: { email, password },
        user: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pagetitle: "Login",
        isLogin: false,
        errors: ["Invalid email or password"],
        oldInput: { email, password },
        user: null,
      });
    }

    req.session.isLogin = true;
    req.session.user = user;
    await req.session.save();
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    pagetitle: "SignUp",
    errors: [],
    oldInput: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      UserType: "",
      terms: false,
    },
    isLogin: false,
    user: null,
  });
};

exports.postSignup = [
  check("firstname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastname")
    .trim()
    .notEmpty()
    .withMessage("Last Name is required")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

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

  async (req, res, next) => {
    const { firstname, lastname, password, UserType, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pagetitle: "SignUp",
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstname, lastname, password, UserType, email },
        isLogin: false,
        user: null,
      });
    }

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(422).render("auth/signup", {
          pagetitle: "SignUp",
          errors: ["An account with this email already exists."],
          oldInput: { firstname, lastname, password, UserType, email },
          isLogin: false,
          user: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        UserType,
      });
      await user.save();
      res.redirect("/login");
    } catch (err) {
      console.error("Signup error:", err);
      next(err);
    }
  },
];
