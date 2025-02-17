import { Pool, PoolConnection } from "mariadb";
import dotenv from "dotenv";
import { membersData } from "./data";

dotenv.config();

const mariadb = import("mariadb");
let pool: Pool;
async function init() {
  console.log(process.env.DB_USER);
  pool = (await mariadb).createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });
}

async function asyncFunction() {
  const insMembers: string =
    "INSERT INTO members (user_id, gender, dob, description, city, country) value (?, ?, ?, ?, ?, ?)";

  const insPhotos: string = "insert into photos(member_id, link) values(?, ?)";
  let conn;
  try {
    conn = await pool.getConnection();

    for (let i = 0; i < membersData.length; i++) {
      const mem = membersData[i];
      const res = await conn.query(insMembers, [
        mem.userId,
        mem.gender,
        mem.dateOfBirth,
        mem.description,
        mem.city,
        mem.country,
      ]);

      console.log(res);

      if (mem.image) {
        const res2 = await conn.query(insPhotos, [res.insertId, mem.image]);
      }
    }
  } finally {
    if (conn) conn.release(); //release to pool
  }
}

async function main() {
  try {
    await init();
    const res = await asyncFunction();
  } catch (error) {
    console.log("error", error);
  } finally {
    await pool.end();
    console.log("pool closed");
  }
}

main().catch((error) => console.log(error));
