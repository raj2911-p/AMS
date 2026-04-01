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


window.onload = function () {
    loadBatch()
}

/* ===== NORMALIZE NAME (IMPORTANT) ===== */
function normalize(name){
    return name.replace(/\s+/g,"").toLowerCase()
}

/* ===== FORMAT NAME ===== */
function formatName(name){
    return name
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
}

/* ===== CREATE BATCH ===== */

function createBatch(){

    let name = formatName(document.getElementById("batchName").value)
    let faculty = formatName(document.getElementById("facultyName").value)

    if(!name.trim() || !faculty.trim()){

    if(!name.trim()){
        document.getElementById("batchName").classList.add("error-input")
    }

    if(!faculty.trim()){
        document.getElementById("facultyName").classList.add("error-input")
    }

    alert("Batch Name and Faculty Name are required")
    return
    }

    apiGet({action:"getBatches"})
    .then(res=>res.json())
    .then(data=>{

        let exists = false

        data.slice(1).forEach(b=>{
            if(normalize(b[1]) === normalize(name)){
                exists = true
            }
        })

        if(exists){
            alert("Batch already exists")
            return
        }

        apiPost({
            method:"POST",
            body:JSON.stringify({
                action:"createBatch",
                name:name,
                faculty:faculty
            })
        })
        .then(res=>res.json())
        .then(()=>{
            alert("Batch Created")

            document.getElementById("batchName").value=""
            document.getElementById("facultyName").value=""

            loadBatch()
        })

    })

}

/* ===== LOAD ===== */

function loadBatch(){

    apiGet({action:"getBatches"})
    .then(res=>res.json())
    .then(data=>{

        fetch(API+"?action=getBatchStudentCount")
        .then(res=>res.json())
        .then(counts=>{

            let table=document.getElementById("batchTable")
            table.innerHTML=""

            data.slice(1).forEach(b=>{

                let count = counts[b[0]] || 0

                table.innerHTML+=`

<tr id="row-${b[0]}" data-count="${count}">

<td>${b[1]}</td>
<td>${b[2] || "N/A"}</td>
<td>${count}</td>

<td>
<button onclick="openBatch('${b[0]}')"><b>Open</b></button>

<button class="edit-btn"
onclick="enableBatchEdit('${b[0]}','${b[1]}','${b[2] || ""}')">
<b>Edit</b>
</button>

<button class="delete-btn"
onclick="deleteBatch('${b[0]}')">
<b>Delete</b>
</button>

</td>

</tr>
`
            })

        })

    })

}

/* ===== EDIT ===== */

function enableBatchEdit(id,name,faculty){

    let row = document.getElementById("row-"+id)

    row.innerHTML=`

<td><input class="edit-input" id="name-${id}" value="${name}" oninput="checkBatchChange('${id}')"></td>
<td><input class="edit-input" id="faculty-${id}" value="${faculty}" oninput="checkBatchChange('${id}')"></td>
<td>-</td>

<td>
<button id="save-${id}" class="edit-btn" onclick="saveBatchEdit('${id}')" disabled><b>Save</b></button>
<button onclick="cancelBatchEdit('${id}')" class="delete-btn"><b>Cancel</b></button>
</td>
`

    row.setAttribute("data-name", name)
    row.setAttribute("data-faculty", faculty)
}

/* ===== CHECK CHANGE ===== */

function checkBatchChange(id){

    let row = document.getElementById("row-"+id)

    let oldName = normalize(row.getAttribute("data-name"))
    let oldFaculty = normalize(row.getAttribute("data-faculty"))

    let newName = normalize(document.getElementById("name-"+id).value)
    let newFaculty = normalize(document.getElementById("faculty-"+id).value)

    let btn = document.getElementById("save-"+id)

    if(oldName !== newName || oldFaculty !== newFaculty){
        btn.disabled = false
    }else{
        btn.disabled = true
    }

}
/* ===== SAVE EDIT ===== */

function saveBatchEdit(id){

    // 👉 STEP 1: raw value lo
    let name = document.getElementById("name-"+id).value.trim()
    let faculty = document.getElementById("faculty-"+id).value.trim()

    // 👉 STEP 2: format karo
    name = formatName(name)
    faculty = formatName(faculty)

    if(!name.trim() || !faculty.trim()){

    if(!name.trim()){
        document.getElementById("name-"+id).classList.add("error-input")
    }

    if(!faculty.trim()){
        document.getElementById("faculty-"+id).classList.add("error-input")
    }

    alert("Batch Name and Faculty Name are required")
    return
    }

    // 👉 STEP 3: duplicate check
    apiGet({action:"getBatches"})
    .then(res=>res.json())
    .then(data=>{

        let exists = false

        data.slice(1).forEach(b=>{

            // 🔥 IMPORTANT LINE
            if(b[0] != id && normalize(b[1]) === normalize(name)){
                exists = true
            }

        })

        if(exists){
            alert("Batch already exists")
            return
        }

        // 👉 STEP 4: update
        apiPost({
            method:"POST",
            body:JSON.stringify({
                action:"updateBatch",
                id:id,
                name:name,
                faculty:faculty
            })
        })
        .then(res=>res.json())
        .then(()=>{
            alert("Updated Successfully")
            loadBatch()
        })

    })

}

/* ===== DELETE ===== */

function deleteBatch(id){

    if(confirm("Delete this batch?")){

        console.log("Deleting ID:", id)   // 🔥 yaha add kiya

        apiPost({
            method:"POST",
            body:JSON.stringify({
                action:"deleteBatch",
                id:id
            })
        })
        .then(res=>{
            console.log("Response:", res)   // 🔥 yaha add kiya
            return res.json()
        })
        .then(data=>{
            console.log("Data:", data)   // 🔥 extra debug

            alert("Batch Deleted")
            loadBatch()
        })
        .catch(err=>{
            console.error("Error:", err)
            alert("Delete failed")
        })

    }

}

function cancelBatchEdit(id){

    let row = document.getElementById("row-"+id)

    let name = row.getAttribute("data-name")
    let faculty = row.getAttribute("data-faculty")

    let count = row.getAttribute("data-count") || "-"

    row.innerHTML = `
<td>${name}</td>
<td>${faculty || "N/A"}</td>
<td>${count}</td>

<td>
<button onclick="openBatch('${id}')"><b>Open</b></button>

<button class="edit-btn"
onclick="enableBatchEdit('${id}','${name}','${faculty}')">
<b>Edit</b>
</button>

<button class="delete-btn"
onclick="deleteBatch('${id}')">
<b>Delete</b>
</button>
</td>
`
}

/* ===== OPEN ===== */

function openBatch(id){
    localStorage.setItem("attendanceBatch",id)
    window.location="batch-details.html"
}

/* ===== AUTO CAPITALIZE ===== */

function capitalizeLive(input){

    let start = input.selectionStart

    let value = input.value

    value = value
    .split(" ")
    .map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase())
    .join(" ")

    input.value = value

    input.setSelectionRange(start,start)
}

/* APPLY TO INPUTS */

document.addEventListener("input",function(e){

     // 👉 Batch Name
    if(e.target.id === "batchName"){
        capitalizeLive(e.target)
        if(e.target.value.trim()){
            e.target.classList.remove("error-input")
        }
    }

    // 👉 Faculty Name
    if(e.target.id === "facultyName"){
        capitalizeLive(e.target)
        if(e.target.value.trim()){
            e.target.classList.remove("error-input")
        }
    }

    if(e.target.id && e.target.id.startsWith("name-")){
        capitalizeLive(e.target)
        if(e.target.value.trim()){
            e.target.classList.remove("error-input")
        }
    }

    if(e.target.id && e.target.id.startsWith("faculty-")){
        capitalizeLive(e.target)
        if(e.target.value.trim()){
            e.target.classList.remove("error-input")
        }
    }

})

function exportBatchPDF(){

    let table = document.querySelector("table")

    if(!table){
        alert("Table not found")
        return
    }

    // ✅ CLONE TABLE
    let clone = table.cloneNode(true)

    // ============================
    // ❌ REMOVE ACTION COLUMN
    // ============================

    clone.querySelectorAll("tr").forEach(row=>{
        if(row.children.length > 0){
            row.removeChild(row.lastElementChild)
        }
    })

    // ============================
    // ✅ ADD SR.NO COLUMN
    // ============================

    let rows = clone.querySelectorAll("tr")

    let th = document.createElement("th")
    th.innerText = "Sr. No."
    rows[0].insertBefore(th, rows[0].firstChild)

    for(let i=1;i<rows.length;i++){
        let td = document.createElement("td")
        td.innerText = i
        rows[i].insertBefore(td, rows[i].firstChild)
    }

    // ============================
    // ✅ HTML TEMPLATE
    // ============================

    let html = `
    <html>
    <head>
    <title>Batches Report</title>

    <style>
    body{
        font-family:'Segoe UI',sans-serif;
        padding:20px;
    }

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

    .header-title{
        font-size:22px;
        font-weight:700;
    }

    table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
    }

    th,td{
        border:1px solid #ccc;
        padding:10px;
        text-align:left;
    }

    th{
        background:#f2f2f2;
    }
    </style>
    </head>

    <body>

    <div class="header">
        <div class="logo">
            <img src="logo.png">
        </div>

        <h1 style="text-align: center;">Batch Database</h1>
    </div>

    ${clone.outerHTML}

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

    win.onload = function(){
        setTimeout(()=>{
            win.print()
        },300)
    }
}