const pin = 27; //GP27 ADC0
let value = 0;
const { LED } = require('led');
const led = new LED(25);
setInterval(function () {
  let p = analogRead(pin);
  let delta = Math.abs(value - p);
  if (delta > 0.01) {
    value = p;
    console.log(value);
    led.on();
    delay(1000);
    led.off();
    delay(1000);
  }
}, 100);