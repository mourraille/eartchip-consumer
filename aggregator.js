import Agenda from 'agenda'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import Daily from "./models/Daily.js"
import dotenv from 'dotenv'
dotenv.config()

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB
    }
});

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
        ).exec();
       const lastEntryDate = await Daily.findOne().sort({day_timestamp:-1}).exec();
        query.forEach(hour => {
            var hourDate = new Date(hour._id.year, hour._id.month - 1, hour._id.day, 0, 0, 0, 0)
            if (hourDate > lastEntryDate) {
                dailyAggregation(hour._id.characteristic, hourDate, hour.avgQuantity, hour.count)    
            }
        });
        //await Hourly.collection.drop();
    });
}

//Job creation and kickoff
const startScheduler = async function() {
    await agenda.start();
    await hourlyAggregationJob();
    await dailyAggregationJob();
    await agenda.every("00 * * * *", "hourly");
    await agenda.every("53 * * * *", "daily");
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
    console.log(entry)
    entry.save()
}

export default {
    dailyAggregationJob,
    hourlyAggregationJob,
    startScheduler
}