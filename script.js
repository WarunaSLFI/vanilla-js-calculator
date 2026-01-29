/**
 * Calculator Business Logic
 */
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
        this.resetNextInput = false;
    }

    delete() {
        if (this.currentOperand === 'Error' || this.resetNextInput) {
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

        // Validation: Prevent invalid formats
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (number === '0' && this.currentOperand === '0') return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;

        // Allow seamless operator switching
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
        if (this.currentOperand === 'Error' || this.currentOperand === '0') return;

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
            case '−': // Handle Unicode minus from UI
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
            // Precision handling for floating point errors
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
        const [integerDigits, decimalDigits] = stringNumber.split('.');
        const parsedInteger = parseFloat(integerDigits);

        let integerDisplay = isNaN(parsedInteger) ? '' : parsedInteger.toLocaleString('en', { maximumFractionDigits: 0 });

        return decimalDigits != null ? `${integerDisplay}.${decimalDigits}` : integerDisplay;
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

        this.history.unshift(entry);
        if (this.history.length > 10) this.history.pop();
        renderHistory();
    }
}

/* -------------------------------------------------------------------------- */
/*                            Initialization & DOM                            */
/* -------------------------------------------------------------------------- */
const currentOperandText = document.getElementById('current-operand');
const previousOperandText = document.getElementById('previous-operand');
const calculator = new Calculator(currentOperandText, previousOperandText);

// Control Elements
const elements = {
    numbers: document.querySelectorAll('[class*="btn number"]'),
    operators: document.querySelectorAll('[class*="btn operator"]'),
    equals: document.querySelector('[data-action="calculate"]'),
    clear: document.querySelector('[data-action="clear"]'),
    delete: document.querySelector('[data-action="delete"]'),
    percent: document.querySelector('[data-action="percent"]'),
    sign: document.querySelector('[data-action="sign"]'),
    backspace: document.getElementById('backspace-btn'),
    display: document.querySelector('.display'),
    themeCheckbox: document.getElementById('checkbox')
};

/* -------------------------------------------------------------------------- */
/*                               Event Listeners                              */
/* -------------------------------------------------------------------------- */

// Numbers & Operators
elements.numbers.forEach(btn => {
    btn.addEventListener('click', () => {
        calculator.appendNumber(btn.innerText);
        calculator.updateDisplay();
    });
});

elements.operators.forEach(btn => {
    btn.addEventListener('click', () => {
        calculator.chooseOperation(btn.innerText);
        calculator.updateDisplay();
    });
});

// Actions
elements.equals.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

elements.clear.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

elements.sign.addEventListener('click', () => {
    calculator.toggleSign();
    calculator.updateDisplay();
});

elements.percent.addEventListener('click', () => {
    calculator.percentage();
    calculator.updateDisplay();
});

if (elements.backspace) {
    elements.backspace.addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });
}

// Copy to Clipboard Support
const customTooltip = document.getElementById('copy-tooltip');

elements.display.addEventListener('click', (e) => {
    if (e.target.closest('.backspace-btn')) return;

    const textToCopy = currentOperandText.innerText;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy)
        .then(() => showTooltip())
        .catch(err => console.error('Copy failed:', err));
});

function showTooltip() {
    customTooltip.classList.add('show');
    setTimeout(() => customTooltip.classList.remove('show'), 1500);
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    let buttonToHighlight = null;

    if (/[0-9]/.test(key)) {
        calculator.appendNumber(key);
        buttonToHighlight = getButtonByText(key);
    }
    else if (key === '.') {
        calculator.appendNumber(key);
        buttonToHighlight = getButtonByText('.');
    }
    else if (['+', '-', '*', '/'].includes(key)) {
        let op = key;
        if (op === '/') op = '÷';
        if (op === '*') op = '×';
        if (op === '-') op = '−';

        calculator.chooseOperation(op);

        // Map keyboard keys to UI buttons
        buttonToHighlight = getButtonByText(op);
        if (!buttonToHighlight) {
            const map = { '−': 'subtract', '×': 'multiply', '÷': 'divide', '+': 'add' };
            if (map[op]) buttonToHighlight = document.querySelector(`[data-action="${map[op]}"]`);
        }
    }
    else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculator.compute();
        buttonToHighlight = elements.equals;
    }
    else if (key === 'Backspace') {
        calculator.delete();
        buttonToHighlight = elements.backspace;
    }
    else if (key === 'Escape') {
        calculator.clear();
        buttonToHighlight = elements.clear;
    }
    else if (key === '%') {
        calculator.percentage();
        buttonToHighlight = elements.percent;
    }

    calculator.updateDisplay();

    if (buttonToHighlight) highlightButton(buttonToHighlight);
});

function highlightButton(button) {
    if (!button) return;
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 150);
}

function getButtonByText(text) {
    return Array.from(document.querySelectorAll('.btn')).find(btn => btn.innerText === text);
}

/* -------------------------------------------------------------------------- */
/*                               Theme Persistence                            */
/* -------------------------------------------------------------------------- */
const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
    elements.themeCheckbox.checked = storedTheme === 'dark';
}

elements.themeCheckbox.addEventListener('change', function () {
    const theme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

/* -------------------------------------------------------------------------- */
/*                               History Panel                                */
/* -------------------------------------------------------------------------- */
const historyElements = {
    panel: document.getElementById('history-panel'),
    list: document.getElementById('history-list'),
    toggle: document.getElementById('history-toggle'),
    close: document.getElementById('close-history'),
    overlay: document.getElementById('overlay'),
    clearBtn: document.getElementById('clear-history-btn')
};

function toggleHistory() {
    historyElements.panel.classList.toggle('open');
    historyElements.overlay.classList.toggle('active');
}

[historyElements.toggle, historyElements.close, historyElements.overlay].forEach(el => {
    el.addEventListener('click', toggleHistory);
});

function renderHistory() {
    historyElements.list.innerHTML = '';

    if (calculator.history.length === 0) {
        historyElements.list.innerHTML = '<div class="empty-state">No history yet</div>';
        historyElements.clearBtn.classList.add('hidden');
        return;
    }

    historyElements.clearBtn.classList.remove('hidden');

    calculator.history.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('history-item');
        itemEl.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        `;

        itemEl.addEventListener('click', () => {
            calculator.currentOperand = item.result.toString();
            calculator.resetNextInput = true;
            calculator.updateDisplay();
            toggleHistory();
        });

        historyElements.list.appendChild(itemEl);
    });
}

historyElements.clearBtn.addEventListener('click', () => {
    calculator.history = [];
    renderHistory();
});
