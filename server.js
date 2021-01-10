const express = require("express");
const logger = require("morgan");
const mongojs = require("mongojs");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT || 3000;

const db = require("./models");
const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

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
  let date = {
    day: Date.now()
  }

  db.Workout.create(date, (error, saved) => {
    if (error) {
      console.log(error);
    } else {
      res.send(saved);
    }
  })

});

//A put route that adds an exercise to the session started by the post route
app.put("/api/workouts/:id", (req, res) => {
  let body = req.body;
  let id = req.params.id;

  console.log(body);
  //We want to make a new array to add to the exercises section of the currently existing entry

  db.Workout.updateOne(
    { _id: mongojs.ObjectId(id) },
    {
      $addToSet:
        { exercises: body }
    },
    (error, edited) => {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(edited);
        res.send(edited);
      }
    }
  )



});

//Orders entries in reverse chronological order
app.get("/api/workouts", (req, res) => {
  db.Workout.find({}).sort({ day: -1 }).populate("workouts")
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    })

});



//Generating data when user clicks dashboard
app.get("/api/workouts/range", (req, res) => {
  db.Workout.find({})
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