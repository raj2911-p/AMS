window.onload = function () {

loadCounts()
updateTime()
setInterval(updateTime,1000)

}

/* ================= LOAD COUNTS ================= */

function loadCounts(){

/* STUDENTS */

fetch(API+"?action=getStudents")
.then(res=>res.json())
.then(data=>{

let total=data.length-1
animateNumber("totalStudents",total)

})

/* BATCHES */

fetch(API+"?action=getBatches")
.then(res=>res.json())
.then(data=>{

let total=data.length-1
animateNumber("totalBatches",total)

createChart(data)

})

/* ATTENDANCE */

fetch(API+"?action=getTodayAttendance")
.then(res=>res.json())
.then(data=>{

animateNumber("presentToday",data.present)
animateNumber("absentToday",data.absent)

})

}


/* ================= NUMBER ANIMATION ================= */

function animateNumber(id,target){

let el=document.getElementById(id)

let count=0
let increment=Math.max(1,Math.ceil(target/40))

let timer=setInterval(()=>{

count+=increment

if(count>=target){
count=target
clearInterval(timer)
}

el.innerText=count

},20)

}


/* ================= CHART ================= */

function createChart(data){

let batchNames=[]
let studentCounts=[]

data.slice(1).forEach(b=>{

batchNames.push(b[1])

})

fetch(API+"?action=getBatchStudentCount")

.then(res=>res.json())

.then(counts=>{

batchNames.forEach((name,i)=>{

let batchId=data[i+1][0]

studentCounts.push(counts[batchId] || 0)

})

const ctx=document.getElementById("batchChart").getContext("2d")

new Chart(ctx,{

type:"bar",

data:{
labels:batchNames,

datasets:[{
label:"Students",
data:studentCounts,

backgroundColor:"#3366d6",
hoverBackgroundColor:"#1e40af",
hoverBorderColor:"#1e3a8a",
hoverBorderWidth:2,
borderRadius:6
}]
},

options:{

responsive:true,

animation:{

duration:1200,

easing:"easeOutQuart",

delay:(context)=>{
return context.dataIndex * 200   // each bar delayed
}

},

plugins:{
legend:{
display:false
}
},

scales:{
y:{
beginAtZero:true
}
}

}

})

})

}


/* ================= DATE TIME ================= */

function updateTime(){

let now=new Date()

document.getElementById("datetime").innerText=
now.toLocaleDateString()+" | "+now.toLocaleTimeString()

}


/* ================= LOGOUT ================= */

function logout(){

localStorage.removeItem("admin")
window.location="login.html"

}