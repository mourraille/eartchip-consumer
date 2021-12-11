function renderChart (arr1, arr2) {
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
                     maxTicksLimit: 6
                 }
             }
         }
     };
     const myChart = new Chart(
         document.getElementById('myChart'),
         config
     );
     
}
