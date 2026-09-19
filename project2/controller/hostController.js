const Home = require("../models/home");
const { deleteFile, AWS_CONFIGURED } = require("../utilities/s3Uploader");

// ── Helper: extract the usable photo URL/path from req.file ───────────────
// When S3 is active, req.file.location is the public HTTPS URL.
// When falling back to local disk, req.file.path is the relative disk path.
const getPhotoUrl = (file) => {
  if (!file) return null;
  if (AWS_CONFIGURED && file.location) {
    return file.location; // full S3 HTTPS URL
  }
  // Normalize local path to always start with /uploads/ for consistent linking
  return "/" + file.path.replace(/\\/g, "/");
};

exports.registationpage = (req, res) => {
  res.render("edithosthome", {
    pagetitle: "Add-Home",
    editing: false,
    isLogin: req.isLogin,
    user: req.session.user,
  });
};

exports.edit_registationpage = (req, res, next) => {
  const homeid = req.params.homeid;
  const editing = req.query.editing === "true";
  Home.findById(homeid)
    .then((home) => {
      if (!home) {
        console.log("Home not found for editing:", homeid);
        return res.redirect("/host/added-home");
      }
      res.render("edithosthome", {
        pagetitle: "Edit-Home",
        editing: editing,
        home: home,
        isLogin: req.isLogin,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error("Error fetching home for edit:", err);
      next(err);
    });
};

exports.registeredpage = (req, res, next) => {
  const { homename, location, price, homescol } = req.body;

  if (!req.file) {
    return res.status(400).render("edithosthome", {
      pagetitle: "Add-Home",
      editing: false,
      isLogin: req.isLogin,
      user: req.session.user,
      error: "Please upload a photo.",
    });
  }

  if (!homename || !location || !price || !homescol) {
    return res.status(400).render("edithosthome", {
      pagetitle: "Add-Home",
      editing: false,
      isLogin: req.isLogin,
      user: req.session.user,
      error: "All fields are required.",
    });
  }

  const photo = getPhotoUrl(req.file);
  const home = new Home({ homename, location, price, photo, homescol });

  home
    .save()
    .then(() => {
      res.redirect("/host/added-home");
    })
    .catch((err) => {
      console.error("Error saving home:", err);
      next(err);
    });
};

exports.posteditpage = (req, res, next) => {
  const { homename, location, price, homescol, id } = req.body;
  Home.findById(id)
    .then(async (home) => {
      if (!home) {
        return res.status(404).redirect("/host/added-home");
      }
      home.homename = homename;
      home.price = price;
      home.location = location;
      home.homescol = homescol;

      if (req.file) {
        // Delete the old photo before replacing it
        await deleteFile(home.photo);
        home.photo = getPhotoUrl(req.file);
      }
      return home.save();
    })
    .then(() => {
      res.redirect("/host/added-home");
    })
    .catch((err) => {
      console.error("Error updating home:", err);
      next(err);
    });
};

exports.addedhomepage = (req, res, next) => {
  Home.find()
    .then((homes) => {
      res.render("added-home", {
        pagetitle: "Added-Homes",
        registeredhomes: homes,
        isLogin: req.isLogin,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error("Error fetching homes:", err);
      next(err);
    });
};

exports.postdeletehome = (req, res, next) => {
  const homeid = req.params.homeid;
  Home.findById(homeid)
    .then(async (home) => {
      if (home) {
        // Delete the photo from S3 / disk before removing the DB record
        await deleteFile(home.photo);
        await Home.findByIdAndDelete(homeid);
      }
      res.redirect("/host/added-home");
    })
    .catch((err) => {
      console.error("Error deleting home:", err);
      next(err);
    });
};
