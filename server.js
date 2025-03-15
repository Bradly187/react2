const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert'); // Required for serving static files
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Ensure the uploads directory exists
fs.ensureDirSync(path.join(__dirname, 'uploads'));

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'], // Allows frontend to access backend API
            },
        },
    });

    // Register the Inert plugin for serving static files
    await server.register(Inert);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');

    // Define MongoDB Schema & Model
    const DataSchema = new mongoose.Schema({
        filePath: String, // Store file path in DB
    });

    const Data = mongoose.model('Data', DataSchema);

    // Define Routes
    server.route([
        // Fetch All Uploaded Files from MongoDB
        {
            method: 'GET',
            path: '/api/data',
            handler: async () => {
                try {
                    return await Data.find();
                } catch (error) {
                    console.error('Error fetching data:', error);
                    return { error: 'Error retrieving data' };
                }
            }
        },

        // Upload a File
        {
            method: 'POST',
            path: '/api/upload',
            options: {
                payload: {
                    output: 'stream',
                    parse: true,
                    allow: 'multipart/form-data',
                    maxBytes: 10485760, // 10MB max file size
                }
            },
            handler: async (request, h) => {
                try {
                    const { file } = request.payload;
                    
                    if (!file) {
                        return h.response({ error: 'File is required' }).code(400);
                    }

                    const filename = `${Date.now()}-${file.hapi.filename}`;
                    const filepath = path.join(__dirname, 'uploads', filename);

                    const fileStream = fs.createWriteStream(filepath);
                    await new Promise((resolve, reject) => {
                        file.pipe(fileStream);
                        file.on('end', resolve);
                        file.on('error', reject);
                    });

                    // Save file path to MongoDB
                    const newData = new Data({ filePath: `/uploads/${filename}` });
                    await newData.save();

                    return h.response({ 
                        message: 'File uploaded successfully!', 
                        filePath: `/uploads/${filename}` 
                    }).code(201);
                } catch (error) {
                    console.error('Upload error:', error);
                    return h.response({ error: 'File upload failed' }).code(500);
                }
            }
        },

        // Serve Uploaded Files
        {
            method: 'GET',
            path: '/uploads/{filename}',
            handler: (request, h) => {
                const { filename } = request.params;
                const filepath = path.join(__dirname, 'uploads', filename);
                
                if (!fs.existsSync(filepath)) {
                    return h.response({ error: 'File not found' }).code(404);
                }
                
                return h.file(filepath);
            }
        }
    ]);

    // Start the Server
    await server.start();
    console.log(`🚀 Server running on ${server.info.uri}`);
};

// Handle Server Start Errors
init().catch(err => {
    console.error('Server start error:', err);
});
