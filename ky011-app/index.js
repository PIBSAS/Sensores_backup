var green = 2;
var red = 4;

pinMode(green, OUTPUT);
pinMode(red, OUTPUT);

setInterval(() => {
  digitalWrite(green, HIGH); // turn on green LED
  delay(1000);// wait 1 second
  digitalWrite(green, LOW); // turn off green LED
  digitalWrite(red, HIGH); // turn on red LED
  delay(1000); // wait 1 seconds
  digitalWrite(red, LOW); // turn off red LED
}, 1000);
//End