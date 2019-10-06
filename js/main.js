// DODATI: 
// Promena radionice
// Lista svih aktivnih radionica
// Brisanje komentara
// Profili
// mozda pozivanje apija za neki gif na startu?
// mozda random ime da se napravi i da se dodeli?

var database = firebase.database();


const sendBtn = document.querySelector('#posalji');
const questionList = document.querySelector('.pitanja ul');

let radionica;
let randomName;

function submitCode() {
    console.log('test');
    radionica = document.querySelector('#sifra').value;
    localStorage.setItem("radionica", radionica)
    document.querySelector('#radionica').textContent = radionica;
    document.querySelector('.unesi-radionicu').style.display = "none";


    startListening();


}

function startListening() {
    const questionsRef = firebase.database().ref(radionica + '/questions');
    questionsRef.on('child_added', function (data) {
        console.log(data);
        addQuestion(data.val());
    });

}

sendBtn.addEventListener("click", sendQuestion);


function addQuestion(data) {
    const question = data.question;
    const date = new Date(data.date).toLocaleTimeString('sr');
    const author = data.author;
    const newQuestionElement = `<li>${author}: ${question}, ${date}</li>`;
    questionList.innerHTML += newQuestionElement;
}

function sendQuestion() {
    const question = document.querySelector('#pitanje').value;
    console.log('Pitanje: ', question);

    firebase.database().ref(radionica + '/questions').push({
        author: randomName,
        question: question,
        date: firebase.database.ServerValue.TIMESTAMP
    }, function (error) {
        if (error) {
            alert("Doslo je do greske!")
        } else {
            alert("pitanje poslato baki");
            document.querySelector('#pitanje').value = "";
        }
    });
}


function generateRandomName() {
    const API_URL = "https://namey.muffinlabs.com/name.json";
    fetch(API_URL, {
        mode: 'cors',
        method: "GET",
        headers: {
           "Content-Type": "application/json"
        }
    }).then(res => res.json()).then(data => {
        randomName = data[0];
        document.querySelector('#ime').textContent = randomName;
    })
    // link za console error i to 
    .catch(err => {
        console.log('ERROR', err)
       randomName =  "Anon"
       document.querySelector('#ime').textContent = randomName;
    });
    

}

generateRandomName();