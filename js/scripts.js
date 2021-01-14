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
    document.getElementById('button-img').style.animation = "plane 10s 1"; 
    let name = document.getElementById('name').value;
    let message = document.getElementById('message').value;
    await emailjs.send('service_qrxfy7n','template_clgh61t', {name: name,message: message } ,'user_etepfJ0QfVa5RVKcZWOCb');
    document.getElementById('name').value = "";
    document.getElementById('message').value = "";
})