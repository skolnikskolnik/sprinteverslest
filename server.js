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
app.put("/api/workouts/:id", (req, res) => {
  let body = req.body;
  console.log(body);

  db.Workout.findByIdAndUpdate(req.params.id, { $push: { exercises: body } }, { new: true, runValidators: true })
    .then(dbWorkout => {
      res.json(dbWorkout);
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
  //Still need to calculate duration
  db.Workout.aggregate([
    {
      $addFields: {
        totalDuration: "$exercises.duration"
      }
    }
  ]).sort({ _id: -1 }).limit(7)
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    })

})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});