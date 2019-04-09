let express = require('express');
let app = express();
let useRemoteJson = require('./htmlpdf.js');

app.get('/', function (req, res) {
  const filename = useRemoteJson(req.json);
  //res.send('Hello World!'); 
  res.send(filename);
});

app.listen(3006, function () {
  console.log('Example app listening on port 3006!');
});