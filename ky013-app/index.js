const { ADC } = require('adc');
var termistor = new ADC(27); //GP27 ADC1
var rawADC = termistor.read();

function steinhart(rawADC) {
  var C = (((1/((1/(25+273.15))+((1/3950)*(Math.log(((10000)/((35536)/(termistor.read()-1)))/(10000)))))) - 273.15))
  return C;
}
var val = steinhart(rawADC);
console.log("La T es: "+ val);
