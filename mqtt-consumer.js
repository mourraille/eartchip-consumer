import { connect } from 'mqtt'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import Aggregator from "./aggregator.js"
import express from "express"
import { create } from 'express-handlebars';

dotenv.config()
const app = express();

const hbs = create({ extname: '.hbs', defaultLayout: "main" });
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs'); 

app.use(express.static(process.cwd() + '/public'));

//mongoose instantiation
  await mongoose
  .connect(process.env.MONGODB, { useNewUrlParser: true })
  .then(() => {
      app.listen(process.env.EXPRESS_PORT, () => {
        console.log(`Earthchip v${process.env.APP_V}|  ${new Date()}`)
        console.log(`Earthchip v${process.env.APP_V}|  API listening at ${process.env.EXPRESS_URL}:${process.env.EXPRESS_PORT}`)
    })
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

 //MQTT-consumer parser to mongo documents
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

 //Aggregator instantiation
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

 //pulse render 
 app.get("/pulse", (req, res) => {
    try {
        let _temp = 0;
        var _soil = 0;
         Log.findOne({'characteristic':'TEMP'}, {}, { sort: { 'created_at' : -1 } }, function(err, temp) {
            _temp = temp.value;
            Log.findOne({'characteristic':'SOIL'}, {}, { sort: { 'created_at' : -1 } }, function(err, soil) {
                _soil = soil.value;
                res.send({"soil":_soil,"temp":_temp})
            })
        })
      } catch (error) {
        console.error(error);
      }
})

//main route render 
 app.get("/", (req, res) => {
    try {
        let _temp = 0;
        var _soil = 0;
         Log.findOne({'characteristic':'TEMP'}, {}, { sort: { 'created_at' : -1 } }, function(err, post) {
            _temp = post.value;
            Log.findOne({'characteristic':'SOIL'}, {}, { sort: { 'created_at' : -1 } }, function(err, post) {
                _soil = post.value
                Hourly.find({characteristic: "SOIL"}).sort({hour_timestamp:-1}).limit(24).exec(function(err, posts) {
                    var soilValues = []
                    var soilDates = []
                    posts.forEach(post => {
                        soilValues.push(post.hour_value)
                        soilDates.push(Date.parse(post.hour_timestamp))
                    });
                    Hourly.find({characteristic: "TEMP"}).sort({hour_timestamp:-1}).limit(24).exec(function(err, temps) {
                        var tempValues = []
                        var tempDates = []
                        temps.forEach(temp => {
                            tempValues.push(temp.hour_value)
                            tempDates.push(Date.parse(temp.hour_timestamp))
                        });
                        res.render('home', {
                            home: { 
                                temp: _temp,
                                soil: _soil
                            },
                            soilValues,
                            soilDates,
                            tempValues,
                            tempDates
                        });
                    })
               });
            })
          });  
    } catch (error) {
        
    }
});
