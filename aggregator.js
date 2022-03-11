import Agenda from 'agenda'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import Daily from "./models/Daily.js"
import Health from './models/Health.js'
import Classifier from "./classifier.js"
import ValueTransformer from "./valueLanguageProcessor.js"
import dotenv from 'dotenv'
dotenv.config()

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB
    }
});

//Job creation and kickoff
const startScheduler = async function() {
    await agenda.start();
    await hourlyAggregationJob();
    await dailyAggregationJob();
    await AITrainingJob();
    await agenda.every("00 * * * *", "hourly");
    await agenda.every("00 00 * * *", "daily");
    await agenda.every("00 00 * * 1", "modelTraining");
}

const AITrainingJob = async function() {
    agenda.define("modelTraining", async(job) => {
        await Classifier.classify()
    })
}

//gotta rework the logic here
const hourlyAggregationJob = async function() {
    agenda.define("hourly", async (job) => {
        const query = await Log.aggregate(
            [{
                $group: {
                    _id: {
                        characteristic: "$characteristic",
                        year: {
                            $year: "$created_at"
                        },
                        month: {
                            $month: "$created_at"
                        },
                        day: {
                            $dayOfMonth: "$created_at"
                        },
                        hour: {
                            $hour: "$created_at"
                        },
                    },
                    count: {
                      $sum:1
                    },
                    avgQuantity: {
                        $avg: "$value"
                    }
                }
            }]
        ).exec();
        query.forEach(log => {
            hourlyAggregation(log._id.characteristic, new Date(log._id.year, log._id.month - 1, log._id.day, log._id.hour + 1, 0, 0, 0), log.avgQuantity, log.count)
        });
        await Log.collection.drop();
    });
}

const dailyAggregationJob = async function() {
    agenda.define("daily", async (job) => {
        const query = await Hourly.aggregate(
            [{
                $group: {
                    _id: {
                        characteristic: "$characteristic",
                        year: {
                            $year: "$hour_timestamp"
                        },
                        month: {
                            $month: "$hour_timestamp"
                        },
                        day: {
                            $dayOfMonth: "$hour_timestamp"
                        }
                    },count: {
                      $sum:1
                    },                    
                    count: {
                      $sum:1
                    },
                    avgQuantity: {
                        $avg: "$hour_value"
                    }
                }
            }]
        ).sort({created_at:-1}).exec();
       const lastEntry = await Daily.findOne().sort({day_timestamp:-1}).exec();
       const today = new Date()
        query.forEach(hour => {
            var hourDate = new Date(hour._id.year, hour._id.month - 1, hour._id.day, 0, 0, 0, 0)
            if (lastEntry.day_timestamp <= hourDate && hourDate < new Date(today.getFullYear(),today.getMonth(),today.getDate(),0,0,0,0)) {
                dailyAggregation(hour._id.characteristic, hourDate, hour.avgQuantity, hour.count)    
            }
        });
   });
}


const AIAggregationJob = async function(state) {
    const lastWeek = await Daily.find().sort({day_timestamp:-1}).limit(10).exec();
    var soilValue = 0;
    var tempValue = 0;
       lastWeek.forEach(day => {
        if (day.characteristic == "SOIL") {
            soilValue += day.day_value
        }
        if(day.characteristic == "TEMP") {
            tempValue += day.day_value
        }
       });
        var text = ValueTransformer.transform(soilValue/5,tempValue/5)
        AIAggregation((text.tempValue),(text.soilValue), state)
}


async function hourlyAggregation(characteristic, date, avg, count) {
    var entry = new Hourly({
        characteristic: characteristic,
        hour_value: avg,
        hour_timestamp: date,
        log_count: count
    })
    entry.save()
}

async function dailyAggregation(characteristic, date, avg, count) {
    var entry = new Daily({
        characteristic: characteristic,
        day_value: avg,
        day_timestamp: date,
        hour_count: count
    })
    entry.save()
}

async function AIAggregation(tempValue, soilValue, state) {
    var entry = new Health({
        temp: tempValue,
        soil: soilValue,
        state: state
    })
    entry.save()
}



export default {
    dailyAggregationJob,
    hourlyAggregationJob,
    AIAggregationJob,
    startScheduler
}