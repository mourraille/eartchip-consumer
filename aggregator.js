import Agenda from 'agenda'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import dotenv from 'dotenv'
dotenv.config()


const agenda = new Agenda({ db: { address: process.env.MONGODB}});

 //gotta rework the logic here
 const hourlyAggregationJob = async function () {
    agenda.define("hourly", async (job) => {
        const query = await Log.aggregate(
            [
              {
                $group:
                  {
                    _id: "$characteristic",
                    avgQuantity: { $avg: "$value" }
                  }
              }
            ]
         ).exec();     
    var logCount = 0;
    Log.count({}, function( err, count){
        logCount = count
    })
   await hourlyAggregation("SOIL",new Date(),query[1].avgQuantity,logCount) 
   await hourlyAggregation("TEMP",new Date(),query[0].avgQuantity,logCount) 
   Log.collection.drop();
    });
 }

 //Job creation and kickoff
 const startScheduler = async  function  () {
    await agenda.start();
    await agenda.every("00 * * * *", "hourly");
  };

 async function hourlyAggregation(characteristic,date,avg,logCount) {
    var entry = new Hourly({
        characteristic: characteristic,
        hour_value: avg,
        hour_timestamp: date,
        log_count: logCount
    })
    entry.save() 
  }
  
  export default { hourlyAggregationJob, startScheduler}