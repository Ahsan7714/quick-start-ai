const mongoose = require('mongoose');
const dns = require('dns');

try {
  // Only configure custom DNS locally; Vercel handles SRV resolution natively
  if (!process.env.VERCEL) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (err) {
  console.warn("DNS custom servers not configured:", err);
}

 const connectDB=()=>{

    mongoose.connect(process.env.DB_URI).then(()=>console.log("Database connected"))
    .catch((err)=>console.log(err))
    
} 
    module.exports={connectDB}