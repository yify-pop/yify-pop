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

      // if it's a movie
      if (!params.show || params.show !== '1') {
        request('http://yts.re/api/movie.json?id=' + params.id, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var yifyResponse = JSON.parse(body);

            var data = {};
            data.title = yifyResponse.MovieTitleClean;
            data.seeds = yifyResponse.TorrentSeeds;
            data.peers = yifyResponse.TorrentPeers;
            data.cover = yifyResponse.MediumCover;

            childStream.start(function(pid){
              geddy.config.streamingProcesses.push({
                pid: pid,
                child: childStream,
                torrent: decodeURIComponent(params.file),
                stream: streamURL,
                data: data
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
      // else if it's a tv show
      else {
        request('http://popcorn-api.com/show/' + params.id, function (error, response, body) {
          if (!error) {
            var show = JSON.parse(body);

            var data = {};
            data.title = show.title + ' S' + params.season + 'E' + params.episode;
            data.seeds = '0';
            data.peers = '0';
            data.cover = show.images.poster;

            childStream.start(function(pid){
              geddy.config.streamingProcesses.push({
                pid: pid,
                child: childStream,
                torrent: decodeURIComponent(params.file),
                stream: streamURL,
                data: data
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
    }
  });
};
