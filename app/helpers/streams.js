exports.create = function(self, streamURL, hostname, params) {
  var getport = require('getport');
  var request = require('request');
  
  var isWin = process.platform === 'win32';

  getport(8889, 8999, function (e, port) {
    if (e) {
      self.redirect('/');
    } else {
      var osSpecificCommand = isWin ? 'cmd' : 'peerflix';
      var osSpecificArgs = isWin ? ['/c', 'peerflix', decodeURIComponent(params.file),  '--port=' + port] : [decodeURIComponent(params.file),  '--port=' + port];
      var childStream = require('child')({
        command: osSpecificCommand,
        args: osSpecificArgs,
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
