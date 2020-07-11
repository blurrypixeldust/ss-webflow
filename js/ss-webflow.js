// homepage chart 
(function(){
    // get the latest single price from CC
    async function getLatestPrice(){
        try {
        const latestPrReq = await fetch("https://api.coincap.io/v2/assets/bitcoin");
        const latestPrJson = await latestPrReq.json();
        return latestPrJson;
        } catch (err) {
            console.log(err)
        }
    }
    
    // get the lst 12 hours of prices in 15 min intervals
    async function getTwelveHourPrices(){
        try {
        currentDate = new Date();
        currentMinutes = currentDate.getMinutes();
        currentHours = currentDate.getHours();
        if(currentMinutes < 15){
            currentDate.setMinutes(0);
        }
        if(currentMinutes >= 15 && currentMinutes < 30){
            currentDate.setMinutes(15);
        }
        if(currentMinutes >= 30 && currentMinutes < 45){
            currentDate.setMinutes(30);
        }
        if(currentMinutes >= 45 && currentMinutes <= 59){
            currentDate.setMinutes(45);
        }
        currentDate.setSeconds(0,0);
    
        let currentTime = currentDate.getTime();
        let roundedTime = currentTime;
        let twtime = roundedTime - 43200000;
        const twelveHourPrReq = await fetch("https://api.coincap.io/v2/assets/bitcoin/history?interval=m15&start="+twtime+"&end="+roundedTime);
        const twelveHourPrJson = await twelveHourPrReq.json();
        return twelveHourPrJson.data;
        } catch (err) {
            console.log(err)
        }
    }
    
    // build chart function
    // let myChart;
    async function buildChart(){
        try {
        const currentChartPrice = await getLatestPrice();
        const twelveHourData = await getTwelveHourPrices();
        let priceArray = [];
        let timeArray = [];
        twelveHourData.map((hourItem,i) => {
            let formattedPrice = parseFloat(hourItem.priceUsd).toFixed(2)
            let priceTimeStamp = new Date(hourItem.time).toLocaleString()
            priceArray.push(formattedPrice);
            timeArray.push(priceTimeStamp);
        })
        let currentFormattedPrice = parseFloat(currentChartPrice.data.priceUsd).toFixed(2);
        let currentPriceTimeStamp = new Date(currentChartPrice.timestamp).toLocaleString();
        priceArray.push(currentFormattedPrice);
        timeArray.push(currentPriceTimeStamp);
        document.getElementById('currentPrice').innerText = '$'+currentFormattedPrice;
        // get chart by ID
        let ctx = document.getElementById('myChart').getContext('2d');
        //  custom gradient for canvas
        let gradient = ctx.createLinearGradient(0, 0, 0, 390);
        gradient.addColorStop(0, 'rgba(245, 124, 0, .6)');       
        gradient.addColorStop(1, 'rgba(245, 124, 0, 0)');
        let lineGradient = ctx.createLinearGradient(500, 0, 0, 0);
        lineGradient.addColorStop(1, 'rgb(245, 124, 0)');    
        lineGradient.addColorStop(0, 'rgb(250, 173, 34)');
        // start building chart
        myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeArray,
            datasets: [{
                data: priceArray,
                backgroundColor: gradient,
                borderColor: lineGradient,
                borderWidth: 3,
                lineTension: .4,
                pointRadius: function(context) { 
                    if (context.dataIndex == context.dataset.data.length-1) {
                        return 8;
                        } else { 
                            return 0; 
                            } },
                pointBackgroundColor: 'rgb(245, 124, 0)',
                pointBorderColor: '#ffffff',
                hitRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top:30,
                    left:20,
                    right:20,
                }
            },
            tooltips: {
                titleAlign: 'center',
                titleFontStyle: 'normal',
                backgroundColor: '#37465e',
                bodyAlign: 'center',
                bodyFontStyle: 'bold',
                bodyFontSize: 14,
                displayColors: false,
                intersect: false,
                cornerRadius: 3,
                caretSize: 10,
                yPadding: 15,
                xPadding: 10,
                yAlign: 'bottom',
                xAlign: 'center',
                mode: 'index',
                callbacks: {
                    label: function(value){
                        return '$'+value.value
                    }
                }
            },
            legend: {
                display: false
             },
            scales: {
                yAxes: [{
                    gridLines: {
                    display:false,
                    color: "rgba(55, 70, 94, 0.4)",
                    },
                    ticks: {
                        display : false,
                        maxTicksLimit:6,
                    }
                }],
                xAxes: [{
                    gridLines: {
                    drawBorder: false,
                    color: "rgba(55, 70, 94, 0.4)",
                    zeroLineColor:'rgba(55, 70, 94, 0.4)',
                    },
                ticks: {
                    display:false,// remove to display x axis labels
                    callback: function(value, index, values) {
                        // total of 48 items in 12hr array so 48/4 gives us 12 hrs
                        switch (index/4) {
                            case 0:
                                return 12+'hr';
                                break;
                        
                            case 2:
                                return 10+'hr';
                                break;
                        
                            case 4:
                                return 8+'hr';
                                break;
    
                            case 6:
                                return 6+'hr';
                                break;
    
                            case 8:
                                return 4+'hr';
                                break;
                        
                            case 10:
                                return 2+'hr';
                                break;
                             
                            case 12:
                                return 'Current';
                                break;
                        
                            default:
                                break;
                        }
                        },
                    maxTicksLimit:12,
                    precision:3
                }
            }]
            }
        },  
    });
        } catch (err) {
            console.log(err)
        }
        
    }
    // update price function
    async function updatePrice(){
        try {
        const latestPriceReq = await getLatestPrice();
        const latestPriceNumber = parseFloat(latestPriceReq.data.priceUsd).toFixed(2);
        const latestPriceTimestamp = new Date(latestPriceReq.timestamp).toLocaleString();
        let currentSecs = new Date(myChart.data.labels[myChart.data.labels.length - 1]).getTime();
        let previousSecs = new Date(myChart.data.labels[myChart.data.labels.length - 2]).getTime();
        if((currentSecs - 1800000) > previousSecs){
            myChart.destroy();
            buildChart();
            return;
        }
        document.getElementById('currentPrice').innerText = '$'+latestPriceNumber;
        myChart.data.datasets[0].data.pop();
        myChart.data.labels.pop();
        myChart.data.labels.push(latestPriceTimestamp);
        myChart.data.datasets[0].data.push(latestPriceNumber);
        myChart.update();
        } catch (err) {
            console.log(err)
        }
    
    }
    buildChart();
    setInterval(()=>{updatePrice()},15000);
    }())