const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const transactionType = document.getElementById('transaction-type');
const customTransaction = document.getElementById('custom-transaction');

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));

let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

transactionType.addEventListener('change', () => {
    if (transactionType.value === 'others') {
        customTransaction.style.display = 'block';
    } else {
        customTransaction.style.display = 'none';
        text.value = '';
    }
});

function addTransaction(e) {
    e.preventDefault();

    let transactionText = transactionType.value === 'others' ? text.value.trim() : transactionType.options[transactionType.selectedIndex].text;
    let transactionAmount = parseFloat(amount.value.trim());

    if (transactionText === '' || isNaN(transactionAmount) || transactionAmount === 0) {
        alert('Please enter a valid transaction name and amount.');
        return;
    }

    if (transactionType.value !== 'others') {
        switch (transactionType.value) {
            case 'salary':
            case 'rent-received':
            case 'bonus':
                transactionAmount = Math.abs(transactionAmount); // Ensure positive
                break;
            case 'rent-paid':
            case 'grocery':
            case 'food':
            case 'clothes':
            case 'miscellaneous':
            case 'transport':
                transactionAmount = -Math.abs(transactionAmount); // Ensure negative
                break;
            default:
                break;
        }
    } else {
        if (!/^[-+]/.test(amount.value.trim())) {
            transactionAmount = Math.abs(transactionAmount); // Default to positive if no sign is provided
        }
    }

    const totalBalance = parseFloat(balance.innerText.replace('₹', ''));
    if (transactionAmount < 0 && Math.abs(transactionAmount) > totalBalance) {
        alert('Insufficient balance to perform this transaction.');
        return;
    }

    const transaction = {
        id: generateID(),
        text: transactionText,
        amount: transactionAmount
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    text.value = '';
    amount.value = '';
}

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const listItem = document.createElement('li');

    listItem.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    listItem.innerHTML = `
    ${transaction.text} <span>₹${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;

    list.appendChild(listItem);
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    balance.innerText = `₹${total}`;
    money_plus.innerText = `+₹${income}`;
    money_minus.innerText = `-₹${expense}`;
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);

    updateLocalStorage();

    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function init() {
    list.innerHTML = '';

    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();
form.addEventListener('submit', addTransaction);
