const express = require('express');

const app = express();
app.use(express.json());

app.listen(3000, () =>
  console.log('service listening on port 3000!'),
);

app.get("/", (req, res) => {
    res.send("OK");
})

app.post("/start-session", (req, res) => {
    token = req.body.token;
    if(token.length != 5) {
        res.status(400);
        res.json({error: "Invalid Token length"});
        res.end();
    }
    res.status(200);
    res.json({status: "OK"});
    res.end();
})

