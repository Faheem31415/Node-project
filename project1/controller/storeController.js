const Home = require("../models/home");
exports.homepage = (req, res) => {
  res.render("home", { pagetitle: "Home" });
};

exports.registationpage = (req, res) => {
  res.render("register", { pagetitle: "Register" });
};

exports.registeredpage = (req, res) => {
  const name = req.body.name;
  const location = req.body.location;
  const price = req.body.price;
  const image = req.body.image;
  const home = new Home(name, location, price, image);

  function show() {
    res.render("registered", { pagetitle: "Registered" });
  }

  home.save(() => {
    show();
  });
};

exports.addedhomepage = (req, res) => {
  
  function show_(homes) {
    res.render("added-home", {
      pagetitle: "Added-Homes",
      homes: homes});
  }

  Home.fetchAll((homes) => {
    show_(homes);
  });
};

exports.homedetailspage=(req,res)=>{
  const homeid=req.params.homeid; 
  Home.findById(homeid,home=>{
    if(!home){
      res.redirect("/");
    }
    else{
      res.render('homeDetails',{home:home,pagetitle:"Home Details"});
    }
   
  });
  
}