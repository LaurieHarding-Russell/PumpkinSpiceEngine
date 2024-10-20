// var fs = require('fs');
// var files = fs.readdirSync('./tools/MapCreator');
// console.log(files);

const express = require('express')
const app = express()

app.get('/', function(req, res) {
  // console.log(req);
  res.sendFile(`${__dirname}/index.html`);
});

app.use(express.static(`${__dirname}`))

app.listen(4200)