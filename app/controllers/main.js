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

    request('http://yts.re/api/list.json?sort=' + sort + '&genre=' + genre + search, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var yifyResponse = JSON.parse(body);

        var baseURL = "http://" + req.headers.host;

        self.respond({
          params: params,
          movies: yifyResponse.MovieList,
          baseURL: baseURL
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

        child = exec.quiet('peerflix ' + decodeURIComponent(params.file) + ' --port=' + port);

        child.stdout.on('data', function(data) {
          console.log(data);
        });

        self.respond({
          params: params,
          streamURL: "http://" + hostname + ":" + port
        }, {
          format: 'html',
          template: 'app/views/main/stream'
        });
      }
    });
  };
};

exports.Main = Main;
