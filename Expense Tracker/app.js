(() => {
  'use strict';

  const STORAGE_KEY = 'pennywise.expenses.v1';
  const BUDGET_KEY = 'pennywise.monthlyBudget.v1';
  const categoryColors = {
    Food: '#8968cf',
    Transport: '#e5a377',
    Shopping: '#73b99b',
    Bills: '#6f9ed3',
    Entertainment: '#df7c9a',
    Health: '#e0bd68',
    Other: '#a39bab'
  };
  const categoryIcons = {
    Food: '♨',
    Transport: '↗',
    Shopping: '◇',
    Bills: '⌂',
    Entertainment: '♫',
    Health: '✚',
    Other: '✦'
  };

  const elements = {
    total: document.querySelector('#total-value'),
    totalNote: document.querySelector('#total-note'),
    budget: document.querySelector('#budget-value'),
    budgetNote: document.querySelector('#budget-note'),
    budgetProgress: document.querySelector('#budget-progress'),
    count: document.querySelector('#count-value'),
    countNote: document.querySelector('#count-note'),
    month: document.querySelector('#month-filter'),
    categoryFilter: document.querySelector('#category-filter'),
    search: document.querySelector('#search-input'),
    list: document.querySelector('#transaction-list'),
    empty: document.querySelector('#empty-state'),
    resultsCount: document.querySelector('#results-count'),
    chart: document.querySelector('#category-chart'),
    chartTotal: document.querySelector('#chart-total'),
    legend: document.querySelector('#category-legend'),
    dailyChart: document.querySelector('#daily-chart'),
    period: document.querySelector('#breakdown-period'),
    expenseDialog: document.querySelector('#expense-dialog'),
    expenseForm: document.querySelector('#expense-form'),
    expenseError: document.querySelector('#expense-error'),
    budgetDialog: document.querySelector('#budget-dialog'),
    budgetForm: document.querySelector('#budget-form'),
    budgetInput: document.querySelector('#budget-input'),
    budgetError: document.querySelector('#budget-error'),
    toast: document.querySelector('#toast')
  };

  let expenses = loadExpenses();
  let monthlyBudget = loadBudget();
  let editingId = null;
  let toastTimer;

  function loadExpenses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error('Stored expenses are not a list.');
      return parsed.filter((expense) =>
        expense &&
        Number.isInteger(expense.id) &&
        Number.isFinite(expense.amount) &&
        expense.amount > 0 &&
        typeof expense.description === 'string' &&
        typeof expense.category === 'string' &&
        isValidDate(expense.date)
      );
    } catch (error) {
      console.error('Could not load expenses from browser storage.', error);
      showToast('Saved expenses could not be loaded.');
      return [];
    }
  }

  function loadBudget() {
    try {
      const saved = localStorage.getItem(BUDGET_KEY);
      if (saved === null) return null;
      const value = Number(saved);
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch (error) {
      console.error('Could not load budget from browser storage.', error);
      showToast('Saved budget could not be loaded.');
      return null;
    }
  }

  function saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      return true;
    } catch (error) {
      console.error('Could not save expenses to browser storage.', error);
      showToast('Could not save your expenses on this device.');
      return false;
    }
  }

  function saveBudget() {
    try {
      if (monthlyBudget === null) localStorage.removeItem(BUDGET_KEY);
      else localStorage.setItem(BUDGET_KEY, String(monthlyBudget));
      return true;
    } catch (error) {
      console.error('Could not save budget to browser storage.', error);
      showToast('Could not save your budget on this device.');
      return false;
    }
  }

  function isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
  }

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function currentMonth() {
    return localDateString(new Date()).slice(0, 7);
  }

  function formatCurrency(amount, compact = false) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 2
    }).format(amount);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      .format(new Date(`${date}T00:00:00`));
  }

  function monthLabel(month) {
    const [year, value] = month.split('-').map(Number);
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
      .format(new Date(year, value - 1, 1));
  }

  function selectedMonthExpenses() {
    const month = elements.month.value;
    return expenses.filter((expense) => expense.date.slice(0, 7) === month);
  }

  function populateMonths() {
    const selected = elements.month.value || currentMonth();
    const months = new Set([currentMonth(), selected, ...expenses.map((expense) => expense.date.slice(0, 7))]);
    elements.month.replaceChildren();
    [...months].sort().reverse().forEach((month) => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = monthLabel(month);
      elements.month.append(option);
    });
    elements.month.value = months.has(selected) ? selected : currentMonth();
  }

  function populateCategories() {
    const selected = elements.categoryFilter.value || 'all';
    const categories = [...new Set(expenses.map((expense) => expense.category))].sort((a, b) => a.localeCompare(b));
    elements.categoryFilter.replaceChildren(new Option('All categories', 'all'));
    categories.forEach((category) => elements.categoryFilter.append(new Option(category, category)));
    elements.categoryFilter.value = categories.includes(selected) ? selected : 'all';
  }

  function renderSummary(monthExpenses) {
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    elements.total.textContent = formatCurrency(total);
    elements.totalNote.textContent = monthExpenses.length === 0
      ? 'No expenses this month'
      : `${monthExpenses.length} expense${monthExpenses.length === 1 ? '' : 's'} this month`;
    elements.count.textContent = String(monthExpenses.length);
    elements.countNote.textContent = monthExpenses.length === 1 ? 'A little progress adds up' : 'Keep tracking your spending';
    elements.period.textContent = elements.month.value === currentMonth() ? 'This month' : monthLabel(elements.month.value);
    elements.chartTotal.textContent = formatCurrency(total, true);

    if (monthlyBudget === null) {
      elements.budget.textContent = 'Not set';
      elements.budgetNote.innerHTML = '<button class="inline-button" id="budget-button" type="button">Set a monthly budget <span aria-hidden="true">→</span></button>';
      elements.budgetProgress.style.width = '0%';
    } else {
      const percentage = total / monthlyBudget * 100;
      elements.budget.textContent = formatCurrency(monthlyBudget);
      elements.budgetNote.textContent = `${Math.min(percentage, 999).toFixed(0)}% used · ${formatCurrency(Math.max(monthlyBudget - total, 0))} left`;
      elements.budgetProgress.style.width = `${Math.min(percentage, 100)}%`;
      elements.budgetProgress.style.background = percentage > 100 ? '#df7c83' : '#8d70d2';
    }
  }

  function renderCategoryChart(monthExpenses) {
    const totals = new Map();
    monthExpenses.forEach((expense) => totals.set(expense.category, (totals.get(expense.category) || 0) + expense.amount));
    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);
    let cursor = 0;
    const segments = sorted.map(([category, amount]) => {
      const start = cursor;
      cursor += amount / (total || 1) * 100;
      return `${categoryColors[category] || '#a39bab'} ${start}% ${cursor}%`;
    });
    elements.chart.style.background = segments.length ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#eeeaf5 0 100%)';
    elements.chart.setAttribute('aria-label', sorted.length ? `Spending by category, ${sorted.map(([category, amount]) => `${category}: ${formatCurrency(amount)}`).join(', ')}` : 'No spending categories yet');
    elements.legend.replaceChildren();

    if (!sorted.length) {
      const empty = document.createElement('p');
      empty.className = 'legend-empty';
      empty.textContent = 'Add an expense to see your breakdown.';
      elements.legend.append(empty);
      return;
    }

    sorted.slice(0, 5).forEach(([category, amount]) => {
      const row = document.createElement('div');
      row.className = 'legend-row';
      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.backgroundColor = categoryColors[category] || '#a39bab';
      const name = document.createElement('span');
      name.className = 'legend-name';
      name.textContent = category;
      const value = document.createElement('span');
      value.className = 'legend-amount';
      value.textContent = formatCurrency(amount, true);
      row.append(dot, name, value);
      elements.legend.append(row);
    });
  }

  function renderDailyChart(monthExpenses) {
    const [year, month] = elements.month.value.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const totals = new Map();
    monthExpenses.forEach((expense) => {
      const day = Number(expense.date.slice(8, 10));
      totals.set(day, (totals.get(day) || 0) + expense.amount);
    });
    const max = Math.max(...totals.values(), 0);
    const groupCount = 14;
    const bars = [];
    for (let group = 0; group < groupCount; group += 1) {
      const firstDay = Math.floor(group * daysInMonth / groupCount) + 1;
      const lastDay = Math.floor((group + 1) * daysInMonth / groupCount);
      const amount = [...totals.entries()]
        .filter(([day]) => day >= firstDay && day <= Math.max(lastDay, firstDay))
        .reduce((sum, [, value]) => sum + value, 0);
      const percent = max ? Math.max(amount / max * 95, amount ? 8 : 2) : 2;
      const groupElement = document.createElement('div');
      groupElement.className = 'bar-group';
      groupElement.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('span');
      bar.className = 'bar';
      bar.style.height = `${percent}%`;
      groupElement.append(bar);
      bars.push(groupElement);
    }
    elements.dailyChart.replaceChildren(...bars);
    elements.dailyChart.setAttribute('aria-label', max ? `Daily expenses in ${monthLabel(elements.month.value)}` : 'No daily spending data yet');
  }

  function createActionButton(label, glyph, action, id) {
    const button = document.createElement('button');
    button.className = 'row-action';
    button.type = 'button';
    button.textContent = glyph;
    button.setAttribute('aria-label', label);
    button.dataset.action = action;
    button.dataset.id = String(id);
    return button;
  }

  function renderTransactions(monthExpenses) {
    const category = elements.categoryFilter.value;
    const query = elements.search.value.trim().toLocaleLowerCase();
    const visible = monthExpenses
      .filter((expense) => category === 'all' || expense.category === category)
      .filter((expense) => `${expense.description} ${expense.category}`.toLocaleLowerCase().includes(query))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

    elements.list.replaceChildren();
    visible.forEach((expense) => {
      const row = document.createElement('tr');
      const transactionCell = document.createElement('td');
      const transaction = document.createElement('div');
      transaction.className = 'transaction-name';
      const icon = document.createElement('span');
      icon.className = 'transaction-icon';
      icon.style.backgroundColor = `${categoryColors[expense.category] || '#a39bab'}20`;
      icon.style.color = categoryColors[expense.category] || '#a39bab';
      icon.textContent = categoryIcons[expense.category] || '✦';
      const name = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = expense.description;
      const subtitle = document.createElement('span');
      subtitle.textContent = `Expense #${expense.id}`;
      name.append(title, subtitle);
      transaction.append(icon, name);
      transactionCell.append(transaction);

      const categoryCell = document.createElement('td');
      const tag = document.createElement('span');
      tag.className = 'category-tag';
      tag.textContent = expense.category;
      categoryCell.append(tag);

      const dateCell = document.createElement('td');
      dateCell.textContent = formatDate(expense.date);
      const amountCell = document.createElement('td');
      amountCell.className = 'amount-cell';
      amountCell.textContent = `−${formatCurrency(expense.amount)}`;
      const actionsCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      actions.append(
        createActionButton(`Edit ${expense.description}`, '✎', 'edit', expense.id),
        createActionButton(`Delete ${expense.description}`, '×', 'delete', expense.id)
      );
      actionsCell.append(actions);
      row.append(transactionCell, categoryCell, dateCell, amountCell, actionsCell);
      elements.list.append(row);
    });

    elements.empty.classList.toggle('visible', visible.length === 0);
    elements.list.closest('table').style.display = visible.length ? '' : 'none';
    elements.resultsCount.textContent = `Showing ${visible.length} transaction${visible.length === 1 ? '' : 's'}`;
  }

  function render() {
    populateMonths();
    populateCategories();
    const monthExpenses = selectedMonthExpenses();
    renderSummary(monthExpenses);
    renderCategoryChart(monthExpenses);
    renderDailyChart(monthExpenses);
    renderTransactions(monthExpenses);
  }

  function openExpenseDialog(expense = null) {
    editingId = expense ? expense.id : null;
    elements.expenseForm.reset();
    elements.expenseError.textContent = '';
    document.querySelector('#expense-dialog-title').textContent = expense ? 'Edit expense' : 'Add expense';
    document.querySelector('#expense-form button[type="submit"]').textContent = expense ? 'Save changes' : 'Save expense';
    document.querySelector('#expense-description').value = expense ? expense.description : '';
    document.querySelector('#expense-amount').value = expense ? expense.amount : '';
    document.querySelector('#expense-category').value = expense ? expense.category : '';
    document.querySelector('#expense-date').value = expense ? expense.date : localDateString(new Date());
    elements.expenseDialog.showModal();
    document.querySelector('#expense-description').focus();
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => elements.toast.classList.remove('visible'), 2600);
  }

  document.querySelector('#add-button').addEventListener('click', () => openExpenseDialog());
  document.querySelector('#empty-add-button').addEventListener('click', () => openExpenseDialog());
  document.querySelector('#export-button').addEventListener('click', () => {
    const data = selectedMonthExpenses().sort((a, b) => a.date.localeCompare(b.date));
    const rows = [['Expense ID', 'Amount', 'Category', 'Description', 'Date'], ...data.map((expense) => [
      expense.id,
      expense.amount.toFixed(2),
      expense.category,
      expense.description,
      expense.date
    ])];
    const csv = rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${elements.month.value}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${data.length} transaction${data.length === 1 ? '' : 's'}.`);
  });
  elements.budgetNote.addEventListener('click', (event) => {
    if (!event.target.closest('#budget-button')) return;
    elements.budgetError.textContent = '';
    elements.budgetInput.value = monthlyBudget === null ? '' : monthlyBudget;
    elements.budgetDialog.showModal();
  });

  elements.month.addEventListener('change', render);
  elements.categoryFilter.addEventListener('change', () => renderTransactions(selectedMonthExpenses()));
  elements.search.addEventListener('input', () => renderTransactions(selectedMonthExpenses()));

  elements.list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const expense = expenses.find((item) => item.id === id);
    if (!expense) return;
    if (button.dataset.action === 'edit') {
      openExpenseDialog(expense);
      return;
    }
    if (button.dataset.action === 'delete' && window.confirm(`Delete "${expense.description}"?`)) {
      expenses = expenses.filter((item) => item.id !== id);
      if (saveExpenses()) {
        render();
        showToast('Expense deleted.');
      }
    }
  });

  elements.expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(elements.expenseForm);
    const amount = Number(formData.get('amount'));
    const date = String(formData.get('date'));
    if (!Number.isFinite(amount) || amount <= 0 || !isValidDate(date)) {
      elements.expenseError.textContent = 'Enter a positive amount and a valid date.';
      return;
    }
    const existing = editingId === null ? null : expenses.find((item) => item.id === editingId);
    const expense = {
      id: existing ? existing.id : expenses.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      amount,
      category: String(formData.get('category')),
      description: String(formData.get('description')).trim(),
      date
    };
    const nextExpenses = existing
      ? expenses.map((item) => item.id === editingId ? expense : item)
      : [...expenses, expense];
    expenses = nextExpenses;
    if (!saveExpenses()) return;
    elements.expenseDialog.close();
    populateMonths();
    elements.month.value = date.slice(0, 7);
    render();
    showToast(existing ? 'Expense updated.' : 'Expense added.');
  });

  elements.budgetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(elements.budgetInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      elements.budgetError.textContent = 'Enter a budget greater than zero.';
      return;
    }
    monthlyBudget = amount;
    if (!saveBudget()) return;
    elements.budgetDialog.close();
    render();
    showToast('Monthly budget saved.');
  });

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  render();
})();
