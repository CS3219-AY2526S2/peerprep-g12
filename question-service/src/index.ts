import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import topicRoutes from './routes/topics';
import questionRoutes from './routes/questions';
import internalRoutes from './routes/internal';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

//Health check 
app.get('/health', (req, res) => {
    res.status(200).json({status: 'Question Service is running'})
});

//Routes
app.use('/topics', topicRoutes); 
app.use('/questions', questionRoutes);
app.use('/internal', internalRoutes);


app.listen(PORT, () => {
    console.log(`Question Service running on port ${PORT}`);
});

export default app;