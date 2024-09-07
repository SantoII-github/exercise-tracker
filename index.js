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
  date: { type: Date, required: true },
  _user_id: { type: String, required: true }
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
app.post('/api/users/:_id/exercises', async (req, res) => {
  const description = req.body.description;
  const duration = +req.body.duration;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const _id = req.params._id;

  const user = await User.findOne({ _id: _id });

  const newExercise = new Exercise({
    username: user.username,
    description: description,
    duration: duration,
    date: date,
    _user_id: _id
  })

  newExercise.save();

  res.json({
    username: user.username,
    description: description,
    duration: duration,
    date: date.toDateString(),
    _id: _id
  })
});

// Logs Endpoint
app.get('/api/users/:_id/logs', async (req, res) => {
  const _id = req.params._id;
  const fromDate = new Date(req.query.from);
  const toDate = new Date(req.query.to);

  const user = await User.findOne({ _id: _id });
  const exerciseCount = await Exercise.countDocuments({ _user_id: _id });

  const queryObj = { _user_id: _id }

  if (req.query.from && req.query.to) {
    queryObj.date = { $gte: fromDate, $lte: toDate }
  } else if (req.query.from) {
    queryObj.date = { $gte: fromDate }
  } else if (req.query.to) {
    queryObj.date = { $lte: toDate }
  }

  let exerciseQuery = Exercise.find( queryObj );
  
  if (req.query.limit) {
    exerciseQuery = exerciseQuery.limit(req.query.limit);
  }

  const exerciseLog = await exerciseQuery.exec();

  const exerciseLogFormatted = exerciseLog.map( exercise => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }
  })

  res.json({
    username: user.username,
    count: exerciseCount,
    _id: _id,
    log: exerciseLogFormatted
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
