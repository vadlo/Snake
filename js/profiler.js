function Profiler() {
  var _timestamps = new Array();
  return {
    mark: function() {
      try {
        var lastTimestamp = _timestamps[_timestamps.length - 1];
        var currentTimestamp = (new Date()).parse();
        console.log(currentTimestamp - currentTimestamp);
        _timestamps.push(currentTimestamp);
      }
      catch(e) {}
    }
  }
}
