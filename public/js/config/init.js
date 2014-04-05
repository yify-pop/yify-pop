// Use this file to do all of your initial setup - this will be run after
// core/core.js and all of your models.


$(document).ready(function() {
  FastClick.attach(document.body);

  var a=document.getElementsByTagName("a");
  for (var i=0;i<a.length;i++) {
      if(!a[i].onclick && a[i].getAttribute("target") != "_blank") {
          a[i].onclick = protectLink;
      }
  }
});

var protectLink = function() {
  window.location=this.getAttribute("href");
  return false;
};

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
