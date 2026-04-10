let sessionId = localStorage.getItem("viewSession")

let date = localStorage.getItem("viewDate")
let time = localStorage.getItem("viewTime")
let topic = localStorage.getItem("viewTopic")
let batchId = localStorage.getItem("viewBatchId")

document.getElementById("attDate").innerText =
new Date(date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})

document.getElementById("attTime").innerText = time
document.getElementById("attTopic").innerText = topic


/* LOAD BATCH NAME + FACULTY */

fetchCached(API+"?action=getBatches")
.then(data=>{

data.slice(1).forEach(b=>{

if(b[0]==batchId){

document.getElementById("batchName").innerText = "Batch : " + b[1]
document.getElementById("facultyName").innerText =
"Faculty : " + (b[2] || "Not Assigned")

}

})

})


/* LOAD ATTENDANCE */

fetchCached(API+"?action=getSessionAttendance&sessionId="+sessionId)

.then(data=>{

let table=document.getElementById("attendanceView")

table.innerHTML=""

let present=0
let absent=0

data.forEach(a=>{

let statusClass = a.status === "Present" ? "status-present" : "status-absent"

if(a.status === "Present"){
present++
}else{
absent++
}

table.innerHTML+=`

<tr>

<td>${a.studentName || a.student || "Deleted Student"}</td>

<td>
<span class="status-badge ${statusClass}">
${a.status}
</span>
</td>

</tr>

`

})

document.getElementById("presentCount").innerText = present
document.getElementById("absentCount").innerText = absent

})

async function exportSingleAttendancePDF(){

try{

let date = localStorage.getItem("viewDate")
let time = localStorage.getItem("viewTime")
let topic = localStorage.getItem("viewTopic")
let batchId = localStorage.getItem("viewBatchId")
let sessionId = localStorage.getItem("viewSession")

/* 🔹 BATCH INFO */
let batchData = await fetchCached(API+"?action=getBatches")

let batch = batchData.slice(1).find(b => b[0] == batchId)

let batchName = batch ? batch[1] : ""
let faculty = batch ? batch[2] : "Not Assigned"

/* 🔹 STUDENTS */
let students = await fetchCached(API+"?action=getSessionAttendance&sessionId="+sessionId)

let rows = ""

students.forEach(st=>{
    rows += `
    <tr>
        <td>${st.student}</td>
        <td>${st.status}</td>
    </tr>`
})

let formattedDate = new Date(date).toLocaleDateString("en-GB", {
day:"2-digit",month:"short",year:"numeric"
})

/* 🔹 HTML */
let html = `
<html>
<head>
<title>Attendance Report</title>
<style>
body{font-family:Arial;padding:25px;}
.logo{position:absolute;left:0;}
.logo img{height:60px;}
table{width:100%;border-collapse:collapse;margin-top:10px;}
th,td{border:1px solid #ccc;padding:8px;}
th{background:#f2f2f2;}
</style>
</head>

<body>

<div class="logo">
<img src="logo.png">
</div>

<h1 style="text-align:center;">Attendance Report</h1>

<h3 style="margin-top:50px;">Batch: ${batchName}</h3>
<h3>Faculty: ${faculty}</h3>
<h3>Date: ${formattedDate}</h3>
<h3>Time: ${time}</h3>
<h3>Topic: ${topic}</h3>

<table>
<thead>
<tr>
<th>Student Name</th>
<th>Status</th>
</tr>
</thead>

<tbody>
${rows}
</tbody>
</table>

</body>
</html>
`

let win = window.open("", "_blank")

if(!win){
    alert("Popup blocked!")
    return
}

win.document.write(html)
win.document.close()

setTimeout(()=>{ win.print() },300)

}catch(err){
console.error(err)
alert("Export failed")
}
}