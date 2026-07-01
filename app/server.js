const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON and serve static frontend files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory "database"
let todos = [
    { id: 1, text: 'Learn Node.js CRUD', completed: false },
    { id: 2, text: 'Build a kickass UI', completed: true }
];

// READ: Get all todos
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// CREATE: Add a new todo
app.post('/api/todos', (req, res) => {
    const newTodo = {
        id: Date.now(), // Simple unique ID
        text: req.body.text,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// UPDATE: Toggle completed status or update text
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;
    
    const todo = todos.find(t => t.id === parseInt(id));
    
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;

    res.json(todo);
});

// DELETE: Remove a todo
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(t => t.id !== parseInt(id));
    res.json({ message: 'Todo deleted successfully' });
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});