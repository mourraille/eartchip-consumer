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
      const count = await Log.countDocuments({});
      query.forEach(log => {
         hourlyAggregation(log._id,new Date(),log.avgQuantity,count) 
       });     
    
    await Log.collection.drop();
    });
 }

 //Job creation and kickoff
 const startScheduler = async  function  () {
    await agenda.start();
    await agenda.every("00 * * * *", "hourly");
  };

 async function hourlyAggregation(characteristic,date,avg,count) {
    var entry = new Hourly({
        characteristic: characteristic,
        hour_value: avg,
        hour_timestamp: date,
        log_count: count
    })
    entry.save() 
  }
  
  export default { hourlyAggregationJob, startScheduler}