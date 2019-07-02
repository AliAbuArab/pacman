let questions;
const txtQuestion = document.getElementById('txtQuestion');
const txtQuestionOption1 = document.getElementById('txtOption-1');
const txtQuestionOption2 = document.getElementById('txtOption-2');
const txtQuestionOption3 = document.getElementById('txtOption-3');
const txtQuestionOption4 = document.getElementById('txtOption-4');
const txtQuestionAnswer = document.getElementById('numOfCorrectAns');
const txtQuestionPoint = document.getElementById('point');
const txtNumOfQuestion = document.getElementById('numOfQuestion');
const removeDiv = document.getElementById('divRemove');
const $btnCancel = document.getElementById('btnCancel');

fetch('/questions').then((response) => { 
  response.json().then(q => {
    questions = q;
    updateTable();
  });
}); 

function updateTable() {
  var table = document.getElementsByTagName('tbody')[0];
  while(table.hasChildNodes()) table.removeChild(table.firstChild);
  let i = 0;
  for (let question of questions) {
    var row = table.insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = i;
    cell2.innerHTML = question.question;
    i++;
  }
  postData('/questions', questions).then(data => console.log(data)).catch(error => alert(error));
}

function addOrEdit(option) {
  if (option == 1) {
    document.getElementById('numOfQuestion').style.display = 'none';
    document.getElementById('btnQuestion').innerText = 'Add';
  }
  else {
    document.getElementById('numOfQuestion').style.display = 'inline';
    document.getElementById('btnQuestion').innerText = 'Update';
  }
  showDivAdd();
  hideMain();
}

function remove() {
  removeDiv.style.display = 'block';
  hideMain();
}

function addOrUpdateQuestion() {
  hideDivAdd();
  showMain();
  const question = txtQuestion.value;
  const option1 = txtQuestionOption1.value;
  const option2 = txtQuestionOption2.value;
  const option3 = txtQuestionOption3.value;
  const option4 = txtQuestionOption4.value;
  const answer = txtQuestionAnswer.value;
  const point = parseInt(txtQuestionPoint.value);
  resetQuestionForm();
  const newQuestion = {
    question,
    options: [option1, option2, option3, option4],
    answer,
    point
  };
  questions.push(newQuestion);
  if (document.getElementById('btnQuestion').innerText == 'Update')
    questions.splice(txtNumOfQuestion.innerText, 1);
  updateTable();
}

function cancelQuestion() {
  hideDivAdd();
  showMain();
  resetQuestionForm();
}

function showDivAdd() {
  document.getElementById('divAdd').style.display = 'block';
}

function hideDivAdd() {
  document.getElementById('divAdd').style.display = 'none';
}

function showMain() {
  document.getElementsByTagName('main')[0].style.display = 'block';
}

function hideMain() {
  document.getElementsByTagName('main')[0].style.display = 'none';
}

function resetQuestionForm() {
  txtQuestion.value = '';
  txtQuestionOption1.value = '';
  txtQuestionOption2.value = '';
  txtQuestionOption3.value = '';
  txtQuestionOption4.value = '';
  txtQuestionAnswer.value = '';
  txtQuestionPoint.value = '';
}

function fillField() {
  const questionNumber = txtNumOfQuestion.value;
  if (questionNumber < 0 || questionNumber > questions.length-1) {
    alert('Invalid question number');
    return;
  }
  const question = questions[questionNumber];
  txtQuestion.value = question.question;
  txtQuestionOption1.value = question.options[0];
  txtQuestionOption2.value = question.options[1];
  txtQuestionOption3.value = question.options[2];
  txtQuestionOption4.value = question.options[3];
  txtQuestionAnswer.value = question.answer;
  txtQuestionPoint.value = question.point;
}

function removeQuestion() {
  const numOfQuestion = document.getElementById('numOfDeleteQuestion').value;
  if (numOfQuestion < 0 || numOfQuestion > questions.length-1) {
    alert('Invalid question number');
    return;
  }
  questions.splice(numOfQuestion, 1);
  cancelRemoveQuestion();
  updateTable();
}

function cancelRemoveQuestion() {
  removeDiv.style.display = 'none';
  showMain();
}

function returnToIndex() {
  window.location.href = `http://localhost:${port}`;
}

$btnCancel.addEventListener('click', () => {
  window.location.href = '/index.html';
});