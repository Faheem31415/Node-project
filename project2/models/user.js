const mongoose = require('mongoose');
const userSchema=mongoose.Schema({
  firstname:{
    type:String,
    required:[true,"firstname is required"],
  },
  lastname:{
    type:String,
    required:[true,"lastname is required"],
    unique:true,
  },
  email:{
    type:String,
    required:[true,"email is required"],
    unique:true,
   
  },
  password:{
    type:String,
    required:[true,"password is required"],
  },
  UserType:{
    type:String,
    enum:['guest','host'],
    default:'guest',
  },
  favorites:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Home',
  }],
});

module.exports=mongoose.model('User',userSchema);


