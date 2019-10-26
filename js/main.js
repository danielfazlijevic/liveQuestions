// wrapujemo nas kod sa IIFE da bi zastitili nas kod i varijable
// pogledati: https://medium.com/javascript-in-plain-english/https-medium-com-javascript-in-plain-english-stop-feeling-iffy-about-using-an-iife-7b0292aba174 
// pogledati: https://flaviocopes.com/javascript-iife/
;(function() {
// referenca na bazu firebase
const database = firebase.database();

const questionForm = document.querySelector('.question-form');
const sendBtn = document.querySelector('#posalji');
const questionList = document.querySelector('.pitanja ul');
const submitCodeBtn = document.querySelector('#start');
/* KONSTANTE */
// vreme izmedju slanja poruka u milisekundama
const MESSAGE_TIMEOUT = 6000; // 6 sekundi
// min duzina poruke
const MIN_LENGTH = 5;

let radionica;
let randomName;

// varijabla koja kontrolise da li korisnik moze da salje poruke
let canSendMessage = false;


// EVENT listener za submit dugme (sifra radionice)
submitCodeBtn.addEventListener('click', submitCode);


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


function addQuestion(data) {
    // koristimo funkciju filterXSS iz eksterne biblioteke da bi se zastitili od XSS napada
    // pogledati: https://www.acunetix.com/websitesecurity/cross-site-scripting/
    const question = filterXSS(data.question);
    const date = new Date(data.date).toLocaleTimeString('sr');
    const author = filterXSS(data.author);


    const newQuestionElement = `<li><span class="author">${escapeHTML(author)}</span>: ${escapeHTML(question)}, ${date}</li>`;
    questionList.innerHTML += newQuestionElement;
}

function sendQuestion(e) {
    // console.log(e);
    e.preventDefault();
    const question = filterXSS(document.querySelector('#pitanje').value);
    console.log('Pitanje: ', question);
    if (!canSendMessage) {
        console.log('ne možes još');
        return alert("Sačekaj malo!");
    }
    if (question.length < MIN_LENGTH)
        return alert("Poruka mora sadržati barem 5 slova");

    canSendMessage = false;
    sendBtn.disabled = true;

    database.ref(radionica + '/questions').push({
        author: escapeHTML(randomName),
        question: question,
        date: firebase.database.ServerValue.TIMESTAMP
    }, function (error) {
        if (error) {
            alert("Došlo je do greške!");
        } else {
            alert("Poruka je poslata");
            document.querySelector('#pitanje').value = "";

        }
    });

    // posle MESSAGE_TIMEOUT omogucavamo korisniku da salje opet poruke
    setTimeout(() => {
        console.log('sad moze');
        canSendMessage = true;
        sendBtn.disabled = false;

    }, MESSAGE_TIMEOUT);
}

// dobijamo random ime koristeci API
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


// funkcija koja koristi regex
// menjamo znakove u HTML kodove
// sajt na kojem mozemo videti te kodove: https://www.rapidtables.com/web/html/html-codes.html
function escapeHTML(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

})();