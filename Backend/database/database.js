const mongoose = require('mongoose');
const dns = require('dns');

// Configure custom DNS servers to resolve MongoDB SRV records (fixes querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '1.1.1.1']);

 const connectDB=()=>{

    mongoose.connect(process.env.DB_URI).then(()=>console.log("Database connected"))
    .catch((err)=>console.log(err))
    
} 
    module.exports={connectDB}