const API = "https://script.google.com/macros/s/XXXXX/exec"
const PROXY = "https://api.allorigins.win/raw?url="

function apiGet(params){
  let url = API + "?" + new URLSearchParams(params).toString()
  return fetch(PROXY + encodeURIComponent(url))
    .then(res => res.text())
    .then(text => {
      try{return JSON.parse(text)}catch(e){return []}
    })
}

function apiPost(data){
  return apiPost({
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  }).then(res=>res.json())
}


const studentId = localStorage.getItem("studentProfile")

let studentNameGlobal = ""
let studentDobGlobal = ""
let studentPhoneGlobal = ""
let studentEmailGlobal = ""

window.onload = function(){
loadStudentAttendance()
}

function loadStudentAttendance(){

Promise.all([
apiGet({action:"getStudents"}).then(res=>res.json()),
apiGet({action:"getBatches"}).then(res=>res.json())
])

.then(([students,batches])=>{

students.forEach(s=>{
if(s[0]==studentId){
studentNameGlobal = s[1]
studentDobGlobal = s[2]      // ✅ NEW
studentPhoneGlobal = s[3]
studentEmailGlobal = s[4]
}
})

if(!studentNameGlobal){
document.getElementById("studentName").innerText = "Student Deleted"
return
}

/* SET DETAILS */
document.getElementById("studentName").innerText = studentNameGlobal
document.getElementById("studentName").title = studentNameGlobal
document.getElementById("studentDob").innerText = formatDOB(studentDobGlobal) 
document.getElementById("studentPhone").innerText = studentPhoneGlobal
document.getElementById("studentEmail").innerText = studentEmailGlobal

calculateFullPercentage(batches)
loadSessions(batches)

})

}

/* ===== PERCENTAGE ===== */

function calculateFullPercentage(batches){

let total = 0        // total attendance entries of student
let presentCount = 0

let promises = []

batches.slice(1).forEach(batch=>{

promises.push(

fetch(API+"?action=getAttendanceSessions&batchId="+batch[0])
.then(res=>res.json())
.then(sessions=>{

let sessionPromises = sessions.map(session=>{

return fetch(API+"?action=getSessionAttendance&sessionId="+session.sessionId)
.then(res=>res.json())
.then(attendance=>{

attendance.forEach(a=>{

/* ✅ ONLY COUNT THIS STUDENT */

if(a.student == studentNameGlobal){

total++   // only when student exists in session

if(a.status === "Present"){
presentCount++
}

}

})

})

})

return Promise.all(sessionPromises)

})

)

})

Promise.all(promises).then(()=>{

let percent = total === 0 ? 0 : Math.round((presentCount / total) * 100)

document.getElementById("attendancePercent").innerText = percent + "%"
document.getElementById("attendanceBar").style.width = percent + "%"

/* COLOR */

let bar = document.getElementById("attendanceBar")

if(percent < 50){
bar.style.background = "#dc2626"
}
else if(percent < 75){
bar.style.background = "#f59e0b"
}
else{
bar.style.background = "#16a34a"
}

})

}

/* ===== HISTORY ===== */

function loadSessions(batches){

let table = document.getElementById("studentAttendance")
table.innerHTML=""

let allRows = []   // store final rows

let promises = []

batches.slice(1).forEach(batch=>{

promises.push(

fetch(API+"?action=getAttendanceSessions&batchId="+batch[0])
.then(res=>res.json())
.then(sessions=>{

let sessionPromises = sessions.map(session=>{

return fetch(API+"?action=getSessionAttendance&sessionId="+session.sessionId)
.then(res=>res.json())
.then(attendance=>{

attendance.forEach(a=>{

if(a.student == studentNameGlobal){

allRows.push({
date: session.date,
time: session.time,
batch: batch[1],
status: a.status
})

}

})

})

})

return Promise.all(sessionPromises)

})

)

})

Promise.all(promises).then(()=>{

/* ✅ SORT AFTER ALL DATA COLLECTED */

allRows.sort((a,b)=> new Date(b.date) - new Date(a.date))

/* ✅ RENDER AFTER SORT */

allRows.forEach(row=>{

table.innerHTML += `
<tr>
<td>${
new Date(row.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
}</td>
<td>${row.time}</td>
<td>${row.batch}</td>
<td>
<span class="${row.status === 'Present' ? 'status-present' : 'status-absent'}">
${row.status}
</span>
</td>
</tr>
`

})

})

}

/* ===== EXPORT PDF ===== */

function exportFullStudentProfile(){

    try{

        let name = document.querySelector("#studentName")?.innerText || ""
        let dob = document.querySelector("#studentDob")?.innerText || ""
        let mobile = document.querySelector("#studentPhone")?.innerText || ""
        let email = document.querySelector("#studentEmail")?.innerText || ""
        let percent = document.querySelector("#attendancePercent")?.innerText || "0%"

        let table = document.querySelector("#studentAttendance")

        if(!table){
            alert("Table not found")
            return
        }

        let clone = table.cloneNode(true)

        let html = `
        <html>
        <head>
        <title>Student Profile</title>

        <style>
        body{font-family:'Segoe UI',sans-serif;padding:20px;background:#f8fafc;}

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

        /* ===== MAIN ===== */

        .container{
            display:flex;
            flex-direction:column;
            gap:20px;
        }

        .card, .table-box{
            background:white;
            padding:20px;
            border-radius:12px;
            box-shadow:0 4px 10px rgba(0,0,0,0.1);
        }

        .card{
            width: fit-content;
        }

        .percent-text{
            font-weight:700;
            font-size:18px;
            color:#111827;
        }

        /* TABLE */

        table{width:100%;border-collapse:collapse;}

        th,td{
            padding:10px;
            border:1px solid #9b9898;
            text-align:left;
        }

        th{background: #c2d0df;}

        </style>
        </head>

        <body>

        <!-- ✅ HEADER -->
        <div class="header">

            <div class="logo">
                <img src="logo.png">   <!-- 👉 yaha apna logo link daalo -->
            </div>

            <h1 style="text-align:center;"> Attendance Report </h1>

        </div>

        <h2 style="text-align: center;">Student Profile</h2>

        <div class="container">

            <div class="card">

                <h3>Student Name: ${name}</h3>
                <h3>Date of Birth: ${dob}</h3>
                <h3>Mobile No.: +91 ${mobile}</h3>
                <h3>Email-ID: ${email}</h3>
                <h3>Attendance %: <span class="percent-text">${percent}</span></h3>
            </div>

            <div class="table-box">
                <h3>Attendance History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Batch</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clone.innerHTML}
                    </tbody>
                </table>
            </div>

        </div>

        </body>
        </html>
        `

        let win = window.open("", "_blank")

        if(!win){
            alert("Popup blocked! Allow popups.")
            return
        }

        win.document.write(html)
        win.document.close()
        win.focus()

        setTimeout(()=>{
            win.print()
        },300)

    }catch(err){
        console.error(err)
        alert("Export failed")
    }
}

function formatDOB(dob){

    if(!dob) return "-"

    let d = new Date(dob)

    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    })
}