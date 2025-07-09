const express = require("express");
const cors = require("cors");
const nseScrape = require("./routes/nseScrape");
const youtube = require("./routes/nseScrape");

const app = express();
app.use(cors());

// Trade
app.use("/api", nseScrape);

// Monetization
app.use("/api", youtube);


app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
