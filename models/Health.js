import mongoose from 'mongoose'

const schema = mongoose.Schema({
	temp: String,
	soil: String,
	timestamp: Date,
    state: String
},
{
	timestamps: { createdAt: 'created_at'}
})
export default  mongoose.model("Health", schema) 
