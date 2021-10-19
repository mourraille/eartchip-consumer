import { connect } from 'mqtt'
import dotenv from 'dotenv'
import express from 'express'
const app = express()
dotenv.config()


var client  = connect(process.env.MQTT_HOST)

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(process.env.EXPRESS_PORT, () => {
      console.log(`Earthchip v${process.env.APP_V} |  ${new Date()}`)
      console.log(`App listening at ${process.env.EXPRESS_URL}:${process.env.EXPRESS_PORT}`)
  })


client.on('connect', function () {
  client.subscribe(['init', 'temp', 'soil', 'hum'], function (err) {
    if (!err) {
        client.publish('init', `MQTT CONNECTION STABLISHED TO ${process.env.MQTT_HOST} `)
    } else  {
        console.log(`MQTT CONNECTION STABLISHED TO ${process.env.MQTT_HOST}`)
    }
})
})

client.on('message', function (topic, message) {
    switch (topic) {
        case 'init':
            console.log(message.toString())
            break;
        case 'temp':
            console.log(message.toString())
            break;
        case 'soil':
            console.log(message.toString())
            break;
        case 'hum':
            console.log(message.toString())
            break;    
        default:
            break;
    }
})

