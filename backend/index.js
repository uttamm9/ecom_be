const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRouter = require('./routers/userRouter');
const supplierRouter = require('./routers/supplierRouter');
const fileupload = require('express-fileupload');
app.use(fileupload());

const port = process.env.PORT || 3000;
const mongo_url = process.env.mongo_URL || 'mongodb://localhost:27017/mydatabase';

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());


mongoose.connect(mongo_url)
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
});

app.use('/user',userRouter);
app.use('/supplier',supplierRouter);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})