const express = require("express");
const storeRouter = express.Router();

const homesController = require("../controller/hostController");

// added homes
storeRouter.get("/added-home", homesController.addedhomepage);

//after edithome page
storeRouter.post("/registered-home", homesController.registeredpage);

// to add home
storeRouter.get("/register-home", homesController.registationpage);



//after addhome registation
storeRouter.post("/edit-home", homesController.posteditpage);

//for home editing
storeRouter.get(
  "/added-home/edit-home/:homeid",
  homesController.edit_registationpage
);

//for delete
storeRouter.post("/delete-home/:homeid", homesController.postdeletehome);

module.exports = storeRouter;
