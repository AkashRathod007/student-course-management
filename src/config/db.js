import {Pool} from 'pg'
import dotenv from 'dotenv'

dotenv.config()



const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl:false,
    max:10,
    idleTimeoutMillis:30000,
    connectionTimeoutMillis:5000

})

const  connectDB = async()=>{

    try {
        const client = await pool.connect();
        console.log("Postgrahsql is connected successfully")
        client.release()
    } catch (error) {
        console.error("❌ Neon connection failed:", error.message);
    process.exit(1);
    }
}

pool.on("error", (err) => {
  console.error("❌ Unexpected PG pool error", err);
  process.exit(1);
});

export {connectDB , pool}

