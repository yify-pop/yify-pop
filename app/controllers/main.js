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

var Main = function () {
  this.index = function (req, resp, params) {
    var self = this;
    var request = require('request');
    var baseURL = "http://" + req.headers.host;
    var sort = 'date';
    var genre = 'all';

    if (params.sort) {
      sort = params.sort;
    }

    if (params.genre) {
      genre = params.genre;
    }

    var search = '';

    if (params.search && params.search !== '') {
      search = '&keywords=' + params.search;
    }

    var oldURL = 'http://' + req.headers.host + '?sort=' + sort + '&genre=' + genre + search;

    var set = '&set=1';
    var previousDisabled = 'disabled';
    var nextDisabled = '';
    var page = 1;
    var previousPage = '#';
    var nextPage = oldURL + '&set=' + (page + 1);

    if (params.set && params.set !== '') {
      set = '&set=' + params.set;
      page = parseInt(params.set);

      previousPage = oldURL + '&set=' + (page - 1);

      if (page > 1) {
        previousDisabled = '';
      }

      nextPage = oldURL + '&set=' + (page + 1);
    }

    request('http://yts.re/api/list.json?limit=18&quality=720p&sort=' + sort + '&genre=' + genre + search + set, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var yifyResponse = JSON.parse(body);

        if (yifyResponse.MovieCount < (page * 18)) {
          nextDisabled = 'disabled';
          nextPage = '#';
        }

        self.respond({
          params: params,
          movies: yifyResponse.MovieList,
          baseURL: baseURL,
          previousPage: previousPage,
          nextPage: nextPage,
          previousDisabled: previousDisabled,
          nextDisabled: nextDisabled
        }, {
          format: 'html',
          template: 'app/views/main/index'
        });
      }
    });
  };

  this.stream = function (req, resp, params) {
    var self = this;

    var portfinder = require('portfinder');

    var hostname = (req.headers.host.match(/:/g)) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;

    var getport = require('getport');

    getport(8889, 8999, function (e, port) {
      if (e) {
        self.redirect('/');
      } else {
        var exec = require('executive');

        var childStream = require('child')({
          command: 'peerflix',
          args: [decodeURIComponent(params.file),  '--port=' + port],
          cbStdout: function(data){ console.log('out '+data)}
        });

        var streamURL = "http://" + hostname + ":" + port;

        childStream.start(function(pid){
          console.log('apacheTail is now up with pid: '+ pid);
          geddy.config.streamingProcesses.push({
            pid: pid,
            child: childStream,
            torrent: decodeURIComponent(params.file),
            stream: streamURL
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
  };

  this.running = function (req, resp, params) {
    var self = this;

    console.log(geddy.config.streamingProcesses);

      self.respond({
        params: params,
        streams: geddy.config.streamingProcesses
      }, {
        format: 'html',
        template: 'app/views/main/running'
      });
  };

  this.kill = function (req, resp, params) {
    var self = this;

    if (params.pid && params.pid !== '') {
      for (var i=0; i < geddy.config.streamingProcesses.length; i++) {
        if (geddy.config.streamingProcesses[i].pid == params.pid) {
          geddy.config.streamingProcesses[i].child.stop();
          geddy.config.streamingProcesses.splice(i, 1);
          console.log('Child is now stopped.');
        }
      }
    }

    self.redirect('/running');
  };
};


exports.Main = Main;
