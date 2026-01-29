# Modern Calculator

A premium, responsive Calculator web application built with vanilla HTML, CSS, and JavaScript. Designed for optimal user experience with a clean UI, mobile-first approach, and keyboard support.

![Calculator Screenshot](./screenshot-placeholder.png)

## Features

- **Core Operations**: Addition, Subtraction, Multiplication, Division.
- **Advanced Functions**: Percentage (%), Toggle Sign (±), Clear (C), Backspace (⌫).
- **Responsive Design**: Mobile-first layout that adapts seamlessly to desktop.
- **Theme Support**: Light and Dark mode toggle with local storage persistence.
- **History**: view last 10 calculations, click to reuse results.
- **Validation**: Prevents invalid inputs (e.g., divide by zero, multiple decimals).
- **Accessibility**: Keyboard navigation and focus states.

## Keyboard Shortcuts

| Key | Action |
|:---:|:---|
| `0` - `9` | Enter numbers |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Operations (Note: `*` = ×, `/` = ÷) |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit |
| `Escape` | Clear all (C) |
| `%` | Percentage |

## How to Run

1. **Clone or Download** the repository.
2. Open `index.html` in any modern web browser.
   - Simply double-click the file, or use a local dev server (e.g., Live Server in VS Code).
3. Enjoy!

## Project Structure

```
├── index.html      # Main structure
├── style.css       # Styling & Theme variables
├── script.js       # Logic & DOM manipulation
└── README.md       # Documentation
```

## Technologies

- **HTML5**: Semantic structure.
- **CSS3**: Variables, Flexbox, Grid, Glassmorphism effects.
- **JavaScript (ES6+)**: Event handling, Calculator class logic.
- **Fonts**: 'Lato' from Google Fonts.
