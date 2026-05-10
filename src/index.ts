import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server da cervejaria');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});