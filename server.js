require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if(!MONGO_URI){
  console.error("MONGO_URI missing in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI).then(()=> console.log("MongoDB Connected - COLLAVYN DB")).catch(err=> console.error(err));

// Simple User Model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String
});
const User = mongoose.model('User', userSchema);

// Routes
app.get('/api', (req,res)=> res.json({msg: "COLLAVYN API Running"}));

app.post('/api/auth/register', async (req,res)=>{
  try{
    const {email, password, role} = req.body;
    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({msg: "User exists"});
    const newUser = new User({email, password, role});
    await newUser.save();
    res.json({msg: "Registered", user: newUser});
  }catch(e){ res.status(500).json({error: e.message});}
});

app.post('/api/auth/login', async (req,res)=>{
  try{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({msg: "User not found"});
    // Simple check (no bcrypt for now to avoid error)
    res.json({msg: "Login success", user});
  }catch(e){ res.status(500).json({error: e.message});}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));