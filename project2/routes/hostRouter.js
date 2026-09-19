const express = require("express");
const storeRouter = express.Router();

const homesController = require("../controller/hostController");
const { upload } = require("../utilities/s3Uploader");

// added homes
storeRouter.get("/added-home", homesController.addedhomepage);

//after edithome page — multipart upload middleware applied here only
storeRouter.post(
  "/registered-home",
  upload.single("photo"),
  homesController.registeredpage
);

// to add home
storeRouter.get("/register-home", homesController.registationpage);

//after addhome registration — multipart upload middleware applied here only
storeRouter.post("/edit-home", upload.single("photo"), homesController.posteditpage);

//for home editing
storeRouter.get(
  "/added-home/edit-home/:homeid",
  homesController.edit_registationpage
);

//for delete
storeRouter.post("/delete-home/:homeid", homesController.postdeletehome);

module.exports = storeRouter;
