
const express = require("express");
const registeredrouter = express.Router();
const {gotoRegistered} = require("../controllers/homes");

registeredrouter.get("/registered-persons", gotoRegistered);


exports.registeredrouter = registeredrouter;
