import {mongoose} from 'mongoose'

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    permissionLevel: Number
 });

