document.getElementById("bs__root").innerHTML += ``;
// Your CSS as text

var fontAdd = document.createElement("link");
fontAdd.rel = "stylesheet";
fontAdd.href =
  "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap";

var cssstyles = ``;
var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = cssstyles;
document.head.appendChild(styleSheet);