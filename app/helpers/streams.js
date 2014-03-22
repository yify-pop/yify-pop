exports.create = function(self, streamURL, hostname, params) {
  var getport = require('getport');
  var request = require('request');

  getport(8889, 8999, function (e, port) {
    if (e) {
      self.redirect('/');
    } else {
      var childStream = require('child')({
        command: 'peerflix',
        args: [decodeURIComponent(params.file),  '--port=' + port],
        cbStdout: function(data) {
          console.log(String(data));
        }
      });

      streamURL = "http://" + hostname + ":" + port;

      request('http://yts.re/api/movie.json?id=' + params.id, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var yifyResponse = JSON.parse(body);

          childStream.start(function(pid){
            geddy.config.streamingProcesses.push({
              pid: pid,
              child: childStream,
              torrent: decodeURIComponent(params.file),
              stream: streamURL,
              movie: yifyResponse
            });
          });

          self.respond({
            params: params,
            streamURL: streamURL
          }, {
            format: 'html',
            template: 'app/views/main/stream'
          });
        }
      });
    }
  });
};
