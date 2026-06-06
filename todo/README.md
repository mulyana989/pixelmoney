# To-Do List Application 📝

A modern, feature-rich to-do list application with persistent local storage. Stay organized and productive!

## Features

✨ **Core Features**
- Add tasks easily
- Mark tasks as completed
- Delete individual tasks
- Filter tasks (All, Active, Completed)
- Auto-save to browser local storage

📊 **Statistics**
- Total tasks counter
- Active tasks tracker
- Completed tasks counter
- Real-time updates

🛠️ **Utilities**
- Clear all completed tasks
- Clear entire task list
- Export tasks as JSON
- Responsive design

## How to Use

1. **Add a Task**
   - Type your task in the input field
   - Press Enter or click the "Add" button

2. **Manage Tasks**
   - Check the checkbox to mark as completed
   - Click "Delete" to remove a task
   - Click filter buttons to view specific tasks

3. **Clear Tasks**
   - **Clear Completed**: Remove only finished tasks
   - **Clear All**: Delete all tasks (confirmation required)

4. **Export**
   - Click "Export" to download tasks as JSON file
   - Useful for backup or sharing

## Installation

```bash
cd todo
open index.html

# Or use a local server
python -m http.server 8000
# Visit http://localhost:8000/todo
```

## File Structure

```
todo/
├── index.html      # HTML markup
├── styles.css      # Modern styling
├── app.js          # Application logic
└── README.md       # Documentation
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients
- **JavaScript (ES6+)** - OOP programming
- **LocalStorage API** - Data persistence

## Local Storage Details

- Storage Key: `todos_data`
- Data Type: JSON array
- Persists across browser sessions
- ~5-10MB limit

## Browser Support

✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Mobile browsers

## License

MIT - Free to use and modify

## Author

Created by mulyana989
