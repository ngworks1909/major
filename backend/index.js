const express = require("express");
const cors = require("cors");


const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/operation", require("./routes/operation"));


app.get('/', (req, res) => {
    res.send("Hello");
})

app.listen(port, ()=>{
    console.log(`App is listening on port ${port}`)
})