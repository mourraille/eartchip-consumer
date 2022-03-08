import mongoose from 'mongoose'

const schema = mongoose.Schema({
	characteristic: String,
	value: Number
},
{
	timestamps: { createdAt: 'created_at'}
})

export default mongoose.model("Log", schema) 
