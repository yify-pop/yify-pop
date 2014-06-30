exports.getParams = function (params, baseURL) {
  var yify = {};

  // Set Defaults
  yify.search = '';
  yify.sort = 'date';
  yify.genre = 'all';
  yify.page = 1;
  yify.set = '&set=1';

  // Set new parameters
  if (params.sort) {
    yify.sort = params.sort;
  }

  if (params.genre) {
    yify.genre = params.genre;
  }

  if (params.search && params.search !== '') {
    yify.search = '&keywords=' + params.search;
  }

if (params.keywords && params.keywords !=='') {
    yify.search = '&keywords=' + params.keywords;
  }
  
  var oldURL = baseURL + '?sort=' + yify.sort + '&genre=' + yify.genre + yify.search;

  yify.previousDisabled = 'disabled';
  yify.nextDisabled = '';
  yify.previousPage = '#';
  yify.nextPage = oldURL + '&set=' + (yify.page + 1);

  // Update paging links
  if (params.set && params.set !== '') {
    yify.set = '&set=' + params.set;
    yify.page = parseInt(params.set);

    yify.previousPage = oldURL + '&set=' + (yify.page - 1);

    if (yify.page > 1) {
      yify.previousDisabled = '';
    }

    yify.nextPage = oldURL + '&set=' + (yify.page + 1);
  } else {
    yify.nextPage = oldURL + '&set=' + (yify.page + 1);
  }

  // Set request URL
  yify.url = 'http://yts.re/api/list.json?limit=18&quality=720p&sort=';
  yify.url += yify.sort + '&genre=' + yify.genre + yify.search + yify.set;

  return yify;
};
