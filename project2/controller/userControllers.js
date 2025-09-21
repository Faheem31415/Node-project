const Home = require("../models/home");
const User = require("../models/user");

exports.homepage = (req, res) => {
  res.render("home", {
    pagetitle: "Home",
    isLogin: req.isLogin,
    user: req.session.user,
  });
};

exports.bookingpage = (req, res) => {
  res.render("bookings", {
    pagetitle: "Bookings",
    isLogin: req.isLogin,
    user: req.session.user,
  });
};

exports.homeslistpage = (req, res) => {
  Home.find()
    .then((rows) => {
      res.render("homes-list", {
        pagetitle: "Homes-List",
        registeredhomes: rows,
        isLogin: req.isLogin,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.homedetailspage = (req, res) => {
  const homeid = req.params.homeid;
  Home.findById(homeid)
    .then((home) => {
      if (!home) {
        console.log("home not found id:", homeid);
        res.redirect("/");
      } else {
        res.render("homeDetails", {
          home: home,
          pagetitle: home.homename.toUpperCase(),
          isLogin: req.isLogin,
          user: req.session.user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postaddfavourite = async (req, res) => {
  const homeid = req.body.id;
  const userid = req.session.user._id;
  const user = await User.findById(userid);
  if (!user.favorites.includes(homeid)) {
    user.favorites.push(homeid);
    await user.save();
  }
  res.redirect("/user/homes-list");
};

exports.favouritepage = async (req, res) => {
  const userid = req.session.user._id;
  const user = await User.findById(userid).populate("favorites");
  res.render("favourites", {
    pagetitle: "Favourites",
    favouriteHomes: user.favorites,
    isLogin: req.isLogin,
    user: req.session.user,
  });
};

exports.removefavourites = async (req, res) => {
  const id = req.params.homeid;
  const userid = req.session.user._id;
  const user = await User.findById(userid);
  if (user.favorites.includes(id)) {
    user.favorites = user.favorites.filter((fav) => fav != id);
    await user.save();
  }
  res.redirect("/user/favourites");
};
