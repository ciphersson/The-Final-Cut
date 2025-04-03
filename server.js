const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TheFinalCut.html'));
});

app.listen(port, () => {
    console.log(`The Final Cut app listening at http://localhost:${port}`);
});
