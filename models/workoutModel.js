const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WorkoutSchema = new Schema({
    day: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        trim: true,
        required: "Type of exercise is required"
    },
    name: {
        type: String,
        trime: true,
        required: "Name of exercise is required"
    },
    duration: {
        type: Number,
    },
    weight: {
        type: Number, 
    },
    reps: {
        type: Number
    },
    sets: {
        type: Number
    }
});

const Workout = mongoose.model("Workout", WorkoutSchema);

module.exports = Workout;