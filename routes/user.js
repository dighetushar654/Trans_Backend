const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
      
        if(userRegister) {
          res.status(200).json({message: "User registerd succesfully..."});
        } else {
          res.status(500).json({error: "Failed to register"})
        }
  
    } catch(err) {
      console.log(err);
    }
  });

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
          
          const token = await userLogin.genrateAuthToken();

          res.cookie("jwttoken", token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly:true
          });
          console.log(token);

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

  module.exports = router; 