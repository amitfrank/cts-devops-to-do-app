const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'example';
const mongoURI = `mongodb://${dbUser}:${dbPassword}@db:27017/todo_db?authSource=admin`;

mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => console.error('MongoDB connection error:', err));

const TodoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

TodoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Todo = mongoose.model('Todo', TodoSchema);


app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find({});
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text,
            completed: false
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const { text, completed } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { ...(text !== undefined && { text }), ...(completed !== undefined && { completed }) },
            { new: true }
        );
        
        if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.listen(PORT, () => {
    console.log(`Server running internally on port ${PORT}`);
});