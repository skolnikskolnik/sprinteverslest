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

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/populatedb", { useNewUrlParser: true });

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
//A post route to /api/workouts that creates the workout for today but doesn't take in any other information yet
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

//A put route that adds the rest of the information to the post we just created
app.put("/api/workouts/:id", (req, res) => {
  let body = req.body;
  let id = req.params.id;

  console.log(body);

  db.Workout.update(
    {
      _id: mongojs.ObjectId(id)
    },
    {
      $set: {
        type: body.type,
        name: body.name,
        weight: body.weight,
        sets: body.sets,
        reps: body.reps,
        duration: body.duration
      }
    },
    (error, edited) => {
      if (error) {
        console.log(error);
      } else {
        console.log(edited);
        res.send(edited);
      }
    }
  )
})

//Want a fetch for /api/workouts - this should get the last workout to populate it to the html
app.get("/api/workouts", (req, res) => {
  //First sort by date, then grab the most recent one
  db.Workout.find().sort({ day: -1 }).limit(1).populate("workouts")
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    })


});


//What is the difference between "Complete" button and "Add Exercise" button


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