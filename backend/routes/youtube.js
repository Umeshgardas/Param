const express = require("express");
const router = express.Router();
const ytdl = require('ytdl-core');

router.get("/api/download", async (req, res) => {
  try {
    const { videoId } = req.query;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    res.header("Content-Disposition", `attachment; filename="video.mp4"`);
    ytdl(url, { format: "mp4" }).pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
