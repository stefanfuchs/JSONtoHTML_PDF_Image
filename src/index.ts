let express = require('express');
let app = express();
import JSONtoPNG from './JSONtoPNG'

let inst = new JSONtoPNG();
inst.useLocalJson();

app.get('/', function (req, res) {
  const filename = inst.useRemoteJson(req.json);
  //res.send('Hello World!'); 
  res.send(filename);
});

app.listen(3006, function () {
  console.log('Example app listening on port 3006!');
});