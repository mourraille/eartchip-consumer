import { connect } from 'mqtt'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Log from "./models/Log.js"
import Hourly from "./models/Hourly.js"
import Aggregator from "./aggregator.js"
import Classifier from "./classifier.js"
import ValueTransformer from "./valueLanguageProcessor.js"
import express from "express"
import { create } from 'express-handlebars';
const TOPICS = ['INIT','SOIL','HUM','TEMP']

dotenv.config()
const app = express();

const hbs = create({ extname: '.hbs', defaultLayout: "main" });
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs'); 
app.use(express.json())
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
 connect(process.env.MQTT_IP) 
  client.on('connect', function () {
   client.subscribe(TOPICS, function (err) {
       client.publish('INIT', `ACK - ${process.env.MQTT_IP}`)
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

  async function insert(payload) {
     const entry = new Log({
 		characteristic: payload.characteristic,
        value: payload.value,
 		timestamp: payload.timestamp
 	})
 	await entry.save()
 }
 
 //Aggregator instantiation
 Aggregator.startScheduler()
Classifier.classify()

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

 //AI service endpoint
 app.post("/health", async (req, res) => {
    try {
        var value = 0;
        var state = req.body.state.toUpperCase()
        if(state.includes("GOOD")){ value = "Healthy" }
        if(state.includes("OKAY")){ value = "Regular" }
        if(state.includes("BAD")) { value = "Unhealthy" }
       await Aggregator.AIAggregationJob(value)
        res.status(204).send('Value added, thanks')
      } catch (error) {
        res.status(500).send('An error occured sorry')
      }
})

//main route render 
 app.get("/", async (req, res) => {
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
                        var text = ValueTransformer.transform(_soil,_temp)
                        var _state =  Classifier.rate(text.tempValue,text.soilValue)
                        res.render('home', {
                            home: { 
                                temp: _temp,
                                soil: _soil,
                                state: _state
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
