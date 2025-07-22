const form = document.getElementById("expenseForm");
const searchInput = document.getElementById("searchInput");
const summary = document.getElementById("summary");
const expenseList = document.getElementById("expenseList");
const sortOrderSelect = document.getElementById("sortOrder");

let isEditing = false;
let editIndex = null;
const expenses = [];

function populateCategoryFilter(){
    const filter = document.getElementById("categoryFilter");
    filter.innerHTML = '<option value=""> All Category </option>';

    const categories = [...new Set(expenses.map(exp => exp.category))];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

// Load saved data from localStorage
const savedExpense = localStorage.getItem("expenses");
if(savedExpense){
    expenses.push(...JSON.parse(savedExpense));
    renderExpenses();
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = document.getElementById("amount").value.trim();
    const category = document.getElementById("category").value.trim();
    const note = document.getElementById("note").value.trim();
    const date = document.getElementById("date").value.trim();

    if(!amount || !category || !date){
        alert("Please fill all the required fields");
        return;
    }

    const expense = {
        id: Date.now(),
        amount: `₹${amount}`,
        category,
        note,
        date
    };

    if(isEditing){
        expenses[editIndex] = expense;
        isEditing = false;
        editIndex = null;
        document.getElementById("submitBtn").textContent = "Add Expense";
        alert("Expense updated successfully ✅");
    } else {
        expenses.push(expense);
    }

    localStorage.setItem("expenses", JSON.stringify(expenses));
    form.reset();
    renderExpenses();
});

function renderExpenses(searchTerm = "", selectedCategory = "", sortOrder = "newest"){
    expenseList.innerHTML = "";

    const filtered = expenses.filter(exp => {
        const keyword = searchTerm.toLowerCase();
        const categoryMatch = selectedCategory ? exp.category === selectedCategory : true;
        return (
            categoryMatch && (
                exp.category.toLowerCase().includes(keyword) ||
                exp.note.toLowerCase().includes(keyword)
            )
        );
    });

    // ✅ Sort by date
    filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    filtered.forEach((exp, index) => {
        const card = document.createElement("li");
        card.className = "bg-white p-4 shadow rounded-xl flex justify-between items-center gap-4";

        card.innerHTML = `
            <div>
                <h2 class="text-xl font-semibold text-blue-700">${exp.category}</h2>
                <p class="text-gray-600">${exp.note || "No note added"}</p>
                <p class="text-xs text-gray-400">${exp.date}</p>
            </div>
            <div class="flex flex-col gap-2">
                <button class="delete-btn text-red-500 hover:text-red-700">🗑️</button>
                <button class="edit-btn text-blue-500 hover:text-blue-700">✏️</button>
            </div>
        `;

        // Delete
        card.querySelector(".delete-btn").addEventListener("click", () => {
            expenses.splice(index, 1);
            localStorage.setItem("expenses", JSON.stringify(expenses));
            renderExpenses(searchInput.value, document.getElementById("categoryFilter").value, sortOrderSelect.value);
        });

        // Edit
        card.querySelector(".edit-btn").addEventListener("click", () => {
            const exp = expenses[index];
            document.getElementById("amount").value = exp.amount.replace("₹", "");
            document.getElementById("category").value = exp.category;
            document.getElementById("note").value = exp.note;
            document.getElementById("date").value = exp.date;

            isEditing = true;
            editIndex = index;
            document.getElementById("submitBtn").textContent = "Update Expense";
        });

        expenseList.appendChild(card);
    });

    updateSummary(filtered);
    populateCategoryFilter();
}

function updateSummary(list){
    if (list.length === 0){
        summary.textContent = "Total: ₹0";
        return;
    }

    const total = list.reduce((sum, exp) => {
        return sum + parseInt(exp.amount.replace("₹", ""));
    }, 0);
    summary.textContent = `Total: ₹${total.toLocaleString()}`;
}

// ✅ Live search
searchInput.addEventListener("input", (e) => {
    renderExpenses(e.target.value, document.getElementById("categoryFilter").value, sortOrderSelect.value);
});

// ✅ Category filter
document.getElementById("categoryFilter").addEventListener("change", (e) => {
    renderExpenses(searchInput.value, e.target.value, sortOrderSelect.value);
});

// ✅ Sort Order dropdown
sortOrderSelect.addEventListener("change", (e) => {
    renderExpenses(searchInput.value, document.getElementById("categoryFilter").value, e.target.value);
});
