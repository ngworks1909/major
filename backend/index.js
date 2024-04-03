const express = require("express");
const cors = require("cors");


const app = express();
const port = 3001;

app.use(
    cors({
      origin: ["http://localhost:3000", "https://ngworks-spotify.vercel.app"],
      credentials: true,
    })
);
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/operation", require("./routes/operation"));


app.get('/', (req, res) => {
    res.send("Hello");
})

app.listen(port, ()=>{
    console.log(`App is listening on port ${port}`)
})