const express = require("express");
const logger = require("morgan");
const mongojs = require("mongojs");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT || 3000;

const db = require("./models");
const Workout = require("./models/workoutModel.js")
const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true, useFindAndModify: false });

//HTML ROUTES
//Want to serve up different HTML pages when different buttons are hit
app.get("/exercise", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/exercise.html"))
});

//Serve up stats page when "Dashboard" is clicked
app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/stats.html"))
});


//API ROUTES
//A post route to /api/workouts that starts a session
app.post("/api/workouts", (req, res) => {

  db.Workout.create({}).then(dbWorkout => {
    res.json(dbWorkout);
  })
    .catch(err => {
      res.json(err);
    })

});

//A put route that adds an exercise to the session started by the post route
//THIS IS WHERE THE MISTAKE IS 
app.put("/api/workouts/:id", (req, res) => {

  db.Workout.findByIdAndUpdate(mongojs.ObjectId(req.params.id),
    { $push: { exercises: req.body } }, { new: true, runValidators: true })
    .then(dbWorkout => {
      res.json(dbWorkout);
      console.log(dbWorkout);
    }).catch(err => {
      res.json(err);
    });

});

//Orders entries in reverse chronological order
app.get("/api/workouts", (req, res) => {

  db.Workout.aggregate([
    { $addFields: { totalDuration: { $sum: "$exercises.duration" } } }
  ])
    .then(dbWorkout => {

      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    })

});


//Should get the last seven workouts
app.get("/api/workouts/range", (req, res) => {
 
  //Duration is popping up for the main page but isn't populating here for some reason
  db.Workout.aggregate([
    {
      $addFields: {
        totalDuration: {$sum: "$exercises.duration"}
      }
    }
  ]).sort({ day: -1 }).limit(7)
    .then(dbWorkout => {
      console.log(dbWorkout);
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    })

})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});