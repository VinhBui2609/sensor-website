/* ------------------------------- server.js  ----------------------------------- */
const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;
const ROOT = __dirname;

// Serve everything inside the website folder
app.use(express.static(path.join(ROOT, "website")));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(ROOT, "website/test.html"));
});

