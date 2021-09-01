const mongoose = require("mongoose");
const router = require("express").Router();

const User = require("../models/userModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var jwtAuth = (req, res, next) => {
  var token = req.headers.authorization;
  token = token.split("  ")[1];
  jwt.verify(token, process.env.SECRET_KEY, function(err, decoded){
    if(err){
      res.status(401).json("invalid tokken")
    }else{
      next();
    }

  })
}


router.post("/", async (req, res) => {

    const { name, password, email, no} = req.body;
    if ( !name || !password || !email || !no ) {
      return res.status(422).json({error:"filled all the fields"});
    }

    try {
        const userExist = await User.findOne({ email:email })
   
        if(userExist) {
          return res.status(422).json({error:"Email already exist"});
        }
          
        const newuser = new User({ name, password, email, no});

        const userRegister = await newuser.save();
        const myToken = await newuser.genrateAuthToken();

      
        if(userRegister) {
          res.status(200).json({message: "User registerd succesfully..."});
        } else {
          res.status(500).json({error: "Failed to register"})
        }
  
    } catch(err) {
      console.log(err);
    }
  });

  router.patch("/updateUser", async (req, res) => {
    const {name, email, details, no,} = req.body;
    try {
      const userExist = await User.findOne({ email:email })
      // console.log(userExist);
 
      if(userExist) {
        const key = userExist._id;
        // console.log(key);
         const updateuser = new User({ name, email, details, no});
        User.findByIdAndUpdate(key, {name: req.body.name,
        email: req.body.email,  details: req.body.details, no: req.body.no}).then(() => 
        {res.status(200).json({message: "User Update succesfully..."});
        })
      }
    }
    catch(err) {
    }
  })

  router.get("/", async (req, res) => {
    try {
      const data = await User.find();
      res.status(200).json(data);
  } catch (err) {
      res.status(500).json(err);
  }
  })

  router.get("/:id", async (req, res) => {
    try {
        const data = await User.findById(req.params.id);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
  });

router.post("/signin", async (req,res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
          res.status(400).json({error:"Plz fill the data"});
        }

        const userLogin = await User.findOne({email: email});
        // console.log(userLogin);

        if (userLogin) {

          const isMatch = await bcrypt.compare(password, userLogin.password);

          if (!isMatch) {
              res.status(400).json({error:"Invalid Password"});
          } else {
              res.status(200).json({message:"User Signin Successfully.."})
          }
        } else {
              res.status(400).json({error:"Invalid Creditials"});
        }
        
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

  await User.findByIdAndRemove(id);

  res.json({ message: "Post deleted successfully." });
});

  module.exports = router; 