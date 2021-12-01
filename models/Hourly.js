import mongoose from 'mongoose'

const schema = mongoose.Schema({
	characteristic: String,
	hour_value: Number,
	hour_timestamp: Date,
},
{
	timestamps: { createdAt: 'created_at'}
})

export default  mongoose.model("Hourly", schema) 
