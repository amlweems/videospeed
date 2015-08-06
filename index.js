var pageMod = require("sdk/page-mod");
var preferences = require("sdk/simple-prefs");

workers = []

function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

pageMod.PageMod({
  include: "*.youtube.com",
  contentScriptFile: "./inject.js",
  contentStyleFile: "./inject.css",
  onAttach: function(worker) {
    worker.port.on("ratechange", function(value) {
      preferences.prefs["speed"] = value.toString();
    });

    worker.port.emit("prefchange", preferences.prefs.speed);

    worker.on('detach', function () {
      detachWorker(this, workers);
    });
  }
});
