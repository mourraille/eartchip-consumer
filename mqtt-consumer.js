import { connect } from 'mqtt'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Log from "./models/Log.js"
import Aggregator from "./aggregator.js"

dotenv.config()

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

 Aggregator.hourlyAggregationJob()
 Aggregator.startScheduler()



