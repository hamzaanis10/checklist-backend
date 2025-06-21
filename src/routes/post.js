const express = require("express");
const { protect } = require("./auth");
const Post = require("../models/Post");
const router = express.Router();

// Create a post
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

// Get all the posts
router.get("/list", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "username role") 
      .select("title content createdAt updatedAt"); 

    const customizedPosts = posts.map((post) => {
      const { user, ...postData } = post.toObject(); 
      return postData; 
    });

    res.json(customizedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a post
router.delete("/:id", protect, async (req, res) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  
  

module.exports = router;
