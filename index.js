const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


mongoose.connect(process.env.MONGO_URL);

// Schema

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true},
  date: { type: String, required: false }
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

// Middleware

app.use(express.urlencoded({ extended: true }));

// Endpoints

// New User
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = new User({ username: username });
  newUser.save();
  res.json(newUser);
});

// Get list of users

app.get('/api/users', async (req, res) => {
  const userList = await User.find({});
  res.json(userList);
});

// New Exercise
app.post('/api/users/:_id/exercises', (req, res) => {

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
