let batchId = localStorage.getItem("attendanceBatch")

window.onload=function(){

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

}

/* OPEN ADD STUDENTS POPUP */

function openAddStudents(){

document.getElementById("studentPopup").style.display="block"
loadAllStudents()

}

/* LOAD ALL STUDENTS */

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

})

})

}

/* SAVE STUDENTS TO BATCH */

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

        loadAllStudents()        // reload list
        updateStudentCount()     // update selected count
        updateBatchCount()       // update batch count

    })

})

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

let topic = document.getElementById("attTopic").value.trim()

if (!topic) {
    alert("Topic is required")
    return
}

let start = document.getElementById("attStartTime").value
let end = document.getElementById("attEndTime").value

if (!start || !end) {
    alert("Start and End time required")
    return
}

if (!topic && (!start || !end)) {
    alert("Topic, Start Time and End Time is required")
    return
}

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

let selectedDate = document.getElementById("attDate").value

fetch(API+"?action=getAttendanceSessions&batchId="+batchId)
.then(res=>res.json())
.then(data=>{

    let exists = data.some(s =>
        normalizeDate(s.date) === normalizeDate(selectedDate)
    )

    if(exists){
        alert("This date attendance has been taken already. Sorry...! you cant repeat")
        return
    }

    // ✅ IF NOT EXISTS → THEN SAVE
    saveAttendanceSession()
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

batchId:localStorage.getItem("attendanceBatch"),
students:students

})
})

.then(()=>{
alert("Attendance Session Saved")
window.location="batch-details.html"
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
<button onclick="viewAttendance('${a.sessionId}','${a.date}','${a.time}','${a.topic}','${batchId}')"><b>View</b></button>
<button class="edit-btn" onclick="editSession('${a.sessionId}')"><b>Edit</b></button>
<button class="delete-btn" onclick="deleteSession('${a.sessionId}')"><b>Delete</b></button>
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
    <button class="edit-btn" id="save-${sessionId}" onclick="saveSession('${sessionId}')" disabled><b>Save</b></button>
    <button class="delete-btn" onclick="cancelSession('${sessionId}')"><b>Cancel</b></button>
    </td>
    `

    // 👉 ADD STUDENT DROPDOWN BELOW
    loadSessionStudents(sessionId, row)
}

function loadSessionStudents(sessionId, row){

    fetch(API+"?action=getSessionAttendance&sessionId="+sessionId)
    .then(res=>res.json())
    .then(data=>{

        let html = `<tr class="edit-dropdown"><td colspan="4">`

        data.forEach(s=>{

            html += `
            <div style="margin:5px 0">
            ${s.student}

            <select 
                class="status-select"
                data-original="${s.status}"
                id="status-${sessionId}-${s.student}">

            <option class="present" ${s.status==="Present"?"selected":""}>Present</option>
            <option class="absent" ${s.status==="Absent"?"selected":""}>Absent</option>

            </select>

            </div>
            `
        })

        html += `</td></tr>`

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
    <button onclick="viewAttendance('${sessionId}')"><b>View</b></button>
    <button onclick="editSession('${sessionId}')"><b>Edit</b></button>
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