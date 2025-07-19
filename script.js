const form = document.getElementById("expenseForm");
const searchInput = document.getElementById("searchInput");
const summary = document.getElementById("summary");
const expenseList = document.getElementById("expenseList");

const expenses = [];

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

    // check validation

    if( !amount || !category || !date){
        alert("Please fill all the required fields");
        return;
    }

    // create an expense object to save all the input and store it in the array
    const expense = {
        id: Date.now(),
        amount: `₹${amount}`,
        category,
        note,
        date
    };

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    form.reset(); //sare input fields ko clear kr deta hai
    renderExpenses(); // Ye function call karta hai jo UI pe naye cards banata hai

});

function renderExpenses(searchTerm = ""){
    expenseList.innerHTML = "";

    const filtered = expenses.filter(exp => {
        const keyword = searchTerm.toLowerCase();
        return (
            exp.category.toLowerCase().includes(keyword) ||
            exp.note.toLowerCase().includes(keyword)
        );
    });

    filtered.forEach((exp, index) =>{
        const card = document.createElement("li");
        card.className = "bg-white p-4 shadow rounded-xl flex justify-between items-center gap-4"

        card.innerHTML = `
        <div>
            <h2 class="text-xl font-semibold text-blue-700"> ${exp.category} </h2>
            <p class="text-gray-600"> ${exp.note || "No note added"} </p>
            <p class="text-xs text-gray-400">${exp.date} </p>
            </div>
            <div class="flex flex-col gap-2">
            <button class="delete-btn text-red-500 hover:text-red-700"> 🗑️</button>
            </div>
        `;

        // delete functionality
        card.querySelector(".delete-btn").addEventListener("click", () =>{
            expenses.splice( index, 1);
            localStorage.setItem("expenses", JSON.stringify(expenses));
            renderExpenses(searchInput.value)
        });
        expenseList.appendChild(card);

    });
    updateSummary(filtered);


}

function updateSummary(list){
    if (list.length === 0){
        summary.textContent = "Total: ₹0";
        return;

    }
    const total = list.reduce((sum, exp) =>{
        return sum + parseInt(exp.amount.replace("₹", ""));
    }, 0);
    summary.textContent = `Total:₹${total.toLocaleString()}`;

}

// live search filter
searchInput.addEventListener("input", (e) =>{
    renderExpenses(e.target.value)
})


