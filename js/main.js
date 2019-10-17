// DODATI: 
// Promena radionice
// Lista svih aktivnih radionica
// Brisanje komentara
// Profili
// mozda pozivanje apija za neki gif na startu?
// mozda random ime da se napravi i da se dodeli?

const database = firebase.database();

const questionForm = document.querySelector('.question-form');
const sendBtn = document.querySelector('#posalji');
const questionList = document.querySelector('.pitanja ul');

/* KONSTANTE */
// vreme izmedju slanja poruka u milisekundama
const MESSAGE_TIMEOUT = 6000; // 6 sekundi
const MIN_LENGTH = 5;

let radionica;
let randomName;

let canSendMessage = false;

function submitCode() {
    radionica = document.querySelector('#sifra').value;
    localStorage.setItem("radionica", radionica);
    document.querySelector('#radionica').textContent = radionica;
    document.querySelector('.unesi-radionicu').style.display = "none";

    startListening();

}

function startListening() {

    questionForm.addEventListener('submit', sendQuestion);

    const questionsRef = database.ref(radionica + '/questions');
    questionsRef.on('child_added', function (data) {
        addQuestion(data.val());
    });

    canSendMessage = true;

}

// database.ref('.info/connected').get()
// .then((doc)=>console.log('DOC', doc));


function addQuestion(data) {
    const question = filterXSS(data.question);
    const date = new Date(data.date).toLocaleTimeString('sr');
    const author = filterXSS(data.author);
    
    const newQuestionElement = `<li><span class="author">${escapeHTML(author)}</span>: ${escapeHTML(question)}, ${date}</li>`;
    questionList.innerHTML += newQuestionElement;
}

function sendQuestion(e) {
    console.log(e);
    e.preventDefault();
    const question = filterXSS(document.querySelector('#pitanje').value);
    console.log('Pitanje: ', question);
    if (!canSendMessage) {
        console.log('ne mozes jos');
        return alert("Sacekaj malo!");
    }
    if (question.length < MIN_LENGTH)
        return alert("Poruka mora sadrzati barem 5 slova");

    canSendMessage = false;
    sendBtn.disabled = true;

    database.ref(radionica + '/questions').push({
        author: escapeHTML(randomName),
        question: question,
        date: firebase.database.ServerValue.TIMESTAMP
    }, function (error) {
        if (error) {
            alert("Doslo je do greske!");
        } else {
            alert("pitanje poslato baki");
            document.querySelector('#pitanje').value = "";

        }
    });

    setTimeout(() => {
        console.log('sad moze');
        canSendMessage = true;
        sendBtn.disabled = false;

    }, MESSAGE_TIMEOUT);
}


function generateRandomName() {
    const API_URL = "https://namey.muffinlabs.com/name.json";
    fetch(API_URL, {
            mode: 'cors',
            method: "GET",
        }).then(res => res.json()).then(data => {
            randomName = data[0];
            document.querySelector('#ime').textContent = randomName;
        })
        // link za console error i to 
        .catch(err => {
            console.log('ERROR', err);
            randomName = "Anon";
            document.querySelector('#ime').textContent = randomName;
        });


}

generateRandomName();



function escapeHTML(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

