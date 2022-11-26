new fullpage('#fullpage',{
    anchors: ['landing', 'about', 'skills', 'experience', 'blogs', 'enquiry'],
    verticalCentered: false,
    onLeave: function(index,nextIndex,direction){
        switch(nextIndex.index){
            case 0:
                document.title = "Ashis Sharma"
                break;
            case 1:
                document.title = "About | Ashis Sharma"
                break;
            case 2:
                document.title = "Skills | Ashis Sharma"
                break;
            case 3:
                document.title = "Experiences | Ashis Sharma"
                break;
            case 4:
                document.title = "Blogs | Ashis Sharma"
                break;
            case 5:
                document.title = "Enquiry | Ashis Sharma"
                break;
            default:
                document.title = "Ashis Sharma"
                break;
        }
    }
});

document.getElementById('submit').addEventListener('click', async function(e) {
    e.preventDefault();
    let name = document.getElementById('name').value;
    let message = document.getElementById('message').value;
    if(name === '' || message === '') {
        alert("Please Enter all the details.")
    }
    else {
        document.getElementById('button-img').style.animation = "plane 10s 1";
        await emailjs.send('service_16ayyef','template_48nqu1e', {name: name,message: message } ,'TVJL_f4Vr5Uwg2l-R');
        document.getElementById('name').value = "";
        document.getElementById('message').value = "";
    }
})

new Typed('#typed',{
    strings : ['Engineer'],
    typeSpeed : 80,
    delaySpeed : 90,
    loop : true
});

let mediaFunc = window.matchMedia('(max-width: 600px)');

if (mediaFunc.matches) {
    document.getElementsByTagName('header')[0].style.display = 'none'
}

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
    const len = window.matchMedia('(max-width: 600px)').matches ? 2 : 3;
    for(let i=0; i<len; i++){
      document.getElementById('index-blogs-section').innerHTML += `<div class="card-container"> <a href="${json[i].link}"> <div class="card-image"><img src="${json[i].image}" alt="a brand new sports car" /> </div> <div class="card-body"><h1> ${json[i].title} </h1> </div> </a> </div>`
    }
})()

function goToBlogs() {
    window.location.href = "/blogs.html";
}

document.getElementById('all-blogs').onclick = goToBlogs;