/* ================= LOGIN SYSTEM ================= */

let activeUser = localStorage.getItem("activeUser");

function userKey(key){
if(!activeUser) return key;
return activeUser + "_" + key;
}

window.addEventListener("DOMContentLoaded", () => {
const modal = document.getElementById("nameModal");
if (!activeUser) modal.style.display = "flex";
else modal.style.display = "none";

loadUserData();
updateClock();
loadWeather();
});

/* ================= AUTH ================= */

function signup(){
const u=usernameInput.value.trim();
const p=passwordInput.value.trim();
const msg=loginMsg;

if(!u || !p) return msg.textContent="Enter username & password";

let users=JSON.parse(localStorage.getItem("users")||"{}");

if(users[u]) return msg.textContent="User already exists";

users[u]={password:p};
localStorage.setItem("users",JSON.stringify(users));
msg.style.color="green";
msg.textContent="Signup successful! Now login";
}

function login(){
const u=usernameInput.value.trim();
const p=passwordInput.value.trim();
const msg=loginMsg;

let users=JSON.parse(localStorage.getItem("users")||"{}");

if(!users[u] || users[u].password!==p){
msg.textContent="Invalid login";
return;
}

activeUser=u;
localStorage.setItem("activeUser",u);
nameModal.style.display="none";
loadUserData();
updateClock();
}

/* ================= CLOCK + AUTO THEME ================= */

function applyAutoTheme(hour){
document.body.classList.remove("dark");
if(hour>=22 || hour<5){
document.body.classList.add("dark");
}
}

function updateClock(){
const now=new Date();
const hour=now.getHours();

clock.textContent=now.toLocaleTimeString();

let greet="Hello";
if(hour<12) greet="Good Morning";
else if(hour<18) greet="Good Afternoon";
else if(hour<22) greet="Good Evening";
else greet="Good Night";

document.getElementById("greet").textContent=`${greet}, ${activeUser||"User"}`;

applyAutoTheme(hour);
}
setInterval(updateClock,1000);

function toggleTheme(){
document.body.classList.toggle("dark");
}

/* ================= QUOTES ================= */

const quotes=[
"Discipline beats motivation",
"Consistency creates confidence",
"Do it even when you don’t feel like it",
"Small progress is still progress",
"Comfort is the enemy of growth",
"Your future is created today",
"Focus on effort not outcome"
];

function newQuote(){
quote.textContent=quotes[Math.floor(Math.random()*quotes.length)];
}
newQuote();

/* ================= TODO ================= */

let tasks=[];

function loadUserData(){
tasks=JSON.parse(localStorage.getItem(userKey("tasks"))||"[]");
todayFocus=Number(localStorage.getItem(userKey("focus"))||0);
renderTasks();
renderHistory();
}

function renderTasks(){
list.innerHTML="";
let done=0;

tasks.forEach((t,i)=>{
if(t.done) done++;
list.innerHTML+=`<li>       <span onclick="toggleTask(${i})" class="${t.done?'done':''}">${t.text}</span>       <button onclick="deleteTask(${i})">x</button>     </li>`;
});

localStorage.setItem(userKey("tasks"),JSON.stringify(tasks));
updateProgress(done,tasks.length);
saveDailyStats(done);
}

function addTask(){
if(!task.value.trim()) return;
tasks.push({text:task.value,done:false});
task.value="";
renderTasks();
}

function toggleTask(i){
tasks[i].done=!tasks[i].done;
renderTasks();
}

function deleteTask(i){
tasks.splice(i,1);
renderTasks();
}

/* ================= PROGRESS ================= */

function updateProgress(done,total){
const percent=total?Math.round((done/total)*100):0;
progressFill.style.width=percent+"%";
progressText.textContent=percent+"% completed";
}

/* ================= TIMER ================= */

let time=1500;
let interval=null;
let todayFocus=0;

function format(){
timer.textContent=`${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`;
}
format();

function startTimer(){
if(interval) return;
interval=setInterval(()=>{
if(time>0){
time--;
format();
}else{
stopTimer();
todayFocus+=25;
localStorage.setItem(userKey("focus"),todayFocus);
alert("Session completed! Take a break ☕");
saveDailyStats();
}
},1000);
}

function stopTimer(){
clearInterval(interval);
interval=null;
}

function resetTimer(){
stopTimer();
time=1500;
format();
}

/* ================= HISTORY ================= */

function todayKey(){
return new Date().toISOString().slice(0,10);
}

function saveDailyStats(done=0){
let history=JSON.parse(localStorage.getItem(userKey("history"))||"{}");
history[todayKey()]={focus:todayFocus,tasks:done};
localStorage.setItem(userKey("history"),JSON.stringify(history));
renderHistory();
}

function renderHistory(){
const history=JSON.parse(localStorage.getItem(userKey("history"))||"{}");
historyList.innerHTML="";
Object.entries(history).slice(-7).reverse().forEach(([d,v])=>{
historyList.innerHTML+=`<div><b>${d}</b> — Focus: ${v.focus} min | Tasks: ${v.tasks}</div>`;
});
}

/* ================= WEATHER ================= */

function loadWeather(){
const el=weather;
let done=false;

setTimeout(()=>{ if(!done) el.textContent="Weather unavailable"; },6000);

if(!navigator.geolocation){
el.textContent="No location support";
return;
}

navigator.geolocation.getCurrentPosition(async pos=>{
try{
const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`);
const d=await r.json();
done=true;
el.innerHTML=`${d.current_weather.temperature}°C <small>Wind ${d.current_weather.windspeed} km/h</small>`;
}catch{
el.textContent="Weather failed";
}
},()=>el.textContent="Location denied",{timeout:5000});
}
