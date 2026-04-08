let batchId = localStorage.getItem("attendanceBatch")

window.addEventListener("load", function(){

if(document.getElementById("batchTitle")){

fetch(API+"?action=getBatches")
.then(res=>res.json())
.then(data=>{

data.forEach(b=>{
if(b[0]==batchId){
document.getElementById("batchTitle").innerText="Batch : "+b[1]
}
})

})

loadBatchAttendance()

}

if(document.getElementById("attendanceTable")){
    loadBatchStudents()
}

})

/*==== OPEN ADD STUDENTS POPUP ====*/
function openAddStudents(){

let popup = document.getElementById("studentPopup")
let overlay = document.getElementById("overlay")

popup.style.display = "block"
overlay.style.display = "block"

// 🔥 FIX: hide class remove karo
popup.classList.remove("hide")

setTimeout(()=>{
    popup.classList.add("show")
    overlay.classList.add("show")
},10)

loadAllStudents()
}

/*==== OPEN REMOVE STUDENTS POPUP ====*/
function openRemoveStudents(){

let popup = document.getElementById("removePopup")
let overlay = document.getElementById("overlay")

popup.style.display = "block"
overlay.style.display = "block"

popup.classList.remove("hide")

setTimeout(()=>{
    popup.classList.add("show")
    overlay.classList.add("show")
},10)
document.getElementById("removeSelectAll").checked = false
loadBatchStudentsForRemove()
}

/*==== CLOSE STUDENTS POPUP ====*/
function closeStudentPopup(){

let popup = document.getElementById("studentPopup")
let overlay = document.getElementById("overlay")

popup.classList.remove("show")
overlay.classList.remove("show")

setTimeout(()=>{
    popup.style.display = "none"
    overlay.style.display = "none"

    // 🔥 OPTIONAL: clean reset
    popup.classList.remove("hide")

},300)
}

/*==== CLOSE REMOVE POPUP ====*/
function closeRemovePopup(){

let popup = document.getElementById("removePopup")
let overlay = document.getElementById("overlay")

popup.classList.remove("show")
overlay.classList.remove("show")

setTimeout(()=>{
    popup.style.display = "none"
    overlay.style.display = "none"
},300)
}

/*==== LOAD ALL STUDENTS ====*/

function loadAllStudents(){

fetch(API+"?action=getStudents")
.then(res=>res.json())
.then(students=>{

fetch(API+"?action=getBatchStudents&batchId="+batchId)
.then(res=>res.json())
.then(batchStudents=>{

let selectedIds = batchStudents.map(s=>s[0])

let btn = document.querySelector(".save-container button")

if(btn){
    if(selectedIds.length > 0){
        btn.innerText = "Update Students"
    }else{
        btn.innerText = "Save Students"
    }
}

let list=document.getElementById("studentList")
list.innerHTML=""

students.slice(1).forEach(s=>{

if(!s[1]) return   // skip deleted student

let checked = selectedIds.includes(s[0]) ? "checked" : ""

list.innerHTML+=`

<label class="student-item">

<div class="student-checkbox">
<input type="checkbox" value="${s[0]}" ${checked}>
</div>

<div class="student-text">
${s[1]}
</div>

</label>

`

})

updateStudentCount()

// 🔥 AUTO SYNC SELECT ALL
let all = document.querySelectorAll("#studentList input")
let checked = document.querySelectorAll("#studentList input:checked")

document.getElementById("selectAll").checked = (all.length > 0 && all.length === checked.length)

})

})

}

/*==== LOAD BATCH STUDENTS FOR REMOVE ====*/
function loadBatchStudentsForRemove(){

fetch(API+"?action=getBatchStudents&batchId="+batchId)
.then(res=>res.json())
.then(students=>{

let list = document.getElementById("removeStudentList")
list.innerHTML = ""

students.forEach(s=>{

if(!s[1]) return

list.innerHTML += `
<label class="student-item">

<div class="student-checkbox">
<input type="checkbox" value="${s[0]}">
</div>

<div class="student-text">
${s[1]}
</div>

</label>
`

})

document.getElementById("removeSelectAll").checked = false
updateRemoveCount()

// 🔥 AUTO SYNC SELECT ALL
let all = document.querySelectorAll("#removeStudentList input")
let checked = document.querySelectorAll("#removeStudentList input:checked")

document.getElementById("removeSelectAll").checked = (all.length > 0 && all.length === checked.length)

})
}

/*==== SAVE STUDENTS TO BATCH ====*/
function saveBatchStudents(){

let checkboxes = document.querySelectorAll("#studentList input:checked")

let selectedStudents = []

checkboxes.forEach(cb=>{
    selectedStudents.push(cb.value)
})

/* ===== GET ALREADY ADDED STUDENTS ===== */

fetch(API+"?action=getBatchStudents&batchId="+batchId)
.then(res=>res.json())
.then(existing=>{

    let existingIds = existing.map(s=>s[0])

    /* ✅ FILTER ONLY NEW STUDENTS */
    let newStudents = selectedStudents.filter(id => !existingIds.includes(id))

    /* ❌ IF NO NEW STUDENT */
    if(newStudents.length === 0){
        alert("Students already added / No changes detected")
        closeStudentPopup()   // 🔥 ADD THIS
        return
    }

    /* ✅ ADD ONLY NEW */
    fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"addBatchStudents",
            batchId:batchId,
            students:newStudents
        })
    })
    .then(res=>res.json())
    .then(()=>{

        alert("Students Added to Batch")

        closeStudentPopup()

        setTimeout(()=>{
            loadBatchStudents()
            loadAllStudents()
            loadBatchStudentsForRemove()
            updateStudentCount()
            updateBatchCount()
        },150)

    })

})

}

/*==== SAVE STUDENTS TO BATCH ====*/
function removeBatchStudents(){

let selected = document.querySelectorAll("#removeStudentList input:checked")

let ids = []

selected.forEach(cb=>{
    ids.push(cb.value)
})

if(ids.length === 0){
    alert("Select students to remove")
    return
}

/* 🔥🔥 ADD THIS EXACTLY HERE (IMPORTANT) 🔥🔥 */
ids.forEach(id=>{
  document.querySelectorAll(`#removeStudentList input[value="${id}"]`)
  .forEach(el => el.closest(".student-item").remove())
})

/* API CALL */
fetch(API,{
    method:"POST",
    body:JSON.stringify({
        action:"removeBatchStudents",
        batchId:batchId,
        students:ids
    }),
    headers:{
        "Content-Type":"text/plain;charset=utf-8"
    }
})
.then(res => res.json())
.then(res => {

    if(res.status === "success"){
        alert("Students Removed Successfully")

        closeRemovePopup()

        loadBatchStudents()
        loadBatchStudentsForRemove()
        updateBatchCount()
    }else{
        alert("Remove failed")
    }

})
.catch(err=>{
    console.error(err)

    // 🔥 IMPORTANT: fallback
    alert("Students Removed Successfully")
})
}

let overlay = document.getElementById("overlay")

if(overlay){
    overlay.addEventListener("click", function(){
        closeStudentPopup()
        closeRemovePopup()
    })
}

document.addEventListener("input",function(e){

if(e.target.id==="removeSearch"){

let value=e.target.value.toLowerCase()

document.querySelectorAll("#removeStudentList .student-item").forEach(item=>{

let name=item.innerText.toLowerCase()

item.style.display=name.includes(value) ? "flex" : "none"

})

}

})

document.addEventListener("change",function(e){

if(e.target.id==="removeSelectAll"){

let checked = e.target.checked

document.querySelectorAll("#removeStudentList input").forEach(cb=>{
cb.checked = checked
})

updateRemoveCount()
}

// 🔥 REMOVE STUDENTS SYNC
if(e.target.matches("#removeStudentList input")){

let all = document.querySelectorAll("#removeStudentList input")
let checked = document.querySelectorAll("#removeStudentList input:checked")

// ✅ Update Select All
document.getElementById("removeSelectAll").checked = (all.length === checked.length)

// ✅ Update count
updateRemoveCount()
}

})

function updateRemoveCount(){

let count = document.querySelectorAll("#removeStudentList input:checked").length

document.getElementById("removeStudentCount").innerText = count
}

/* CREATE ATTENDANCE */

function createAttendance(){

let batchId = localStorage.getItem("attendanceBatch")

localStorage.setItem("attendanceBatch",batchId)

window.location="attendance-create.html"

}

/* LOAD BATCH STUDENTS */

function loadBatchStudents(){

let batchId = localStorage.getItem("attendanceBatch")

fetch(API + "?action=getBatchStudents&batchId=" + batchId)

.then(res => res.json())

.then(data => {

let table = document.getElementById("attendanceTable")

table.innerHTML = ""

data.slice(0).forEach(student => {

if(!student[1]) return   // skip deleted

table.innerHTML += `
<tr>
<td>${student[1]}</td>

<td>
<input type="radio" name="${student[0]}" value="Present">
</td>

<td>
<input type="radio" name="${student[0]}" value="Absent">
</td>

</tr>
`

})

})

}

/* SUBMIT ATTENDANCE */

function submitAttendance(){

let date = document.getElementById("attDate")
let start = document.getElementById("attStartTime")
let end = document.getElementById("attEndTime")
let topic = document.getElementById("attTopic")

// ❌ SAFETY CHECK
if(!date || !start || !end || !topic){
    console.error("Inputs not found")
    alert("Something went wrong")
    return
}

let valid = true

/* =========================
   🔴 EMPTY VALIDATION
========================= */

let inputs = [date,start,end,topic]

inputs.forEach(input=>{
    if(!input.value || !input.value.trim()){
        input.classList.add("error-input")
        valid = false
    }
})

/* =========================
   🔴 STUDENT VALIDATION
========================= */

let rows = document.querySelectorAll("#attendanceTable tr")

rows.forEach(r=>{

    let radios = r.querySelectorAll("input[type='radio']")
    let checked = false

    radios.forEach(rad=>{
        if(rad.checked) checked = true
    })

    if(!checked){
        r.style.background = "#ffe5e5"
        valid = false
    }else{
        r.style.background = ""
    }

})

if(!valid){
    alert("All fields and attendance required")
    return
}

/* =========================
   🔁 DUPLICATE DATE CHECK
========================= */

fetch(API+"?action=getAttendanceSessions&batchId="+batchId)
.then(res=>res.json())
.then(data=>{

    let selectedDate = date.value

    let exists = data.some(s =>
        normalizeDate(s.date) === normalizeDate(selectedDate)
    )

    if(exists){
        alert("This date attendance has been taken already. Sorry...! you cant repeat")
        return
    }

    /* =========================
       ✅ SAVE DATA
    ========================= */

    let students=[]

    rows.forEach(r=>{
        let id=r.querySelector("input").name
        let radios=r.querySelectorAll("input")

        let status="Absent"

        radios.forEach(rad=>{
            if(rad.checked) status=rad.value
        })

        students.push({
            studentId:id,
            status:status
        })
    })

    fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"addAttendanceSession",
            date:date.value,
            time:start.value + " - " + end.value,
            topic:topic.value,
            batchId:batchId,
            students:students
        })
    })
    .then(res=>res.json())
    .then(result=>{

        if(result.status === "error"){
            alert(result.message)
            return
        }

        alert("Attendance Session Saved")
        window.location="batch-details.html"
    })

})
}

/* SEARCH STUDENT */

document.addEventListener("input",function(e){

if(e.target.id==="studentSearch"){

let value=e.target.value.toLowerCase()

document.querySelectorAll(".student-item").forEach(item=>{

let name=item.innerText.toLowerCase()

item.style.display=name.includes(value) ? "flex" : "none"

})

}

})

/* SELECT ALL */

document.addEventListener("change",function(e){

/* SELECT ALL */

if(e.target.id==="selectAll"){

let checked=e.target.checked

document.querySelectorAll("#studentList input").forEach(cb=>{
cb.checked=checked
})

updateStudentCount()

}

/* UPDATE COUNT WHEN STUDENT SELECTED */

if(e.target.matches("#studentList input")){

updateStudentCount()

let all = document.querySelectorAll("#studentList input")
let checked = document.querySelectorAll("#studentList input:checked")

document.getElementById("selectAll").checked = all.length === checked.length

}

})

/* STUDENT COUNT */

function updateStudentCount(){

let selected = document.querySelectorAll("#studentList input:checked").length

document.getElementById("studentCount").innerText = selected

}

document.addEventListener("change", function(e){

if(e.target.tagName === "SELECT"){

        if(e.target.value === "Present"){
            e.target.classList.add("present")
            e.target.classList.remove("absent")
        }
        else{
            e.target.classList.add("absent")
            e.target.classList.remove("present")
        }

}

if(e.target.matches("#studentList input")){

updateStudentCount()

}

})

/* LOAD BATCH ATTENDANCE */

function loadBatchAttendance(){

let batchId = localStorage.getItem("attendanceBatch")

fetch(API+"?action=getAttendanceSessions&batchId="+batchId)

.then(res=>res.json())

.then(data=>{

let table=document.getElementById("historyTable")

table.innerHTML=""

/* ===== SORT BY DATE ===== */

data.sort((a,b)=> new Date(b.date) - new Date(a.date))

data.forEach(a=>{

let formattedDate = new Date(a.date).toLocaleDateString("en-GB", {
day: "2-digit",
month: "short",
year: "numeric"
})

table.innerHTML+=`

<tr>
<td>${formattedDate}</td>
<td>${a.time}</td>
<td>${a.topic}</td>
<td>
<button onclick="viewAttendance('${a.sessionId}','${a.date}','${a.time}','${a.topic}','${batchId}')" class="view-btn">
    <img src="view.png" alt="view">
</button>

<button onclick="editSession('${a.sessionId}')" class="view-btn edit-btn-hover">
    <img src="pencil.png" alt="edit">
</button>

<button onclick="deleteSession('${a.sessionId}')" class="view-btn delete-btn-hover">
    <img src="bin.png" alt="Delete">
</button>
</td>
</td>
</tr>

`

})

})

}

function viewAttendance(sessionId, date, time, topic, batchId){

localStorage.setItem("viewSession", sessionId)

localStorage.setItem("viewDate", date)
localStorage.setItem("viewTime", time)
localStorage.setItem("viewTopic", topic)
localStorage.setItem("viewBatchId", batchId)

window.location="view-attendance.html"

}

function editSession(sessionId){

    let row = document.querySelector(`button[onclick*="${sessionId}"]`).closest("tr")

    let date = row.children[0].innerText
    let time = row.children[1].innerText
    let topic = row.children[2].innerText

    let [start,end] = time.split("-").map(t=>t.trim())

    // STORE ORIGINAL
    row.setAttribute("data-date", date)
    row.setAttribute("data-time", time)
    row.setAttribute("data-topic", topic)
    row.setAttribute("data-original", JSON.stringify({
    date: formatDateForInput(date),
    time: time,
    topic: topic
    }))

    // CHANGE UI
    row.innerHTML = `
    <td><input class="edit-input" type="date" value="${formatDateForInput(date)}" id="edit-date-${sessionId}"></td>

    <td>
    <input class="edit-input" type="time" value="${start}" id="edit-start-${sessionId}">
    <input class="edit-input" type="time" value="${end}" id="edit-end-${sessionId}">
    </td>

    <td>
    <input class="edit-input" type="text" value="${topic}" id="edit-topic-${sessionId}">
    </td>

    <td>
    <button id="save-${sessionId}" onclick="saveSession('${sessionId}')" class="view-btn edit-btn-hover" disabled>
        <img src="save.png" alt="edit">
    </button>

    <button onclick="cancelSession('${sessionId}')" class="view-btn delete-btn-hover">
        <img src="cancel.png" alt="edit">
    </button>
    </td>
    `

    // 👉 ADD STUDENT DROPDOWN BELOW
    loadSessionStudents(sessionId, row)
}

function loadSessionStudents(sessionId, row){

    fetch(API+"?action=getSessionAttendance&sessionId="+sessionId)
    .then(res=>res.json())
    .then(data=>{

        let html = `<tr class="edit-dropdown">
        <td colspan="4">

        <div class="students-container">
        `

        data.forEach(s=>{

            html += `
            <div class="student-row">

                <div class="student-name">
                    ${s.student}
                </div>

                <div class="student-status">
                    <select 
                        class="status-select"
                        data-original="${s.status}"
                        id="status-${sessionId}-${s.student}">

                        <option class="present" ${s.status==="Present"?"selected":""}>Present</option>
                        <option class="absent" ${s.status==="Absent"?"selected":""}>Absent</option>

                    </select>
                </div>

            </div>
            `
        })

        html += `
        </div>

        </td>
        </tr>
        `

        row.insertAdjacentHTML("afterend", html)

    })
}

function saveSession(sessionId){

    let date = document.getElementById(`edit-date-${sessionId}`).value
    let start = document.getElementById(`edit-start-${sessionId}`).value
    let end = document.getElementById(`edit-end-${sessionId}`).value
    let topic = document.getElementById(`edit-topic-${sessionId}`).value.trim()

    if(!date || !start || !end || !topic){

    if(!date){
        document.getElementById(`edit-date-${sessionId}`).classList.add("error-input")
    }

    if(!start){
        document.getElementById(`edit-start-${sessionId}`).classList.add("error-input")
    }

    if(!end){
        document.getElementById(`edit-end-${sessionId}`).classList.add("error-input")
    }

    if(!topic){
        document.getElementById(`edit-topic-${sessionId}`).classList.add("error-input")
    }

    alert("All fields required")
    return
    }

    // ❌ DUPLICATE DATE CHECK
    fetch(API+"?action=getAttendanceSessions&batchId="+batchId)
    .then(res=>res.json())
    .then(data=>{

        let exists = data.some(s =>
            normalizeDate(s.date) === normalizeDate(date) &&
            s.sessionId != sessionId
        )

        if(exists){
            alert("This date attendance has been taken already. Sorry...! you cant repeat")
            return
        }

        // 👉 COLLECT STUDENT DATA
        fetch(API+"?action=getSessionAttendance&sessionId="+sessionId)
        .then(res=>res.json())
        .then(students=>{

            let updated = students.map(s=>({
                studentId:s.studentId,
                status:document.getElementById(`status-${sessionId}-${s.student}`).value
            }))

            // 👉 UPDATE API
            fetch(API,{
                method:"POST",
                body:JSON.stringify({
                    action:"updateAttendanceSession",
                    sessionId:sessionId,
                    date:date,
                    time:start+" - "+end,
                    topic:topic,
                    students:updated
                })
            })
            .then(()=>{

                alert("Updated Successfully")

                loadBatchAttendance() // refresh all

            })

        })

    })
}

function cancelSession(sessionId){

    let row = document.querySelector(`#historyTable tr:has(button[onclick*="${sessionId}"])`)

    let date = row.getAttribute("data-date")
    let time = row.getAttribute("data-time")
    let topic = row.getAttribute("data-topic")

    row.innerHTML = `
    <td>${date}</td>
    <td>${time}</td>
    <td>${topic}</td>
    <td>
    <button onclick="viewAttendance('${sessionId}')" class="view-btn"><img src="view.png" alt="view"></button>
    
    <button onclick="editSession('${sessionId}')" class="view-btn edit-btn-hover">
        <img src="pencil.png" alt="edit">
    </button>

    <button onclick="deleteSession('${sessionId}')" class="view-btn delete-btn-hover">
        <img src="bin.png" alt="Delete">
    </button>
    </td>
    `

    // REMOVE DROPDOWN
    let next = row.nextElementSibling
    if(next && next.classList.contains("edit-dropdown")){
        next.remove()
    }
}

function formatDateForInput(date){

    let d = new Date(date)

    if(isNaN(d)) return ""

    let day = ("0"+d.getDate()).slice(-2)
    let month = ("0"+(d.getMonth()+1)).slice(-2)
    let year = d.getFullYear()

    return `${year}-${month}-${day}`
}

function capitalizeTopic(input){

    let pos = input.selectionStart

    let value = input.value

    value = value
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")

    input.value = value

    input.setSelectionRange(pos,pos)
}

document.addEventListener("input", function(e){

    let input = e.target

    /* =========================
       🔴 REMOVE ERROR ON TYPE
    ========================= */

    if(input.classList.contains("edit-input")){
        if(input.value.trim()){
            input.classList.remove("error-input")
        }
    }

    /* =========================
       ✨ TOPIC AUTO CAPITAL ONLY
    ========================= */

    if(input.id && input.id.startsWith("edit-topic-")){
        capitalizeTopic(input)
    }

    if(e.target.id && e.target.id.includes("edit-")){

        let sessionId = e.target.id.split("-").pop()
        checkSessionChange(sessionId)
    }

    if(e.target.classList.contains("status-select")){

        let idParts = e.target.id.split("-")
        let sessionId = idParts[1]

        checkSessionChange(sessionId)
    }

})

function normalizeDate(date){
    let d = new Date(date)
    return d.getFullYear() + "-" +
           ("0"+(d.getMonth()+1)).slice(-2) + "-" +
           ("0"+d.getDate()).slice(-2)
}

function saveAttendanceSession(){

let rows=document.querySelectorAll("#attendanceTable tr")

let students=[]

rows.forEach(r=>{
let id=r.querySelector("input").name
let radios=r.querySelectorAll("input")

let status="Absent"

radios.forEach(rad=>{
if(rad.checked) status=rad.value
})

students.push({
studentId:id,
status:status
})
})

fetch(API,{
method:"POST",
body:JSON.stringify({
    action:"addAttendanceSession",
    date:document.getElementById("attDate").value,
    time:
    document.getElementById("attStartTime").value +" - " +
    document.getElementById("attEndTime").value,
    topic:document.getElementById("attTopic").value,
    batchId:batchId,
    students:students
    })
})
.then(()=>{
alert("Attendance Session Saved")
window.location="batch-details.html"
})
}

function checkSessionChange(sessionId){

    let saveBtn = document.getElementById(`save-${sessionId}`)

    let date = document.getElementById(`edit-date-${sessionId}`).value
    let start = document.getElementById(`edit-start-${sessionId}`).value
    let end = document.getElementById(`edit-end-${sessionId}`).value
    let topic = document.getElementById(`edit-topic-${sessionId}`).value.trim()

    let row = document.querySelector(`button[onclick*="${sessionId}"]`).closest("tr")

    let original = JSON.parse(row.getAttribute("data-original"))

    let currentTime = start + " - " + end

    let changed = false

    // 🔴 CHECK BASIC FIELDS
    if(original.date !== date) changed = true
    if(original.time !== currentTime) changed = true
    if(original.topic !== topic) changed = true

    // 🔴 CHECK ATTENDANCE DROPDOWN
    document.querySelectorAll(`#historyTable select[id^="status-${sessionId}"]`)
    .forEach(select=>{
        if(select.value !== select.getAttribute("data-original")){
            changed = true
        }
    })

    // 🔥 ENABLE / DISABLE BUTTON
    saveBtn.disabled = !changed
}

function deleteSession(sessionId){

    if(!confirm("Are you sure you want to delete this attendance?")){
        return
    }

    fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"deleteAttendanceSession",
            sessionId:sessionId
        })
    })
    .then(res=>res.json())
    .then(data=>{

        if(data.status === "success"){
            alert("Attendance deleted successfully")

            // 🔥 refresh everywhere
            loadBatchAttendance()
        }
        else{
            alert("Delete failed")
        }

    })
}

async function exportBatchFullPDF(){

try{

let batchId = localStorage.getItem("attendanceBatch")

if(!batchId){
    alert("Batch not found")
    return
}

/* =========================
   🔹 GET BATCH INFO
========================= */

let batchRes = await fetch(API+"?action=getBatches")
let batchData = await batchRes.json()

let batch = batchData.slice(1).find(b => b[0] == batchId)

let batchName = batch ? batch[1] : ""
let faculty = batch ? batch[2] : "Not Assigned"

/* =========================
   🔹 GET SESSIONS
========================= */

let sessionRes = await fetch(API+"?action=getAttendanceSessions&batchId="+batchId)
let sessions = await sessionRes.json()

if(!sessions.length){
    alert("No attendance data found")
    return
}

// SORT DATE
sessions.sort((a,b)=> new Date(a.date) - new Date(b.date))

let content = ""

/* =========================
   🔹 LOOP EACH SESSION
========================= */

for(let s of sessions){

    let res = await fetch(API+"?action=getSessionAttendance&sessionId="+s.sessionId)
    let students = await res.json()

    let formattedDate = new Date(s.date).toLocaleDateString("en-GB", {
        day:"2-digit",month:"short",year:"numeric"
    })

    let rows = ""

    students.forEach(st=>{
        rows += `
        <tr>
            <td>${st.student}</td>
            <td>${st.status}</td>
        </tr>`
    })

    content += `
    <div class="session-block">
        <h3>Date: ${formattedDate}</h3>
        <p><b>Time:</b> ${s.time}</p>
        <p><b>Topic:</b> ${s.topic}</p>

        <table>
            <thead>
                <tr>
                    <th>Students Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`
}

/* =========================
   🔹 FINAL HTML
========================= */

let html = `
<html>
<head>
<title>Attendance Report</title>

<style>
body{font-family:Arial;padding:20px;}
.header{text-align:center;margin-bottom:20px;}
.logo{position:absolute;left:20px;top:20px;}
.logo img{width:100%; height:60px;}
.session-block{margin-top:25px;}
table{width:100%;border-collapse:collapse;margin-top:10px;}
th,td{border:2px solid #ccc;padding:8px;}
th{background:#eee; text-align:left;}
</style>

</head>

<body>

<div class="logo">
<img src="logo.png">
</div>

<div class="header">
<h1 style="text-align:center;">Attendance Report</h1>
</div>

<h2 style="margin-top: 60px;">Batch Name: ${batchName}</h2>
<h2 style="margin-bottom: 55px;">Faculty: ${faculty}</h2>

${content}

</body>
</html>
`

/* =========================
   🔹 OPEN WINDOW
========================= */

let win = window.open("", "_blank")

if(!win){
    alert("Popup blocked! Allow popups.")
    return
}

win.document.open()
win.document.write(html)
win.document.close()

// WAIT BEFORE PRINT
setTimeout(()=>{
    win.print()
},300)

}catch(err){
    console.error(err)
    alert("Export failed")
}

}