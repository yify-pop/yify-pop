/*
* Geddy JavaScript Web development framework
* Copyright 2112 Matthew Eernisse (mde@fleegix.org)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*         http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

var yify = require('../helpers/yify');
var eztv = require('../helpers/eztv');
var streams = require('../helpers/streams');
var passport = require('../helpers/passport')
, requireAuth = passport.requireAuth;

var Movies = function () {
  if (geddy.config.private) {
    this.before(requireAuth);
  }

  this.index = function (req, resp, params) {
    var self = this;
    var request = require('request');
    var baseURL = "http://" + req.headers.host;

    var yifyRequest = yify.getParams(params, baseURL);

    request(yifyRequest.url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var yifyResponse = {};

        try {
          yifyResponse = JSON.parse(body);
        } catch (error) {
          console.log(error);
          yifyResponse.data.movie_count = 0;
          yifyResponse.data.movies = [];
                }
        if (yifyResponse.data.movie_count > (yify.page * 18)) {
          nextDisabled = 'disabled';
          nextPage = '#';
        }

        self.respond({
          params: params,
          movies: yifyResponse.data.movies,
          baseURL: baseURL,
          previousPage: yifyRequest.previousPage,
          nextPage: yifyRequest.nextPage,
          previousDisabled: yifyRequest.previousDisabled,
          nextDisabled: yifyRequest.nextDisabled
        }, {
          format: 'html',
          template: 'app/views/main/index'
        });
      }
    });
  };

  this.stream = function (req, resp, params) {
    var self = this;
    var streamURL = false;

    var hostname = (req.headers.host.match(/:/g)) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;

    // Check if there is already a stream running for this torrent
    for (var i=0; i < geddy.config.streamingProcesses.length; i++) {
      if (decodeURIComponent(params.file) === geddy.config.streamingProcesses[i].torrent) {
        streamURL = geddy.config.streamingProcesses[i].stream;
        subtitles = geddy.config.streamingProcesses[i].subtitles;
      }
    }

    if (streamURL) {
      self.respond({
        params: params,
        streamURL: streamURL,
        subtitles: subtitles
      }, {
        format: 'html',
        template: 'app/views/main/stream'
      });
    } else {
      // Otherwise start a new stream
      streams.create(self, streamURL, hostname, params);
    }
  };

  this.running = function (req, resp, params) {
    var self = this;

    console.log(geddy.config.streamingProcesses);

    self.respond({
      params: params,
      streams: geddy.config.streamingProcesses,
      baseURL: "http://" + req.headers.host
    }, {
      format: 'html',
      template: 'app/views/main/running'
    });
  };

  this.kill = function (req, resp, params) {
    var self = this;
    var rimraf = require('rimraf').sync;

    if (params.pid && params.pid !== '') {
      for (var i=0; i < geddy.config.streamingProcesses.length; i++) {
        if (geddy.config.streamingProcesses[i].pid == params.pid) {
          // Remove subtitles folder
          rimraf('public/subtitles/' + geddy.config.streamingProcesses[i].data.title);
          if(process.platform == 'win32'){
            var exec = require('child_process').exec,
            child;
            child = exec('taskkill /pid ' + params.pid +' /t /f');
          }
          else{
            geddy.config.streamingProcesses[i].child.stop();
          }
          geddy.config.streamingProcesses.splice(i, 1);
          console.log('Child is now stopped.');
        }
      }
    }

    self.redirect('/running');
  };
};


exports.Movies = Movies;
