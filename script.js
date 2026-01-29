class Calculator {
    constructor(currentOperandElement, previousOperandElement) {
        this.currentOperandElement = currentOperandElement;
        this.previousOperandElement = previousOperandElement;
        this.clear();
        this.history = [];
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.resetNextInput = false; // Flag to clear input on next number entry after result
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.resetNextInput) {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.clear();

        if (this.resetNextInput) {
            this.currentOperand = '';
            this.resetNextInput = false;
        }

        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;

        // Prevent multiple leading zeroes
        if (number === '0' && this.currentOperand === '0') return;

        // If '0' is the only character and we type a non-decimal, replace '0'
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;

        if (this.previousOperand !== '') {
            if (this.resetNextInput) {
                this.operation = operation;
                return;
            }
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = this.currentOperand;
        this.resetNextInput = true;
    }

    toggleSign() {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '0') return;
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    percentage() {
        if (this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
            case '−':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }

        if (computation !== 'Error') {
            // Fix long decimals
            computation = Math.round(computation * 10000000000) / 10000000000;
            this.addToHistory(prev, this.operation, current, computation);
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.resetNextInput = true;
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);

        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    addToHistory(prev, op, current, result) {
        const entry = {
            expression: `${prev} ${op} ${current}`,
            result: result
        };
        // Add to beginning
        this.history.unshift(entry);
        // Limit to 10
        if (this.history.length > 10) this.history.pop();

        renderHistory();
    }
}


// UI State
const currentOperandText = document.querySelector('[id="current-operand"]');
const previousOperandText = document.querySelector('[id="previous-operand"]');
const calculator = new Calculator(currentOperandText, previousOperandText);

// Buttons
const numberButtons = document.querySelectorAll('[class*="btn number"]');
const operationButtons = document.querySelectorAll('[class*="btn operator"]');
const equalsButton = document.querySelector('[data-action="calculate"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const percentButton = document.querySelector('[data-action="percent"]');
const signButton = document.querySelector('[data-action="sign"]');
const backspaceBtn = document.getElementById('backspace-btn');

// Copy to Clipboard
const displayElement = document.querySelector('.display');
const customTooltip = document.getElementById('copy-tooltip');

displayElement.addEventListener('click', (e) => {
    // Prevent copy if clicking backspace
    if (e.target.closest('.backspace-btn')) return;

    const textToCopy = currentOperandText.innerText;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
        showTooltip();
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

function showTooltip() {
    customTooltip.classList.add('show');
    setTimeout(() => {
        customTooltip.classList.remove('show');
    }, 1500);
}

// Visual Button Press Feedback
function highlightButton(button) {
    if (!button) return;
    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 150);
}

function getButtonByText(text) {
    // Helper to find button by visible text
    const allBtns = document.querySelectorAll('.btn');
    for (let btn of allBtns) {
        if (btn.innerText === text) return btn;
    }
    return null;
}

function getButtonByAction(action) {
    return document.querySelector(`[data-action="${action}"]`);
}

// Event Listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

if (deleteButton) {
    deleteButton.addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });
}

if (backspaceBtn) {
    backspaceBtn.addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });
}

signButton.addEventListener('click', () => {
    calculator.toggleSign();
    calculator.updateDisplay();
});

percentButton.addEventListener('click', () => {
    calculator.percentage();
    calculator.updateDisplay();
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    let key = e.key;
    let buttonToHighlight = null;

    if (/[0-9]/.test(key)) {
        calculator.appendNumber(key);
        buttonToHighlight = getButtonByText(key);
    }
    else if (key === '.') {
        calculator.appendNumber(key);
        buttonToHighlight = getButtonByText('.');
    }
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        let op = key;
        if (op === '/') op = '÷';
        if (op === '*') op = '×';
        if (op === '-') op = '−'; // The unicode minus in HTML

        // If not found (user pressed minus on numpad), try standard minus
        calculator.chooseOperation(op);

        // Try to find the button. Note: "−" vs "-"
        buttonToHighlight = getButtonByText(op);
        if (!buttonToHighlight && op === '−') buttonToHighlight = getButtonByAction('subtract');
        if (!buttonToHighlight && op === '×') buttonToHighlight = getButtonByAction('multiply');
        if (!buttonToHighlight && op === '÷') buttonToHighlight = getButtonByAction('divide');
        if (!buttonToHighlight && op === '+') buttonToHighlight = getButtonByAction('add');
    }
    else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculator.compute();
        buttonToHighlight = equalsButton;
    }
    else if (key === 'Backspace') {
        calculator.delete();
        buttonToHighlight = backspaceBtn; // Highlight the screen backspace
    }
    else if (key === 'Escape') {
        calculator.clear();
        buttonToHighlight = clearButton;
    }
    else if (key === '%') {
        calculator.percentage();
        buttonToHighlight = percentButton;
    }

    calculator.updateDisplay();

    if (buttonToHighlight) {
        highlightButton(buttonToHighlight);
    }
});

// Theme Logic
const themeCheckbox = document.getElementById('checkbox');
const storedTheme = localStorage.getItem('theme');

if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
    if (storedTheme === 'dark') {
        themeCheckbox.checked = true;
    }
}

themeCheckbox.addEventListener('change', function () {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// History Panel Logic
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyToggle = document.getElementById('history-toggle');
const closeHistory = document.getElementById('close-history');
const overlay = document.getElementById('overlay');
const clearHistoryBtn = document.getElementById('clear-history-btn');

function toggleHistory() {
    historyPanel.classList.toggle('open');
    overlay.classList.toggle('active');
}

historyToggle.addEventListener('click', toggleHistory);
closeHistory.addEventListener('click', toggleHistory);
overlay.addEventListener('click', toggleHistory);

function renderHistory() {
    historyList.innerHTML = '';

    if (calculator.history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No history yet</div>';
        clearHistoryBtn.classList.add('hidden');
        return;
    }

    clearHistoryBtn.classList.remove('hidden');

    calculator.history.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('history-item');
        itemEl.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        `;

        itemEl.addEventListener('click', () => {
            calculator.currentOperand = item.result.toString();
            calculator.resetNextInput = true; // reusing result acts like a finished calculations
            calculator.updateDisplay();
            toggleHistory(); // Auto close on select
        });

        historyList.appendChild(itemEl);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    calculator.history = [];
    renderHistory();
});
