
const urlUsers = "http://localhost:8001/users";

const tableContainer = document.getElementById("table-container");
let elemMessage = document.querySelector('.message');
const pageingButtons = document.getElementById("paging-handell");

function showForm(formId) {
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => {
        if (form.id === formId) {
            form.classList.add('visible');
        } else {
            form.classList.remove('visible');
        }
    });
}
function hideTable() {
    const getUsersButton = document.getElementById("get-button");

    tableContainer.style.display = 'none';
    getUsersButton.style.display = 'block';
}
let currentPage = 1;

function fetchAndBuildTable() {
    tableContainer.style.display = 'block';
    axios.get(`${urlUsers}?_page=${currentPage}`)
        .then(function (response) {
            const data = response.data.data;
            console.log(data);
            buildTable(data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function buildTable(data) {
    const getUsersButton = document.getElementById("get-button");
    getUsersButton.style.display = 'none';

    const tableContainer = document.getElementById("table-container");
    tableContainer.innerHTML = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const hideButton = document.createElement("button");
    hideButton.classList.add("hide-button");
    hideButton.textContent = "Hide table";
    hideButton.addEventListener('click', function () { hideTable(); });
    buttonContainer.appendChild(hideButton);

    const pagingButtons = document.createElement("div");
    pagingButtons.setAttribute("id", "paging-handell");
    pagingButtons.innerHTML = "<button onclick='previousHandler()'><</button><button onclick='nextHandler()'>></button>";
    buttonContainer.appendChild(pagingButtons);

    tableContainer.appendChild(buttonContainer);

    const table = document.createElement("table");
    table.setAttribute("border", "1");

    const headers = ["ID", "First Name", "Last Name"];
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(post => {
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        const firstNameCell = document.createElement("td");
        const lastNameCell = document.createElement("td");

        idCell.textContent = post.id;
        firstNameCell.textContent = post.firstName;
        lastNameCell.textContent = post.lastName;

        row.appendChild(idCell);
        row.appendChild(firstNameCell);
        row.appendChild(lastNameCell);
        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}


document.getElementById('new-user-form').addEventListener('submit', function (event) {
    event.preventDefault();
    newUser();
});
document.getElementById('delete-user-by-id').addEventListener('submit', function (event) {
    event.preventDefault();
    deleteUser();
});
document.getElementById('update-user-form').addEventListener('submit', function (event) {
    event.preventDefault();
    updateUser();
});

function newUser() {
    let firstNameVal = document.querySelector('#firstName').value;
    let lastNameVal = document.querySelector('#lastName').value;

    axios.post(urlUsers, {
        "firstName": firstNameVal,
        "lastName": lastNameVal
    }).then(response => {
        showMessage("User added successfully!", true);
        document.querySelector('#firstName').value = '';
        document.querySelector('#lastName').value = '';
        fetchAndBuildTable();
    }).catch(function (error) {
        console.error(error);
        showMessage("Failed to add user!", false);
    });
}

function updateUser() {
    let userIdVal = document.querySelector('#updateID').value;
    let newFirstNameVal = document.querySelector('#updatedFirstName').value;
    let newLastNameVal = document.querySelector('#updatedLastName').value;

    let payload = {};
    if (newFirstNameVal.trim() !== "") payload.firstName = newFirstNameVal;
    if (newLastNameVal.trim() !== "") payload.lastName = newLastNameVal;

    console.log(payload);

    if (Object.keys(payload).length === 0) {
        showMessage("No fields to update!", false);
        return;
    }

    axios.put(`${urlUsers}/${userIdVal}`, payload)
        .then(response => {
            showMessage("User updated successfully!", true);
            document.querySelector('#updateID').value = '';
            document.querySelector('#updatedFirstName').value = '';
            document.querySelector('#updatedLastName').value = '';
            fetchAndBuildTable();
        })
        .catch(function (error) {
            console.error(error);
            showMessage("Failed to update user!", false);
        });
}


function deleteUser() {
    let userIdVal = document.querySelector('#ID').value;
    axios.delete(`${urlUsers}/${userIdVal}`)
        .then(response => {
            showMessage(`User ${userIdVal} deleted successfully!`, true);
            document.querySelector('#ID').value = '';
            fetchAndBuildTable();
        })
        .catch(function (error) {
            console.error(error);
            showMessage(`Failed to delete user ${userIdVal}!`, false);
        });
}
function nextHandler() {
    currentPage++;
    fetchAndBuildTable();
}
function previousHandler() {
    currentPage--;
    if (currentPage < 1) {
        currentPage = 1;
    }
    fetchAndBuildTable();
}
function showMessage(message, isSuccess) {
    elemMessage.textContent = message;
    elemMessage.style.color = isSuccess ? '#45a049' : '#ba1111';
    setTimeout(() => {
        elemMessage.textContent = '';
    }, 3000);
}