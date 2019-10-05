
// DODATI: 
// Promena radionice
// Lista svih aktivnih radionica
// Brisanje komentara
// Profili

var database = firebase.database();


const sendBtn = document.querySelector('#posalji');
const questionList = document.querySelector('.pitanja ul');

let radionica;

function submitCode(){
    console.log('test');
    radionica = document.querySelector('#sifra').value;
    localStorage.setItem("radionica", radionica)
    document.querySelector('#radionica').textContent = radionica;
    document.querySelector('.unesi-radionicu').style.display = "none";


    startListening();
   
  
}

function startListening(){
    const questionsRef = firebase.database().ref(radionica + '/questions');
    questionsRef.on('child_added', function(data) {
        console.log(data);
        addQuestion(data);
  });

}

sendBtn.addEventListener("click", sendQuestion);


function addQuestion(data){
    const question = data.val().question;
    const date = new Date(data.val().date).toLocaleTimeString('sr');;
    const newQuestionElement = `<li>${question}, ${date}</li>`;
    questionList.innerHTML += newQuestionElement;
}
function sendQuestion() {
    const question = document.querySelector('#pitanje').value;
    console.log('Pitanje: ', question);

    firebase.database().ref(radionica + '/questions').push({    
        question: question,
        date: firebase.database.ServerValue.TIMESTAMP
    }, function (error) {
        if (error) {
            alert("Doslo je do greske!")
        } else {
            alert("pitanje poslato baki");
        }
    });
}