// Use this file to do all of your initial setup - this will be run after
// core/core.js and all of your models.

/*
 *  to set up realtime for your specific models
 *  pass an array of model names into the method
 *  below:                                         */

// geddy.io.addListenersForModels();

/*
 *  example:
 *
 *  geddy.io.addListenersForModels(['Item']);
 *
 *  geddy.model.Item.on('save', function (item) {
 *    console.log(item);
 *  });
 *
 *  geddy.model.Item.on('update', function (item) {
 *    console.log(item);
 *  });
 *
 *  geddy.model.Item.on('remove', function (id) {
 *    console.log(id);
 *  });
 *
 */

$(document).ready(function() {
  FastClick.attach(document.body);
});

function getStream(){
  $.getJSON(streamURL, function(data) {
    // Verify your data, if it's not you want run error function
    if(!data) {
      onerror(); return;
    }

    $('.watch').show();
  }).error(function() { onerror(); });
}

// if error ,run it again.
function onerror(){
    setTimeout(function(){getStream();},500);
}
