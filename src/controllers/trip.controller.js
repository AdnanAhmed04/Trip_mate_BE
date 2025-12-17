const Trip = require("../models/Trip");

exports.createTrip = async (req, res) => {
  const payload = { ...req.body, userId: req.user.id };
  const trip = await Trip.create(payload);
  res.status(201).json({ trip });
};

exports.getTrips = async (req, res) => {
  const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ trips });
};

exports.getTripById = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ trip });
};

exports.updateTrip = async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ trip });
};

exports.deleteTrip = async (req, res) => {
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ ok: true });
};
