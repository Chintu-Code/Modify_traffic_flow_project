const tableBody = document.getElementById("tableBody");
const servedBody = document.getElementById("servedBody");
const log = document.getElementById("log");
const congestion = document.getElementById("congestion");
const messageBox = document.getElementById("message");
const vidInput = document.getElementById("vid");
const vtypeInput = document.getElementById("vtype");
const vpriority = document.getElementById("vpriority");
const vehicleImg = document.getElementById("vehicleImg");

const imageMap = {
  "Car": "images/car.png",
  "Bus": "images/bus.png",
  "Bike": "images/bike.png",
  "Schooter": "images/schooter.png",
  "Schooty": "images/schooty.png",
  "Ambulance": "images/ambulance.png",
  "Fire_Brigade": "images/fire-brigade.png",
  "VIP_Car": "images/vip-car.png"
};

const vehicleTypes = ["Car", "Bus", "Bike", "Schooter", "Schooty", "Ambulance", "Fire_Brigade", "VIP_Car"];
const priorityMap = {
  "Car": 0,
  "Bus": 0,
  "Bike": 0,
  "Schooter": 0,
  "Schooty": 0,
  "VIP_Car": 1,
  "Ambulance": 2,
  "Fire_Brigade": 2
};

vidInput.addEventListener("input", () => {
  const id = vidInput.value;
  if(id) {
    // Random index generate
    const randomIndex = Math.floor(Math.random() * vehicleTypes.length);
    const type = vehicleTypes[randomIndex];

    // Set type and priority
    vtypeInput.value = type;
    vpriority.value = priorityMap[type];
    vehicleImg.src = imageMap[type];
  } else {
    vtypeInput.value = "";
    vpriority.value = 0;
    vehicleImg.src = "images/car.png";
  }
});

// Digital Clock
function updateClock() {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2,'0');
  const mm = now.getMinutes().toString().padStart(2,'0');
  const ss = now.getSeconds().toString().padStart(2,'0');
  document.getElementById("digitalClock").innerText = `Current Time: ${hh}:${mm}:${ss}`;
}
setInterval(updateClock,1000);
updateClock();

// Convert seconds to HH:MM:SS
function secondsToHHMMSS(sec){
  const hh=Math.floor(sec/3600).toString().padStart(2,'0');
  const mm=Math.floor((sec%3600)/60).toString().padStart(2,'0');
  const ss=(sec%60).toString().padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
}

// Convert seconds to MM:SS
function secondsToMMSS(sec){
  const mm=Math.floor(sec/60).toString().padStart(2,'0');
  const ss=(sec%60).toString().padStart(2,'0');
  return `${mm}:${ss}`;
}

function addVehicle(){
  if(!vid.value || !vtype.value){ alert("Fill all fields"); return; }
  const now=new Date();
  const arrivalSeconds = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();

  fetch("/add",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      id:vid.value,
      type:vtype.value,
      arrival:arrivalSeconds,
      priority:Number(vpriority.value)
    })
  })
  .then(res=>res.text())
  .then(msg=>{
    log.innerText=msg;
    if(msg.includes("ERROR")){
    messageBox.innerText = "ID already exists!";
    messageBox.className = "msg delete";
    return;
  }
    messageBox.innerText="Vehicle inserted successfully";
    messageBox.className="msg success";
    loadQueue();
  });
}

function removeVehicle(){
  fetch("/remove",{method:"POST"})
    .then(res=>res.text())
    .then(msg=>{
      log.innerText=msg;
      messageBox.innerText="🚗 Vehicle removed from queue";
      messageBox.className="msg delete";

      msg.split("\n").forEach(line=>{
        if(line.startsWith("SERVED")){
          const parts=line.split(" ");
          const id=parts[1], type=parts[2], wait=Number(parts[3]);
          const tr=document.createElement("tr");
          if(type === "VIP") tr.classList.add("vip");
          tr.innerHTML=`<td>${id}</td><td>${type}</td><td>${secondsToMMSS(wait)}</td>`;
          tr.classList.add("fade-in");
          servedBody.appendChild(tr);
        }
      });

      loadQueue();
    });
}

function resetQueue(){
  if(!confirm("🗑️ Are you sure you want to delete ALL data?")) return;

  fetch("/reset",{ method:"POST" })
    .then(res=>res.text())
    .then(msg=>{
      log.innerText=msg;
      messageBox.innerText="All queue data cleared!";
      messageBox.className="msg delete";

      // Clear UI tables
      tableBody.innerHTML="";
      servedBody.innerHTML="";
      congestion.innerText="Traffic: LOW";
      congestion.className="low";
    })
    .catch(err=>{
      messageBox.innerText="Reset failed!";
      messageBox.className="msg delete";
      console.error(err);
    });
}

function loadQueue(){
  fetch("/display")
    .then(res=>res.text())
    .then(data=>{
      tableBody.innerHTML="";
      const lines=data.split("\n");

      lines.forEach(line=>{
        if(/^\d/.test(line)){
          const parts=line.split(" ");
          const id=parts[0];
          const pri=parts[parts.length-1];
          const arrSec=Number(parts[parts.length-2]);
          const type=parts.slice(1,parts.length-2).join(" ");

          const tr=document.createElement("tr");
          tr.classList.add("fade-in");
          if(pri==2) tr.classList.add("emergency");
          else if(pri==1) tr.classList.add("vip");
          tr.innerHTML=`
            <td>${id}</td>
            <td>${type}</td>
            <td>${secondsToHHMMSS(arrSec)}</td>
            <td>${pri== 2 ? "Emergency" : pri==1 ? "VIP":"Normal"}</td>
          `;
          tableBody.appendChild(tr);
        }

        if(line.startsWith("COUNT")){
          const c=parseInt(line.split(" ")[1]);
          congestion.innerText=c<=3?"Traffic: LOW":c<=6?"Traffic: MEDIUM":"Traffic: HIGH";
          congestion.className=c<=3?"low":c<=6?"medium":"high";
        }
      });
    });
}
