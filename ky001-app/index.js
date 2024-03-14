var sensor = require('./node_modules/ds18x20');
var tempObj = sensor.getAll();
console.log(tempObj);