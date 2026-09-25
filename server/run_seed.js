import "./src/config/database.js";
import mongoose from "mongoose";
import Service from "../src/models/Service.js";

async function main() {
  await mongoose.connect("mongodb+srv://Gentleman:Gentleman@cluster0.9mra52g.mongodb.net/?appName=Cluster0");
  await Service.deleteMany({});
  await Service.insertMany([
    { name: "Classic Gentlemen's Cut", price: 7000, durationMinutes: 45, active: true },
    { name: "Skin Fade", price: 8500, durationMinutes: 60, active: true }
  ]);
  console.log("Seeding complete");
  await mongoose.connection.close();
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });