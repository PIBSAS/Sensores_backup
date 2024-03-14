const { ADC } = require('adc');
var termistor = new ADC(27); //GP27 ADC1
var rawADC = termistor.read();
console.log("valor del ADC:"+rawADC);

var Resis = ((10000*rawADC)/(65535-rawADC));
console.log("RESIS:"+Resis);
//var numInput = Number(msg.payload);
var R0 = 10000;
var R = 10000 / (65535/rawADC - 1);
//var R = R0 / ((1023 / numInput)-1);
var T0 = 273 + 25;
var B = 3950;
var T =  1 / ( (1/T0) + (1/B) * Math.log(R/R0) );
//msg.payload = T;
//return T;
var Tempo =  1 / ( (1/T0) + (1/B) * Math.log(Resis/R0) );
console.log("Servicio metereologico: "+(Tempo-275.15));
console.log("Resistencia:"+R);
console.log("Tempera 0:"+T0);
console.log("Temp a secas con log:"+T);

function steinhart(rawADC){
  var tempe = Math.log((10000/rawADC)*(3300-rawADC));
  tempe = 1/ (0.001129148 + (0.000234125 + (0.0000000876741 * tempe * tempe))*tempe);
  tempe = tempe - 273.15;
  return tempe;
};
let vout = (new ADC(27).read() * (3.3/(4096)))
console.log(new ADC(27).read()*3.3)  /vout real
var adcread = ((((3.3)/(4096))*new ADC(27).read())*4096)
console.log(vout)
console.log("La T es: "+ steinhart(rawADC));
console.log("La Resistencia variable del termistor es: "+((10000)/((35536)/(termistor.read()-1))))
print(((10000)/((35536)/(ADC(27).read_u16()-1)))/(10000)) //R/R0 --f
print(math.log(((10000)/((35536)/(ADC(27).read_u16()-1)))/(10000)))   //ln(R/R0)
print(((1/3950)*(math.log(((10000)/((35536)/(ADC(27).read_u16()-1)))/(10000)))))   //1/B*ln(R/R0)
print(((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(ADC(27).read_u16()-1)))/(10000))))))  // + (1/T0)
print((1/((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(ADC(27).read_u16()-1)))/(10000)))))))  // 1/T
print(((1/((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(ADC(27).read_u16()-1)))/(10000)))))) - 273.15))  //Convert a centigrados

