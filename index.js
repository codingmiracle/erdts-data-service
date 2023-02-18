const express = require('express');
const { Session } = require('./session');
const session = require('./session');

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

var _session = new Session(hc12)

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<html><head><title>erdts-dataservice</title><style> html {background: #000; color: #fff;} </style></head><body>OK</body></html>");
})

app.get("/data", (req, res) => {
    res.send(_session.data);
})

app.delete("/data", (req, res) => {
    _session.data = new Array();
    res.json({status: "OK"});
})

app.post("/start-session", (req, res) => {
    token = req.body.token;
    if(token.length != 5) {
        res.status(400);
        res.json({error: "Invalid Token length"});
        res.end();
    }
    try {
        res.status(200);
        _session.close();
        _session.start(token);
        res.json({status: "OK"});
        res.end();
    } catch(e) {
        res.status(500);
        res.json({error: e});
        res.end();
    }
})

// start service
app.listen(3001, () =>
    console.log('service listening on port 3001!'),
);
