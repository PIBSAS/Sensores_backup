const pin = 2;
const {DHT} = require('./node_modules/dht');
const dht = new DHT(pin, DHT.DHT11);
let result = dht.read();
setInterval(() => {
  if (result){
    console.log(result);
    console.log("Humidity: " + dht.humidity + " %");
    console.log("Temperature: " + dht.temperature + " C");
  } else {
    console.log('Failed to read');
  }
}, 5000);
//End