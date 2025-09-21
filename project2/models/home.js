const mongoose = require('mongoose');

const homeSchema=mongoose.Schema({
  homename:{type:String,required:true},
  location:{type:String,required:true},
  price:{type:Number,required:true},
  photo:String,
  homescol:String
});


module.exports=mongoose.model('Home',homeSchema);


