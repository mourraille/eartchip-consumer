import { connect } from 'mqtt'
import dotenv from 'dotenv'
dotenv.config()

var client  = connect(process.env.MQTT_HOST)

client.on('connect', function () {
  client.subscribe(['init', 'temp', 'soil', 'hum'], function (err) {
    if (!err) {
      client.publish('init', "Earthchip v" + process.env.APP_V + " | "+ new Date() )
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

