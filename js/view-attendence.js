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

fetch(API+"?action=getBatches")
.then(res=>res.json())
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

fetch(API+"?action=getSessionAttendance&sessionId="+sessionId)

.then(res=>res.json())

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