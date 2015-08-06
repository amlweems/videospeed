
var tc = {
  settings: {
  	speed: 1.0,          // default 1.0
    speedStep: 0.1,      // default 0.1x
    resetKeyCode:  82,   // default: R
    slowerKeyCode: 83,   // default: S
    fasterKeyCode: 68,   // default: D
  }
};

self.port.on("prefchange", function(newSpeed) {
  tc.settings.speed = newSpeed;

  var videoTags = document.getElementsByTagName('video');
  videoTags.forEach = Array.prototype.forEach;

  videoTags.forEach(function(v) {
    setSpeed(v, newSpeed);
  });
});

tc.videoController = function(target) {
  this.video = target;
  this.initializeControls();

  target.addEventListener('play', function(event) {
    target.playbackRate = tc.settings.speed;
  });

  target.addEventListener('ratechange', function(event) {
    if (target.readyState === 0) {
      return;
    }
    var speed = this.getSpeed();
    this.speedIndicator.textContent = speed;
    tc.settings.speed = speed;
    self.port.emit("ratechange", speed);
  }.bind(this));

  target.playbackRate = tc.settings.speed;
};

tc.videoController.prototype.getSpeed = function() {
  return parseFloat(this.video.playbackRate).toFixed(2);
}

tc.videoController.prototype.remove = function() {
  this.parentElement.removeChild(this);
}

tc.videoController.prototype.initializeControls = function() {
  var fragment = document.createDocumentFragment();
  var container = document.createElement('div');
  var speedIndicator = document.createElement('span');

  container.appendChild(speedIndicator);
  container.classList.add('tc-videoController');

  fragment.appendChild(container);
  this.video.parentElement.insertBefore(fragment, this.video);

  var speed = parseFloat(tc.settings.speed).toFixed(2);
  speedIndicator.textContent = speed;
  this.speedIndicator = speedIndicator;
}

function setSpeed(v, speed) {
  v.playbackRate = speed;
}

function runAction(action) {
  var videoTags = document.getElementsByTagName('video');
  videoTags.forEach = Array.prototype.forEach;

  videoTags.forEach(function(v) {
    if (!v.classList.contains('vc-cancelled')) {
      if (action === 'faster') {
        // Maxium playback speed in Chrome is set to 16:
        // https://code.google.com/p/chromium/codesearch#chromium/src/media/blink/webmediaplayer_impl.cc&l=64
        var s = Math.min(v.playbackRate + tc.settings.speedStep, 16);
        setSpeed(v, s);
      } else if (action === 'slower') {
        // Audio playback is cut at 0.05:
        // https://code.google.com/p/chromium/codesearch#chromium/src/media/filters/audio_renderer_algorithm.cc&l=49
        var s = Math.max(v.playbackRate - tc.settings.speedStep, 0);
        setSpeed(v, s);
      } else if (action === 'reset') {
      	setSpeed(v, 1.0);
      }
    }
  });
}

document.addEventListener('keydown', function(event) {
  // if lowercase letter pressed, check for uppercase key code
  var keyCode = String.fromCharCode(event.keyCode).toUpperCase().charCodeAt();

  // Ignore keypress event if typing in an input box
  if (document.activeElement.nodeName === 'INPUT' && document.activeElement.getAttribute('type') === 'text') {
    return false;
  }

  if (keyCode == tc.settings.fasterKeyCode) {
    runAction('faster')
  } else if (keyCode == tc.settings.slowerKeyCode) {
    runAction('slower')
  } else if (keyCode == tc.settings.resetKeyCode) {
    runAction('reset')
  }

  return false;
}, true);

document.addEventListener('DOMNodeInserted', function(event) {
  var node = event.target || null;
  if (node && node.nodeName === 'VIDEO') {
    new tc.videoController(node);
  }
});

var videoTags = document.getElementsByTagName('video');
videoTags.forEach = Array.prototype.forEach;
videoTags.forEach(function(video) {
  var control = new tc.videoController(video);
});

self.port.emit("load", null);