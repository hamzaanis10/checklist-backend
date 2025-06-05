const express = require("express");
const Task = require("../models/Task");
const Item = require('../models/Item')
const { protect } = require("./auth");
const router = express.Router();

// Create a task
router.post("/", protect, async (req, res) => {
  const { title } = req.body;

  const newTask = new Task({
    title,
    user: req.user.id,
  });

  try {
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).populate("items");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/:taskId/items", protect, async (req, res) => {
  const { title } = req.body;
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task || task.user.toString() !== req.user.id) {
      return res
        .status(400)
        .json({ message: "Task not found or unauthorized" });
    }

    const newItem = new Item({
      title,
      task: taskId,
    });

    await newItem.save();

    task.items.push(newItem._id);
    await task.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
