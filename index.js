let express = require('express');
let app = express();
//let code = require('htmlpdf');

app.get('/', function (req, res) {
  //const filename = code.useRemoteJson(req.json);
  res.send('Hello World!'); //res.send(filename);
});

app.listen(3006, function () {
  console.log('Example app listening on port 3006!');
});