import Agenda from 'agenda'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import dotenv from 'dotenv'
dotenv.config()


const agenda = new Agenda({ db: { address: process.env.MONGODB}});

 //gotta rework the logic here
 const hourlyAggregationJob = function () {
    agenda.define("hourly", async (job) => {
        Log.find({}, function(err, logs) {
            let avg = 0;
            if(logs.length>0) { 
            logs.forEach(log => {
                if(log.characteristic == "SOIL") {
                    avg +=  log.value
                }
            });
            avg = avg/logs.length
            console.log(avg)
            const entry = new Hourly({
                characteristic: "SOIL",
                hour_value: avg,
                hour_timestamp: new Date(),
                log_count: logs.length
            })
             entry.save()
             Log.collection.drop();
        }
        });
    });
 }

 //Job creation and kickoff
 const startScheduler = async  function  () {
    await agenda.start();
    await agenda.every("59 * * * *", "hourly");
  };

  export default { hourlyAggregationJob, startScheduler}