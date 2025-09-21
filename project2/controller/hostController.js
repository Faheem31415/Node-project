const Home = require("../models/home");
const user = require("../models/user");

exports.registationpage = (req, res) => {
  res.render("edithosthome", {
    pagetitle: "Add-Home",
    editing: false,
    isLogin: req.isLogin,
    user: req.session.user,
  });
};

exports.edit_registationpage = (req, res) => {
  const homeid = req.params.homeid;
  const editing = req.query.editing === "true";
  Home.findById(homeid).then((home) => {
    if (!home) {
      console.log("Home not found for editing");
      return res.redirect("/host/added-home");
    } else {
      res.render("edithosthome", {
        pagetitle: "Edit-Home",
        editing: editing,
        home: home,
        isLogin: req.isLogin,
        user: req.session.user,
      });
    }
  });
};

exports.registeredpage = (req, res) => {
  const { homename, location, price, homescol } = req.body;

  if(!req.file){
    return res.status(400).send("No file uploaded");
  }

  const photo = req.file.path;
  if (homename && location && price  && homescol) {
    const home = new Home({ homename, location, price, photo, homescol });

    home
      .save()
      .then(() => {
        res.redirect("/host/added-home");
      })
      .catch((err) => {
        console.error("Error saving home:", err);
      });
  } else {
    res.status(500).send("Fields should not be empty");
    console.log("Error");
  }
};

exports.posteditpage = (req, res) => {
  const { homename, location, price, homescol, id } = req.body;
  Home.findById(id)
    .then((home) => {
      home.homename = homename;
      home.price = price;
      home.location = location;
      home.homescol = homescol;
      if(req.file) {
        home.photo = req.file.path;
      }

      home
        .save()
        .then(() => {
          res.redirect("/host/added-home");
        })
        .catch((err) => {
          console.error("Error saving home:", err);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((err) => {
      console.error("Error saving home:", err);
    });
};

exports.addedhomepage = (req, res) => {
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
      console.log(err);
    });
};

exports.postdeletehome = (req, res) => {
  const homeid = req.params.homeid;

  Home.findByIdAndDelete(homeid)
    .then(() => {
      res.redirect("/host/added-home");
    })
    .catch((err) => {
      console.error("Error deleting home:", err);
      res.status(500).send("Failed to delete home.");
    });
};
