import mongoose from 'mongoose'

const schema = mongoose.Schema({
	characteristic: String,
	day_value: Number,
	day_timestamp: Date,
},
{
	timestamps: { createdAt: 'created_at'}
})

export default  mongoose.model("Daily", schema) 
