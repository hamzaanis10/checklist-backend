const express = require("express");
const { protect } = require("./auth");
const Post = require("../models/Post");
const router = express.Router();

// Create a task
router.post("/", protect, async (req, res) => {
  const { title, content } = req.body;

  const newPost = new Post({
    title,
    content,
    user: req.user.id,
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.get("/", protect, async (req, res) => {
//   try {
//     const tasks = await Task.find({ user: req.user.id }).populate("items");
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

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
