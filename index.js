import express from 'express';
import { connectDB } from './src/common/config/db';
import cors from 'cors';



async function startServerAndDatabase() {
    
    try {

        await connectDB()
        console.log('Connected to MongoDB');


        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors())

        app.get('/', (req, res) => {
            res.send('Hello World!');
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the Database:', error);
        process.exit(1);
    }
}

startServerAndDatabase()