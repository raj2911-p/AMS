window.onload=function(){

loadStudents()

}

function addStudent(){

let name = formatName(document.getElementById("studentName").value)
let phone = document.getElementById("studentPhone").value.trim()
let email = document.getElementById("studentEmail").value.trim()

/* ===== VALIDATION ===== */

if(!name.trim() || !phone.trim() || !email.trim()){

    if(!name.trim()){
        document.getElementById("studentName").classList.add("error-input")
    }

    if(!phone.trim()){
        document.getElementById("studentPhone").classList.add("error-input")
    }

    if(!email.trim()){
        document.getElementById("studentEmail").classList.add("error-input")
    }

    alert("All fields are required")
    return
}

/* ===== EMAIL and MOBILE VALIDATION ===== */

email = email.replace(/\s/g,"")
phone = phone.replace(/\s/g,"")   // remove spaces

let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* BOTH WRONG */
if(!emailPattern.test(email) && phone.length !== 10){
alert("Please enter valid Email ID and Mobile Number")
return
}

/* ONLY EMAIL WRONG */
if(!emailPattern.test(email)){
alert("Please enter a valid Email ID (e.g. example@gmail.com)")
return
}

/* ONLY PHONE WRONG */
if(phone.length !== 10 || isNaN(phone)){
alert("Please enter a valid 10-digit Mobile Number")
return
}

/* ===== PHONE VALIDATION ===== */

let phonePattern = /^[0-9]{10}$/

if(!phonePattern.test(phone)){
alert("Please enter valid 10-digit Mobile Number (No spaces or letters)")
return
}

/* ===== CHECK DUPLICATE ===== */

fetch(API + "?action=getStudents")
.then(res => res.json())
.then(data => {

let exists = false

data.slice(1).forEach(s => {

let existingPhone = s[2]
let existingEmail = s[3]

if(existingPhone === phone || existingEmail === email){
exists = true
}

})

if(exists){
alert("Already Exists")
return
}

/* ===== CREATE STUDENT ===== */

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"addStudent",
name:name,
phone:phone,
email:email
})
})
.then(res=>res.json())
.then(()=>{
alert("Student Created")

document.getElementById("studentName").value=""
document.getElementById("studentPhone").value=""
document.getElementById("studentEmail").value=""

loadStudents()
})

})
.catch(()=>{
alert("Error while checking data")
})

}

function loadStudents(){

fetch(API+"?action=getStudents")
.then(res=>res.json())
.then(data=>{

let table=document.getElementById("studentTable")
table.innerHTML=""

data.slice(1).forEach((s)=>{

table.innerHTML+=`

<tr id="row-${s[0]}">

<td>${s[1]}</td>
<td>+91 ${s[2]}</td>
<td>${s[3]}</td>

<td>

<button onclick="viewStudent('${s[0]}')"><b>Profile</b></button>

<button onclick="enableEdit('${s[0]}','${s[1]}','${s[2]}','${s[3]}')" class="edit-btn">
<b>Edit</b>
</button>

<button onclick="deleteStudent('${s[0]}')" class="delete-btn">
<b>Delete</b>
</button>

</td>

</tr>

`

})

})

}

/* EDIT STUDENT */

function enableEdit(id,name,phone,email){

let row = document.getElementById("row-"+id)

row.innerHTML = `

<td><input id="name-${id}" value="${name}" oninput="checkChange('${id}')"></td>
<td><input id="phone-${id}" value="${phone}" oninput="checkChange('${id}')"></td>
<td><input id="email-${id}" value="${email}" oninput="checkChange('${id}')"></td>

<td>

<button id="save-${id}" onclick="saveEdit('${id}')" class="edit-btn" disabled>Save</button>

<button onclick="cancelStudentEdit('${id}')" class="delete-btn">Cancel</button>

</td>

`

/* STORE ORIGINAL VALUES */
row.setAttribute("data-name", name)
row.setAttribute("data-phone", phone)
row.setAttribute("data-email", email)

}

function checkChange(id){

let row = document.getElementById("row-"+id)

let originalName = row.getAttribute("data-name")
let originalPhone = row.getAttribute("data-phone")
let originalEmail = row.getAttribute("data-email")

let newName = document.getElementById("name-"+id).value
let newPhone = document.getElementById("phone-"+id).value
let newEmail = document.getElementById("email-"+id).value

let saveBtn = document.getElementById("save-"+id)

if(
originalName !== newName ||
originalPhone !== newPhone ||
originalEmail !== newEmail
){
saveBtn.disabled = false
}else{
saveBtn.disabled = true
}

}

function exportStudentPDF(){

    let table = document.querySelector(".student-table table")
    let clone = table.cloneNode(true)

    // ❌ remove Action column
    clone.querySelectorAll("tr").forEach(row=>{
        row.deleteCell(-1)
    })

    let html = `
    <html>
    <head>
    <title>Students List</title>

    <style>
    body{
        font-family:'Segoe UI',sans-serif;
        padding:20px;
    }

    /* ===== HEADER ===== */

    .header{
        display:flex;
        align-items:center;
        justify-content:center;
        position:relative;
        margin-bottom:20px;
    }

    .logo{
        position:absolute;
        left:0;
    }

    .logo img{
        width:100%;
        height:60px;
    }

    /* ===== TABLE ===== */

    table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
    }

    th,td{
        border-bottom:1px solid #9b9898;
        padding:10px;
        text-align:left;
    }

    th{
        background: #c2d0df;
    }

    </style>
    </head>

    <body>

    <!-- ✅ HEADER -->
    <div class="header">

        <div class="logo">
            <img src="logo.png">  <!-- 👉 apna logo yaha change kar sakte ho -->
        </div>

        <h1 style="text-align: center;">Students Database</h1>

    </div>

    <table id="pdfTable">
    ${clone.innerHTML}
    </table>

    </body>
    </html>
    `

    let win = window.open("", "", "width=900,height=700")
    win.document.write(html)
    win.document.close()
    win.print()
}

function saveEdit(id){

let name = formatName(document.getElementById("name-"+id).value.trim())
let phone = document.getElementById("phone-"+id).value.trim()
let email = document.getElementById("email-"+id).value.trim()

if(!name.trim() || !phone.trim() || !email.trim()){

    if(!name.trim()){
        document.getElementById("name-"+id).classList.add("error-input")
    }

    if(!phone.trim()){
        document.getElementById("phone-"+id).classList.add("error-input")
    }

    if(!email.trim()){
        document.getElementById("email-"+id).classList.add("error-input")
    }

    alert("All fields are required")
    return
}

/* ===== EMAIL and MOBILE VALIDATION ===== */

email = email.replace(/\s/g,"")
phone = phone.replace(/\s/g,"")   // remove spaces

let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* BOTH WRONG */
if(!emailPattern.test(email) && phone.length !== 10){
alert("Please enter valid Email ID and Mobile Number")
return
}

/* ONLY EMAIL WRONG */
if(!emailPattern.test(email)){
alert("Please enter a valid Email ID (e.g. example@gmail.com)")
return
}

/* ONLY PHONE WRONG */
if(phone.length !== 10 || isNaN(phone)){
alert("Please enter a valid 10-digit Mobile Number")
return
}

/*==== CHECK DUPLICATE ====*/

fetch(API + "?action=getStudents")
.then(res => res.json())
.then(data => {

let exists = false

data.slice(1).forEach(s => {

let existingPhone = String(s[2]).replace(/\D/g,"")   // remove +91, spaces
let newPhone = String(phone).replace(/\D/g,"")

let existingEmail = String(s[3]).toLowerCase().trim()
let newEmail = String(email).toLowerCase().trim()

if(
s[0] != id &&
(
existingPhone === newPhone ||
existingEmail === newEmail
)
){
exists = true
}

})

if(exists){
alert("Already Exists")
return
}

/*==== UPDATE ====*/

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"updateStudent",
id:id,
name:name,
phone:phone,
email:email
})
})
.then(res=>res.json())
.then(()=>{
alert("Updated Successfully")
loadStudents()
})

})

}

/*==== DELETE STUDENT ====*/

function deleteStudent(id){

if(confirm("Are you sure to delete this student?")){

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"deleteStudent",
id:id
})
})
.then(res=>res.json())
.then(()=>{
alert("Student Deleted")
loadStudents()
})

}

}

function viewStudent(name){

localStorage.setItem("studentProfile",name)
window.location="student-profile.html"

}

function formatName(name){

if(!name) return ""

return name
.trim()
.split(/\s+/)
.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
.join(" ")

}

/* ===== REAL-TIME AUTO CAPITALIZE ===== */

function capitalizeLive(input){

let start = input.selectionStart

let value = input.value

value = value
.split(" ")
.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
.join(" ")

input.value = value

/*==== cursor fix ====*/
input.setSelectionRange(start, start)

}

/*==== APPLY TO ALL INPUTS ====*/

document.addEventListener("input", function(e){

/*==== CREATE FORM ====*/
if(e.target.id === "studentName"){
capitalizeLive(e.target)
}

/*==== EDIT MODE (name-1, name-2, etc) ====*/
if(e.target.id && e.target.id.startsWith("name-")){
capitalizeLive(e.target)
}

})

document.addEventListener("input", function(e){

    /* ===== CREATE FORM ===== */
    if(
        e.target.id === "studentName" ||
        e.target.id === "studentPhone" ||
        e.target.id === "studentEmail"
    ){
        if(e.target.value.trim()){
            e.target.classList.remove("error-input")
        }
    }

    /* ===== EDIT MODE ===== */
    if(e.target.id && (
        e.target.id.startsWith("name-") ||
        e.target.id.startsWith("phone-") ||
        e.target.id.startsWith("email-")
    )){
        if(e.target.value.trim()){
            e.target.classList.remove("error-input")
        }
    }

})

function cancelStudentEdit(id){

    let row = document.getElementById("row-"+id)

    let name = row.getAttribute("data-name")
    let phone = row.getAttribute("data-phone")
    let email = row.getAttribute("data-email")

    row.innerHTML = `
<td>${name}</td>
<td>+91 ${phone}</td>
<td>${email}</td>

<td>
<button onclick="viewStudent('${id}')"><b>Profile</b></button>

<button onclick="enableEdit('${id}','${name}','${phone}','${email}')" class="edit-btn">
<b>Edit</b>
</button>

<button onclick="deleteStudent('${id}')" class="delete-btn">
<b>Delete</b>
</button>
</td>
`
}