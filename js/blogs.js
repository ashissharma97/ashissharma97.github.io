var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var requestOptions = {
    method: "get",
    headers: myHeaders,
    redirect: "follow",
};

(async function getMediumPosts(){
  const resp = await fetch("https://blogs-function.netlify.app/.netlify/functions/blogs-function", requestOptions)
  const json = await resp.json()
  const sortedJson = json.sort((a,b) => Date.parse(b.addedOn) - Date.parse(a.addedOn))
  for(let i=0; i<json.length; i++){
    document.getElementById('blogs-section').innerHTML += `<div class="card-container"> <a href="${sortedJson[i].link}"> <div class="card-image"><img src="${sortedJson[i].image}" alt="a brand new sports car" /> </div> <div class="card-body"><h1> ${sortedJson[i].title} </h1> </div> </a> </div>`
  }
})()

function goBack(){
  window.location.href = "/";
}

document.getElementById('back').onclick = goBack;

