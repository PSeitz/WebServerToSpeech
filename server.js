var express = require('express');
var app = express();
var exec = require('child_process').exec;

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});


app.get("/say/:text", function (req, res) {
    console.log(req.params.text);
    res.send(req.params.text);

    var command = 'cd /home/pi/Dev/picopi/pico/tts/;./testtts "'+req.params.text+'" | aplay --rate=16000 --channels=1 --format=S16_LE'

    var child = child = exec(command,
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });
});

