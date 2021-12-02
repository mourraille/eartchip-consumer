import mongoose from 'mongoose'

const schema = mongoose.Schema({
	characteristic: String,
	hour_value: Number,
	hour_timestamp: Date,
	log_count: Number
},
{
	timestamps: { createdAt: 'created_at'}
})

export default  mongoose.model("Hourly", schema) 
