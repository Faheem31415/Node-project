const express=require('express');
const subrouter=express.Router();

const {submitDetails}=require('../controllers/homes.js');


subrouter.post('/submit-details',submitDetails );
exports.subrouter=subrouter;

