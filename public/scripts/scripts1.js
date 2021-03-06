let url = "";
function renderChart (arr1, arr2, name) {
    const values = arr1; 
    const dates = arr2; 
     var cleanDates = []
     dates.forEach(date => {
         var myDate = new Date(date);
         var formated = myDate.toLocaleTimeString()
         cleanDates.push(formated)
     });
     
     const labels = cleanDates.reverse();
     
     const data = {
         labels: labels,
         datasets: [{
             label: "Soil",
             backgroundColor: '#00C02A',
             borderColor: '#00C02A',
             data: values.reverse(),
             fill: false,
             tension: 0.2
         }]
     };
     
     const config = {
         type: 'line',
         data: data,
         options: {
             scales: {
                 x: {
                     grid: {
                         display: false
                     }
                 },
                 y: {
                     
                     grid: {
                         display: false
                     },
                     
                        suggestedMin: 45
                    
                 }
             }
         }
     };
     chartProducer(name,config)
}

function chartProducer(name, config) {
    if (name == "tempchart") {
        config.options.scales.y.suggestedMin = 14
        config.data.datasets[0].label = "Temp"
    }
    const myChart = new Chart(
        document.getElementById(name),
        config
    );
}

function getPulse()
{
   $.get("https://" + "ec.mourraille.com" + "/pulse", function(data, status) {
    document.getElementById("soil-value").innerHTML = data.soil + "%"
    document.getElementById("temp-value").innerHTML = data.temp + '&#176;'
  });
}

setInterval(getPulse, 1000);