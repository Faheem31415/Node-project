const Home = require("../models/home");
const User = require("../models/user");

exports.homepage = (req, res) => {
  res.render("home", {
    pagetitle: "Home",
    isLogin: req.isLogin,
    user: req.session.user || null,
  });
};

exports.bookingpage = (req, res) => {
  res.render("bookings", {
    pagetitle: "Bookings",
    isLogin: req.isLogin,
    user: req.session.user || null,
  });
};

exports.homeslistpage = (req, res, next) => {
  Home.find()
    .then((rows) => {
      res.render("homes-list", {
        pagetitle: "Homes-List",
        registeredhomes: rows,
        isLogin: req.isLogin,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      console.error("Error fetching homes list:", err);
      next(err);
    });
};

exports.homedetailspage = (req, res, next) => {
  const homeid = req.params.homeid;
  Home.findById(homeid)
    .then((home) => {
      if (!home) {
        console.log("Home not found, id:", homeid);
        return res.redirect("/user/homes-list");
      }
      res.render("homeDetails", {
        home: home,
        pagetitle: home.homename.toUpperCase(),
        isLogin: req.isLogin,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      console.error("Error fetching home details:", err);
      next(err);
    });
};

exports.postaddfavourite = async (req, res, next) => {
  const homeid = req.body.id;
  const userid = req.session.user._id;
  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.redirect("/login");
    }
    // Use .toString() comparison to avoid ObjectId reference issues
    const alreadyFavourited = user.favorites.some(
      (fav) => fav.toString() === homeid
    );
    if (!alreadyFavourited) {
      user.favorites.push(homeid);
      await user.save();
    }
    res.redirect("/user/homes-list");
  } catch (err) {
    console.error("Error adding favourite:", err);
    next(err);
  }
};

exports.favouritepage = async (req, res, next) => {
  const userid = req.session.user._id;
  try {
    const user = await User.findById(userid).populate("favorites");
    if (!user) {
      return res.redirect("/login");
    }
    res.render("favourites", {
      pagetitle: "Favourites",
      favouriteHomes: user.favorites,
      isLogin: req.isLogin,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    next(err);
  }
};

exports.removefavourites = async (req, res, next) => {
  const id = req.params.homeid;
  const userid = req.session.user._id;
  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.redirect("/login");
    }
    user.favorites = user.favorites.filter((fav) => fav.toString() !== id);
    await user.save();
    res.redirect("/user/favourites");
  } catch (err) {
    console.error("Error removing favourite:", err);
    next(err);
  }
};
