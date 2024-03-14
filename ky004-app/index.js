var pin = 2;
pinMode(pin, INPUT_PULLUP);
setWatch(() => {
  console.log('click!');
}, pin, FALLING, 50);