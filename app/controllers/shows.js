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

var eztvHelper = require('../helpers/eztv');
var moment = require('moment');

var Shows = function () {
  this.index = function (req, resp, params) {
    var self = this;
    var request = require('request');
    var baseURL = "http://" + req.headers.host;

    var eztvRequest = eztvHelper.getParams(params, baseURL);

    request(eztvRequest.url, function (error, response, body) {
      if (!error) {
        var shows = JSON.parse(body);

        self.respond({
          params: params,
          shows: shows,
          baseURL: baseURL,
          previousPage: eztvRequest.previousPage,
          nextPage: eztvRequest.nextPage,
          previousDisabled: eztvRequest.previousDisabled,
          nextDisabled: eztvRequest.nextDisabled
        }, {
          format: 'html',
          template: 'app/views/shows/index',
          layout: 'app/views/layouts/layout_shows'
        });
      }
    });
  };

  this.show = function (req, resp, params) {
    var self = this;
    var request = require('request');
    var baseURL = "http://" + req.headers.host + '/';

    request('http://eztvapi.re/show/' + params.id, function (error, response, body) {
      if (!error) {
        var show = JSON.parse(body);

        if (show.episodes) {
          var seasons = [];
          for (var i=0; i < show.episodes.length; i++) {
            var seasonIndex = Number(show.episodes[i].season) - 1;
            if (!seasons[seasonIndex]) {
              seasons[seasonIndex] = [];
            }

            seasons[seasonIndex].push(show.episodes[i]);
          }
        } else {
          seasons = [];
        }

        self.respond({
          params: params,
          show: show,
          episodes: show.episodes,
          seasons: seasons,
          baseURL: baseURL,
          moment: moment
        }, {
          format: 'html',
          template: 'app/views/shows/show',
          layout: 'app/views/layouts/layout_shows'
        });
      }
    });
  };
};


exports.Shows = Shows;
