import { connect } from 'mqtt'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import Agenda from 'agenda'

dotenv.config()

//scheduler instantiation
const agenda = new Agenda({ db: { address: process.env.MONGODB} });

//mongoose instantiation
  mongoose
  .connect(process.env.MONGODB, { useNewUrlParser: true })
  .then(() => {
      //app.listen(process.env.EXPRESS_PORT, () => {
        console.log(`Earthchip v${process.env.APP_V}|  ${new Date()}`)
        console.log(`Earthchip v${process.env.APP_V}|  API listening at ${process.env.EXPRESS_URL}:${process.env.EXPRESS_PORT}`)
    //})
  })

//MQTT-consumer instantiation
 var client = 
 connect(process.env.MQTT_HOST) 
  client.on('connect', function () {
   client.subscribe(['INIT', 'TEMP', 'SOIL', 'HUM'], function (err) {
       client.publish('INIT', `ACK - ${process.env.MQTT_HOST}`)
     if (!err) {
     }
 })
 })

 client.on('message', function (topic, message) {
     var payload
     switch (topic) {
        case 'INIT':
             console.log(`${new Date().toUTCString()}: ${topic}| ${message.toString()}`)
             break;
         case 'TEMP':
             console.log(`${new Date().toUTCString()}: ${topic}| ${message.toString()}`)
             insert(payload = {characteristic:topic, value:message, timestamp:new Date()})
             break;
         case 'SOIL':
             console.log(`${new Date().toUTCString()}: ${topic}| ${message.toString()}`)
             insert(payload = {characteristic:topic, value:Number(message), timestamp:new Date()})
             break;
         case 'HUM':s
             console.log(`${new Date().toUTCString()}: ${topic}| ${message.toString()}`)
             insert(payload = {characteristic:topic, value:message, timestamp:new Date()})
             break;    
         default:
             break;
     }
 })

 //Scheduler instantiation
  async function insert(payload) {
     const entry = new Log({
 		characteristic: payload.characteristic,
        value: payload.value,
 		timestamp: payload.timestamp
 	})
 	await entry.save()
 }

 //gotta rework the logic here
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
            hour_timestamp: new Date()
        })
         entry.save()
         Log.collection.drop();
    }
    });
});

//Job creation and kickoff
   (async function () {
     await agenda.start();
     await agenda.every("59 * * * *", "hourly");
   })();

