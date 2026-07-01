const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Dynamic connection string using variables from your docker-compose environment
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'example';
const mongoURI = `mongodb://${dbUser}:${dbPassword}@db:27017/todo_db?authSource=admin`;

mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => console.error('MongoDB connection error:', err));

// 2. Define a Mongoose Schema and Model
const TodoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

// Automatically transform MongoDB's _id object to a clean string "id" when sending JSON to the frontend
TodoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Todo = mongoose.model('Todo', TodoSchema);

// --- Real CRUD Routes using Async/Await ---

// READ: Fetch from database
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find({});
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE: Save to database
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

// UPDATE: Update in database
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { text, completed } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { ...(text !== undefined && { text }), ...(completed !== undefined && { completed }) },
            { new: true } // Returns the modified document instead of the original
        );
        
        if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove from database
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