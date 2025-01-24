import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { generateCodeWithCache, debounceCodeGeneration } from "../src/utils/codeGeneration";

const apiKey = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 0.7, // Reduced for more focused outputs
  topP: 0.8, // Reduced for faster generation
  topK: 20, // Reduced for faster responses
  maxOutputTokens: 4096, // Reduced to optimize response time
  responseMimeType: "text/plain",
};

const CodeGenerationConfig = {
  temperature: 0.7, // Reduced for more consistent code generation
  topP: 0.8, // Reduced for faster generation
  topK: 20, // Reduced for faster responses
  maxOutputTokens: 4096, // Reduced to optimize response time
  responseMimeType: "application/json",
};

const generateCodeWithAI = async (prompt) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000); // Extended timeout to 55 seconds

  try {
    const chat = model.startChat({
      generationConfig: {
        ...CodeGenerationConfig,
        streamingEnabled: true, // Enable streaming
      },
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You are a code generator assistant. Generate code based on the following schema:\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"filename\": {\n      \"code\": \"\"\n    }\n  },\n  \"generatedFiles\": []\n}\nKeep the code concise and efficient. Use Tailwind CSS for styling and only use necessary lucide-react icons."
            }
          ]
        }
      ],
    });

    const result = await chat.sendMessageStream(prompt, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    let fullResponse = '';
    for await (const chunk of result) {
      fullResponse += chunk.text();
    }
    
    return fullResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Code generation timed out after 55 seconds. Please try again with a simpler prompt.');
    }
    throw error;
  }
};

export const optimizedCodeGeneration = debounceCodeGeneration(
  (prompt) => generateCodeWithCache(prompt, generateCodeWithAI)
);

export const chatSession = model.startChat({
  generationConfig,
  history: [
  ],
});

export const GenAiCode = model.startChat({
  generationConfig : CodeGenerationConfig,
  history: [
    {
      role: "user",
      parts: [
        {text: "You are a code generator assistant. Generate code based on the following schema:\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"filename\": {\n      \"code\": \"\"\n    }\n  },\n  \"generatedFiles\": []\n}\nKeep the code concise and efficient. Use Tailwind CSS for styling and only use necessary lucide-react icons."},
      ],
    },
    {
      role: "model",
      parts: [
        {text: "```json\n{\n  \"projectTitle\": \"Interactive Todo App\",\n  \"explanation\": \"This project creates a fully featured interactive todo application using React and Tailwind CSS. It includes components for managing tasks, filtering them, and providing a clean user experience. The app allows users to add new todos, mark them as complete, edit existing todos, delete todos, and filter based on task completion status. The design is responsive and user-friendly, with icons from 'lucide-react' enhancing the interface.\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"import React from 'react';\\nimport TodoList from './components/TodoList';\\nimport './index.css';\\n\\nfunction App() {\\n  return (\\n    <div className=\\\"min-h-screen bg-gray-100 flex items-center justify-center py-10\\\">\\n      <div className=\\\"bg-white shadow-xl rounded-lg p-6 w-full max-w-2xl\\\">\\n        <h1 className=\\\"text-3xl font-bold text-gray-800 mb-6 text-center\\\">✨ Todo App ✨</h1>\\n        <TodoList />\\n      </div>\\n    </div>\\n  );\\n}\\n\\nexport default App;\"\n    },\n    \"/components/TodoList.js\": {\n      \"code\": \"import React, { useState, useEffect } from 'react';\\nimport TodoItem from './TodoItem';\\nimport { Plus } from 'lucide-react';\\n\\nconst TodoList = () => {\\n  const [todos, setTodos] = useState(() => {\\n      const savedTodos = localStorage.getItem('todos');\\n      if (savedTodos) {\\n        return JSON.parse(savedTodos);\\n      } else {\\n        return [];\\n      }\\n    });\\n  const [newTodo, setNewTodo] = useState('');\\n  const [filter, setFilter] = useState('all');\\n  const [editTodoId, setEditTodoId] = useState(null);\\n  const [editTodoText, setEditTodoText] = useState('');\\n\\n   useEffect(() => {\\n    localStorage.setItem('todos', JSON.stringify(todos));\\n  }, [todos]);\\n\\n  const handleAddTodo = () => {\\n    if (newTodo.trim() !== '') {\\n      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);\\n      setNewTodo('');\\n    }\\n  };\\n\\n  const handleToggleComplete = (id) => {\\n    setTodos(todos.map(todo =>\\n      todo.id === id ? { ...todo, completed: !todo.completed } : todo\\n    ));\\n  };\\n\\n  const handleDeleteTodo = (id) => {\\n    setTodos(todos.filter(todo => todo.id !== id));\\n  };\\n\\n    const handleEditTodo = (id, text) => {\\n        setEditTodoId(id);\\n        setEditTodoText(text);\\n    };\\n\\n  const handleUpdateTodo = () => {\\n        if (editTodoText.trim() !== '') {\\n          setTodos(todos.map(todo =>\\n                todo.id === editTodoId ? { ...todo, text: editTodoText } : todo\\n            ));\\n            setEditTodoId(null);\\n            setEditTodoText('');\\n        }\\n  };\\n\\n    const handleCancelEdit = () => {\\n      setEditTodoId(null);\\n      setEditTodoText('');\\n    };\\n\\n  const filteredTodos = todos.filter(todo => {\\n    if (filter === 'completed') return todo.completed;\\n    if (filter === 'active') return !todo.completed;\\n    return true;\\n  });\\n\\n  return (\\n    <div>\\n      <div className=\\\"flex space-x-2 mb-4\\\">\\n        <input\\n          type=\\\"text\\\"\\n          placeholder=\\\"Add a new todo...\\\"          value={newTodo}\\n          onChange={(e) => setNewTodo(e.target.value)}\\n          className=\\\"flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500\\\"        />\\n        <button onClick={handleAddTodo} className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'>\\n            <Plus className='h-4 w-4'/>\\n        </button>\\n      </div>\\n      <div className=\\\"mb-4 flex space-x-2\\\">\\n        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded  ${filter === 'all' ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}>All</button>\\n        <button onClick={() => setFilter('active')} className={`px-3 py-1 rounded  ${filter === 'active' ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}>Active</button>\\n        <button onClick={() => setFilter('completed')} className={`px-3 py-1 rounded  ${filter === 'completed' ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}>Completed</button>\\n      </div>\\n      <ul className=\\\"space-y-2\\\">\\n        {filteredTodos.map(todo => (\\n            <TodoItem\\n            key={todo.id}\\n            todo={todo}\\n            onToggleComplete={handleToggleComplete}\\n            onDeleteTodo={handleDeleteTodo}\\n            onEditTodo={handleEditTodo}\\n            isEditing={editTodoId === todo.id}\\n            editTodoText={editTodoText}\\n            setEditTodoText={setEditTodoText}\\n            onUpdateTodo={handleUpdateTodo}\\n            onCancelEdit={handleCancelEdit}\\n          />\\n        ))}\\n      </ul>\\n    </div>\\n  );\\n};\\n\\nexport default TodoList;\"\n    },\n    \"/components/TodoItem.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport { Trash, Edit, Check, X } from 'lucide-react';\\n\\nconst TodoItem = ({ todo, onToggleComplete, onDeleteTodo, onEditTodo, isEditing, editTodoText, setEditTodoText, onUpdateTodo, onCancelEdit }) => {\\n\\n  return (\\n        <li className=\\\"flex items-center justify-between p-3 border rounded bg-gray-50 shadow\\\">\\n            {isEditing ? (\\n                <div className='flex-1 space-x-2'>\\n                    <input\\n                        type=\\\"text\\\"\\n                        value={editTodoText}\\n                        onChange={(e) => setEditTodoText(e.target.value)}\\n                        className=\\\"flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500\\\"\\n                    />\\n                    <button onClick={onUpdateTodo} className='bg-green-500 hover:bg-green-600 text-white p-1 rounded'><Check className='h-4 w-4'/></button>\\n                    <button onClick={onCancelEdit} className='bg-red-500 hover:bg-red-600 text-white p-1 rounded'><X className='h-4 w-4'/></button>\\n                </div>\\n            ) : (\\n               <div className='flex-1 flex items-center space-x-2'>\\n                    <input type=\\\"checkbox\\\" checked={todo.completed} onChange={() => onToggleComplete(todo.id)} className='mr-2'/>\\n                 <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.text}</span>\\n                </div>\\n            )}\\n             <div className='space-x-2'>\\n               {!isEditing && <button onClick={() => onEditTodo(todo.id, todo.text)} className='bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded'><Edit className='h-4 w-4'/></button>}\\n                <button onClick={() => onDeleteTodo(todo.id)} className='bg-red-500 hover:bg-red-600 text-white p-1 rounded'><Trash className='h-4 w-4'/></button>\\n             </div>\\n\\n        </li>\\n  );\\n};\\n\\nexport default TodoItem;\"\n    },\n        \"/index.css\": {\n      \"code\": \"@tailwind base;\\n@tailwind components;\\n@tailwind utilities;\"\n    },\n    \"/tailwind.config.js\": {\n      \"code\": \"/** @type {import('tailwindcss').Config} */\\nmodule.exports = {\\n  content: [\\n    \\\"./src/**/*.{js,jsx,ts,tsx}\\\",\\n    \\\"./components/**/*.{js,jsx,ts,tsx}\\\"\\n  ],\\n  theme: {\\n    extend: {},\\n  },\\n  plugins: [],\\n}\"\n    }\n  },\n  \"generatedFiles\": [\n    \"/App.js\",\n    \"/components/TodoList.js\",\n    \"/components/TodoItem.js\",\n    \"/index.css\",\n    \"/tailwind.config.js\"\n  ]\n}\n```\n"},
          ],
        },
      ],
    });