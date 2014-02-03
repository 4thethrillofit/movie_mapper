Utils = {
  removeDuplicateRecords: function(array) {
    return array.filter(function(record, index){
      return array.indexOf(record) === index;
    });
  },
  // Simple clone method to make sure original data is not modified
  cloneArrayOfObjects: function(array) {
    return array.map(function(obj){ return $.extend({}, obj) });
  }
}

module.exports = Utils;
