from machine import Pin, ADC
import time
import math

adc = ADC(27)
print("El valor devuelto por el ADC es: {}".format(adc.read_u16()))

voltage = (adc.read_u16() * (3.3/(65536)))
print("La tensión es de: {} volts".format(voltage))

R=(10000*((adc.read_u16()-1)/35536))
print("La Resistencia del Termistor es: {} ohms".format(R))

Resistence=(((10000)/((35536)/(adc.read_u16()-1)))/(10000))  #(R/R0) R0=10K
print("La division entre las Resistencias es: {}".format(Resistence))
ln=(math.log(((10000)/((35536)/(adc.read_u16()-1)))/(10000))) #ln(R/R0)
print("Su logaritmo niperiano: {}".format(ln))
B=(((1/3950)*(math.log(((10000)/((35536)/(adc.read_u16()-1)))/(10000)))))  #(1/B)*(ln(R/R0) B=3950K a 25C
print("El producto entre la inversa del coeficiente del material constante es: {}".format(B))
InvertTemp=(((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(adc.read_u16()-1)))/(10000))))))  #(1/T0)+ B
print("Sumada la temperatura a 25 Celsius en Kelvin es: {}".format(InvertTemp))
K=((1/((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(adc.read_u16()-1)))/(10000)))))))  #T in Kelvin
print("La Temperatura enn Kelvin es: {} ohms".format(K))
C=(((1/((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(adc.read_u16()-1)))/(10000)))))) - 273.15)) # C conversion a Celsius K - 273.15
print("La Temperatura en Celsius es: {} grados  centigrados".format(C))


def steinhart_C():
    C=(((1/((1/(25+273.15))+((1/3950)*(math.log(((10000)/((35536)/(adc.read_u16()-1)))/(10000)))))) - 273.15))
    return C

print("La Temperatura en Celsius es: {} grados  centigrados".format(steinhart_C()))

while True:
    val = steinhart_C()
    print("The Temperature is: {} °C".format(val))
    time.sleep(2)