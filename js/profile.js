let originalData = {}

let createMode = localStorage.getItem("createMode") === "true"

window.onload = function(){
loadProfile()
}

/* LOAD PROFILE */

function loadProfile(){

console.log("Stored User:", localStorage.getItem("user"))

if(createMode){

/* CREATE MODE */
document.querySelectorAll("input").forEach(i=>{
i.disabled=false
i.value=""
})

document.getElementById("password").disabled = false

document.getElementById("role").value = "Faculty"
document.getElementById("editBtn").style.display="none"
document.getElementById("updateBtn").innerText="Create"
document.getElementById("updateBtn").disabled=true

/* 🔥 IMPORTANT FIX */
localStorage.removeItem("createMode")   // ✅ REMOVE AFTER USE

return
}

/* NORMAL PROFILE LOAD */

let user = (localStorage.getItem("user") || "").trim()

fetch(API+"?action=getProfile&username="+encodeURIComponent(localStorage.getItem("user")))
.then(res=>res.json())
.then(data=>{

originalData = {...data}

document.getElementById("name").value = data.name || ""
document.getElementById("mobile").value = data.mobile || ""
document.getElementById("email").value = data.email || ""
document.getElementById("username").value = data.username || ""
document.getElementById("password").value = data.password || ""
document.getElementById("role").value = data.role || ""
document.getElementById("courses").value = data.courses || ""

/* 🔒 PASSWORD ALWAYS LOCK */
document.getElementById("password").disabled = true

})

}

/* ENABLE EDIT */

function enableEdit(){

document.querySelectorAll("input").forEach(i=>i.disabled=false)

/* ❌ USERNAME LOCK */
document.getElementById("username").disabled = false
/* 🔒 PASSWORD LOCK */
document.getElementById("password").disabled = true

document.getElementById("editBtn").innerText="Editing..."

document.querySelectorAll("input").forEach(input=>{
input.oninput = checkChanges
})

}

/* CHECK CHANGES */

function checkChanges(){

let changed = false

if(
document.getElementById("name").value !== originalData.name ||
document.getElementById("mobile").value !== originalData.mobile ||
document.getElementById("email").value !== originalData.email ||
document.getElementById("username").value !== originalData.username ||
document.getElementById("password").value !== originalData.password ||
document.getElementById("role").value !== originalData.role ||
document.getElementById("courses").value !== originalData.courses
){
changed = true
}

let btn = document.getElementById("updateBtn")

if(changed){
btn.disabled = false
btn.classList.add("active")
}else{
btn.disabled = true
btn.classList.remove("active")
}

}

/* UPDATE PROFILE */

function updateProfile(){

let data = {
action: createMode ? "createFaculty" : "updateProfile",

name: capitalizeWords(document.getElementById("name").value.trim()),
mobile: document.getElementById("mobile").value.replace(/\s/g,""),
email: document.getElementById("email").value.trim(),
username: document.getElementById("username").value.trim(),
password: document.getElementById("password").value.trim(),
role: capitalizeWords(document.getElementById("role").value.trim()),
courses: capitalizeWords(document.getElementById("courses").value.trim())
}

/* VALIDATION */
if(!validateForm(data)) return

fetch(API,{
method:"POST",
body:JSON.stringify(data)
})
.then(res=>res.json())
.then(res=>{

if(res.status=="exists"){
alert("Username already exists ❌")
return
}

if(createMode){
alert("✅ Faculty Created Successfully")
/* 🔒 LOCK PASSWORD AFTER CREATE */
document.getElementById("password").disabled = true
localStorage.removeItem("createMode")
window.location="dashboard.html"
}else{
document.getElementById("msg").innerText="✅ Profile Updated"
loadProfile()
}

})
}

document.querySelectorAll("input").forEach(input=>{

input.addEventListener("input",function(){

let id = this.id
let value = this.value.trim()

/* PASSWORD STRENGTH (ONLY CREATE MODE) */
if(id=="password" && createMode){

let strengthText = document.getElementById("passStrength")

if(value.length === 0){
strengthText.innerText = ""
}

else if(value.length < 8){
strengthText.innerText = "Weak Password ❌"
strengthText.style.color = "red"
this.style.border = "2px solid red"
}

else{
strengthText.innerText = "Strong Password ✅"
strengthText.style.color = "green"
this.style.border = "1px solid green"
}

}

/* DEFAULT RESET */
this.style.border = "1px solid #ccc"

/* ✅ ENABLE CREATE BUTTON ON ANY INPUT */
let btn = document.getElementById("updateBtn")

if(createMode){
btn.disabled = false
btn.classList.add("active")
}

if(id=="name" || id=="role" || id=="courses"){
this.value = this.value.replace(/\b\w/g, c => c.toUpperCase())
}

/* NAME */
if(id=="name" && value){
this.style.border = "1px solid green"
}

/* MOBILE */
if(id=="mobile"){
let mobilePattern = /^\+91\d{10}$/
if(mobilePattern.test(value)){
this.style.border = "1px solid green"
}else{
this.style.border = "2px solid red"
}
}

/* EMAIL */
if(id=="email"){
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if(emailPattern.test(value)){
this.style.border = "1px solid green"
}else{
this.style.border = "2px solid red"
}
}

/* USERNAME */
if(id=="username"){
if(value && !value.includes(" ")){
this.style.border = "1px solid green"
}else{
this.style.border = "2px solid red"
}
}

/* OTHER FIELDS */
if((id=="role" || id=="courses" || id=="password") && value){
this.style.border = "1px solid green"
}

})

})

document.getElementById("mobile").addEventListener("input", function(){

if(!this.value.startsWith("+91")){
let num = this.value.replace(/\D/g,"")   // only digits
if(num.startsWith("91")) num = num.slice(2)
num = num.slice(0,10)
this.value = "+91" + num
}

})

/* ❌ NO SPACES ALLOWED IN USERNAME */
document.getElementById("username").addEventListener("input",function(){
this.value = this.value.replace(/\s/g,"")
})

/* ❌ NO SPACES IN MOBILE */
document.getElementById("mobile").addEventListener("input",function(){
this.value = this.value.replace(/\s/g,"")
})

function capitalizeWords(str){
return str.replace(/\b\w/g,c=>c.toUpperCase())
}

function validateForm(data){

let valid = true

/* RESET */
document.querySelectorAll("input").forEach(i=>{
i.style.border="1px solid #ccc"
})

/* REQUIRED */
Object.keys(data).forEach(key=>{

if(key === "action") return   // ✅ FIX (IMPORTANT)

let field = document.getElementById(key)

if(!field) return            // ✅ EXTRA SAFETY

if(!data[key] || data[key].trim() === ""){
field.style.border="2px solid red"
valid=false
}else{
field.style.border="1px solid green"
}

})

/* MOBILE */
let mobilePattern = /^\+91\d{10}$/
if(!mobilePattern.test(data.mobile)){
alert("Invalid Mobile No.")
document.getElementById("mobile").style.border="2px solid red"
valid=false
}

/* EMAIL */
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if(!emailPattern.test(data.email)){
alert("Invalid Email Format")
document.getElementById("email").style.border="2px solid red"
valid=false
}

/* USERNAME SPACE CHECK */
if(data.username.includes(" ")){
alert("Username should not contain spaces")
document.getElementById("username").style.border="2px solid red"
return false
}

/* PASSWORD STRENGTH CHECK */
if(data.password.length < 8){
alert("Password must be at least 8 characters")
document.getElementById("password").style.border="2px solid red"
return false
}

return valid
}