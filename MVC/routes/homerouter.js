const express = require("express");
const homerouter = express.Router();
const { gotoHome } = require("../controllers/homes");

homerouter.get("/", gotoHome);

module.exports = homerouter;
