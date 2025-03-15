const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    filePath: String, // Store file path
});

module.exports = mongoose.model('Data', DataSchema);
