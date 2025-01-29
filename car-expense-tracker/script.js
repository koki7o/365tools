// Initialize expenses array from localStorage or empty array if none exists
let expenses = JSON.parse(localStorage.getItem('carExpenses')) || [];

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const filterType = document.getElementById('filterType');
const filterMonth = document.getElementById('filterMonth');

// Statistics Elements
const totalExpensesEl = document.getElementById('totalExpenses');
const monthExpensesEl = document.getElementById('monthExpenses');
const averageExpensesEl = document.getElementById('averageExpenses');
const totalDistanceEl = document.getElementById('totalDistance');

// Set today's date as the default date
document.getElementById('date').valueAsDate = new Date();

// Add expense form submission handler
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const expense = {
        id: Date.now(),
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        mileage: parseFloat(document.getElementById('mileage').value),
        notes: document.getElementById('notes').value
    };

    expenses.push(expense);
    saveExpenses();
    updateUI();
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
});

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem('carExpenses', JSON.stringify(expenses));
}

// Update statistics
function updateStatistics() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalExpensesEl.textContent = formatCurrency(total);

    const now = new Date();
    const thisMonth = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && 
               expDate.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);
    monthExpensesEl.textContent = formatCurrency(monthTotal);

    const months = getMonthsBetweenDates();
    const average = months > 0 ? total / months : total;
    averageExpensesEl.textContent = formatCurrency(average);

    const maxMileage = Math.max(...expenses.map(exp => exp.mileage));
    const minMileage = Math.min(...expenses.map(exp => exp.mileage));
    const totalDistance = maxMileage - minMileage;
    totalDistanceEl.textContent = `${totalDistance.toLocaleString()} km`;
}

// Calculate months between first and last expense
function getMonthsBetweenDates() {
    if (expenses.length < 2) return 0;
    
    const dates = expenses.map(exp => new Date(exp.date));
    const firstDate = new Date(Math.min(...dates));
    const lastDate = new Date(Math.max(...dates));
    
    return (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
           (lastDate.getMonth() - firstDate.getMonth()) + 1;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Update expense list
function updateExpenseList() {
    const filteredExpenses = filterExpenses();
    expenseList.innerHTML = '';

    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(expense => {
            const expenseEl = document.createElement('div');
            expenseEl.className = 'expense-item';
            expenseEl.innerHTML = `
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-details">
                    <div class="expense-type">${expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}</div>
                    <div class="expense-notes">${expense.notes || 'No notes'}</div>
                    <div>Mileage: ${expense.mileage.toLocaleString()} km</div>
                </div>
                <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.backgroundColor = '#e74c3c';
            deleteBtn.style.marginTop = '10px';
            deleteBtn.onclick = () => deleteExpense(expense.id);
            expenseEl.appendChild(deleteBtn);

            expenseList.appendChild(expenseEl);
        });
}

// Filter expenses based on selected filters
function filterExpenses() {
    return expenses.filter(expense => {
        const typeMatch = filterType.value === 'all' || expense.type === filterType.value;
        const monthMatch = filterMonth.value === 'all' || isWithinMonths(expense.date, parseInt(filterMonth.value));
        return typeMatch && monthMatch;
    });
}

// Check if date is within specified months from now
function isWithinMonths(dateStr, months) {
    const date = new Date(dateStr);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 +
                      (now.getMonth() - date.getMonth());
    return monthsDiff <= months;
}

// Format date for display
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        updateUI();
    }
}

// Update all UI elements
function updateUI() {
    updateStatistics();
    updateExpenseList();
}

// Add filter change handlers
filterType.addEventListener('change', updateExpenseList);
filterMonth.addEventListener('change', updateExpenseList);

// Initial UI update
updateUI();
