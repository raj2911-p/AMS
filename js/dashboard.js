window.addEventListener("load", function () {

loadTodayBirthdays()
loadCounts()
updateTime()
setInterval(updateTime,1000)

// 🔥 ADD THIS
loadProfileImage()

})

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

/* ================= BIRTHDAY REMINDER ================= */

function loadTodayBirthdays(){

fetch(API + "?action=getStudents")
.then(res => res.json())
.then(data => {

    let role = localStorage.getItem("role")
    let isAdmin = role === "Admin"

    let today = new Date()

    let todayDay = today.getDate()
    let todayMonth = today.getMonth() + 1

    let container = document.getElementById("birthdayList")

    let html = ""
    let found = false

    data.slice(1).forEach(s => {

        let name = s[1]
        let dob = s[2]
        let phone = s[3]
        let wishedDate = s[5]   // column index
        let todayStr = new Date().toISOString().slice(0,10)

        let wished = wishedDate === todayStr

        if(!dob) return

        let d = new Date(dob)

        let day = d.getDate()
        let month = d.getMonth() + 1

        if(day === todayDay && month === todayMonth){

            found = true

            let message = `✨*Happy Birthday ${name}!*✨\n🎉🎂🎁🎈🥳🎊\nOn Your Special Day May God Bless You with lots of\nHappiness 😊,\nJoy 😂,\nPeace ✌🏻,\nSuccess 🏆💯 and\n💪 Good Health 👍...\nWish you a great year ahead 👍🏻😊\n\nWarm Regards,\n*SITH*\n*(Suhradam Information Technology Hub).*`
            let whatsappLink = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeWhatsAppMessage(message)}`

             html += `
                <div class="birthday-item ${wished ? "wished" : ""}">
                    <span>${name}</span>
                    <div class="wish-line">
                        <b>${wished ? "✔ Wishes Sent" : "Send Wishes 👉"}</b> 
                        <a 
                        href="${(wished || !isAdmin) ? "#" : whatsappLink}" 
                        target="_blank"
                        onclick="handleWishClick('${s[0]}', this)"
                        class="whatsapp-btn ${(wished || !isAdmin) ? "disabled-btn" : ""}">
                            <img src="js/whatsapp.png" alt="whatsapp">
                        </a>
                    </div>
                </div>
                `
        }

    })

    if(!found){
        html = "<p>No Students Have Birthdays Today...!</p>"
    }

    container.innerHTML = html

})
}

function encodeWhatsAppMessage(msg){
    return encodeURIComponent(msg).replace(/'/g,"%27").replace(/"/g,"%22")
}

// SET USERNAME
document.addEventListener("DOMContentLoaded", () => {

let user = localStorage.getItem("user") || "Admin"
document.getElementById("adminName").innerText = user

})


// TOGGLE DROPDOWN
document.getElementById("adminBox").addEventListener("click", function(e){

let dropdown = document.getElementById("dropdown")

dropdown.style.display = dropdown.style.display === "block" ? "none" : "block"

e.stopPropagation()

})


// CLOSE WHEN CLICK OUTSIDE
document.addEventListener("click", function(){

document.getElementById("dropdown").style.display = "none"

})


// PROFILE
function openProfile(){

localStorage.removeItem("createMode")   // ✅ VERY IMPORTANT

window.location = "profile.html"
}


/* ================= LOGOUT ================= */
function logout(){
localStorage.clear()
window.location = "index.html"
}

function markWished(studentId, el){

let today = new Date().toISOString().slice(0,10)

// 🔥 BACKEND SAVE
fetch(API,{
    method:"POST",
    body:JSON.stringify({
        action:"markBirthdayWished",
        studentId:studentId,
        date:today
    })
})
.then(res=>res.json())
.then(()=>{

    // 🔥 UI UPDATE
    let parent = el.closest(".birthday-item")
    parent.classList.add("wished")
    parent.querySelector(".wish-line b").innerText = "✔ Wishes Sent"

})
}

function handleWishClick(studentId, el){

let role = localStorage.getItem("role")

// ❌ NOT ADMIN
if(role !== "Admin"){
    alert("Only Admin can send wishes ❌")
    return false
}

let parent = el.closest(".birthday-item")

// ❌ already wished
if(parent.classList.contains("wished")){
    return false
}

// ✅ WhatsApp OPEN hone do (IMPORTANT)
// 👉 koi preventDefault nahi

// 🔥 thoda delay ke baad UI update
setTimeout(()=>{

    parent.classList.add("wished")
    parent.querySelector(".wish-line b").innerText = "✔ Wishes Sent"

    el.classList.add("disabled-btn")
    el.style.pointerEvents = "none"
    el.removeAttribute("href")

},500)

// ✅ backend save
let today = new Date().toISOString().slice(0,10)

fetch(API,{
    method:"POST",
    body:JSON.stringify({
        action:"markBirthdayWished",
        studentId:studentId,
        date:today
    })
})

}

function loadProfileImage(){

let user = localStorage.getItem("user")
let img = localStorage.getItem("profilePhoto")

if(img){
    document.getElementById("navProfileImg").src = img
}

fetch(API+"?action=getProfile&username="+encodeURIComponent(user))
.then(res=>res.json())
.then(data=>{

let img = data.photo || localStorage.getItem("profilePhoto")

document.getElementById("navProfileImg").src =
img || "https://i.pravatar.cc/40"

})
}