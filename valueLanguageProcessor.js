
const transform = function(soilValue,tempValue) {
if (soilValue <=55) {
    soilValue = "underwatered"
}
if (soilValue > 55 && soilValue <= 100 ) {
    soilValue = "perfect"
}
if (soilValue > 100 ) {
    soilValue = "overwatered"
}
if (tempValue <=17) {
    tempValue = "too cold"
}
if (tempValue > 17 && tempValue <= 25 ) {
    tempValue = "perfect"
}
if (tempValue > 25 ) {
    tempValue = "too warm"
}
return {tempValue, soilValue} 
}

export default {
    transform
}