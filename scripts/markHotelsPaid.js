require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("../src/models/Hotel");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await Hotel.updateMany(
    { paid: { $ne: true } },
    { $set: { paid: true, status: "approved" } }
  );
  console.log("Updated seeded hotels:", result.modifiedCount);
  process.exit(0);
});
