new fullpage('#fullpage',{
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
                document.title = "Get in touch | Ashis Sharma"
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
        document.getElementById('button-img').style.animation = "plane-return 10s 1"; 
        setTimeout(() => {
            alert("Please Enter all the details.")
        }, 11000);
    }
    else {
        document.getElementById('button-img').style.animation = "plane 10s 1"; 
        await emailjs.send('service_qrxfy7n','template_clgh61t', {name: name,message: message } ,'user_etepfJ0QfVa5RVKcZWOCb');
        document.getElementById('name').value = "";
        document.getElementById('message').value = "";
    }
})

new Typed('#typed',{
    strings : ['Engineer','Investor','Freelancer'],
    typeSpeed : 80,
    delaySpeed : 90,
    loop : true
});

let mediaFunc = window.matchMedia('(max-width: 600px)');

if (mediaFunc.matches) {
    document.getElementById('skills-col2').style.display = 'none';
    const colSkills = ['GCP','Azure','Docker','Kubernetes','PWA','TensorFlow JS','Mongo DB'];
    for(let i=0;i<colSkills.length;i++){
        let li = document.createElement('li');
        li.innerHTML = colSkills[i];
        document.getElementById('skills-ul').appendChild(li);
    }
}
