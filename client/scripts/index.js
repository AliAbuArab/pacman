import postData from './post.js';

const $email = document.getElementById('email');
const $name = document.getElementById('name');
const $password = document.getElementById('password');
const $btnSetting = document.querySelector('img[alt="setting"]');
const $btnLogin = document.getElementById('btnLogin');
const $btnSignup = document.getElementById('btnSignup');
const $btnSignin = document.getElementById('btnSignin');
const $btnCancel = document.getElementById('btnCancel');
const $btnSettings = document.getElementById('btnSettings');
const $buttons = document.getElementsByTagName('button');
const $btnOnePLayer = document.getElementById('btnOnePlayer');
const $btnTwoPLayers = document.getElementById('btnTwoPlayers');
const $btnHistory = document.getElementById('btnHistory');


function mode(numOfPlayers) {
  localStorage.setItem('number-of-players', numOfPlayers);
  localStorage.setItem('name', $name.value);
  localStorage.setItem('email', $email.value);
  location.href = '/game.html';
}


$btnOnePLayer.addEventListener('click', () => mode(1));


$btnTwoPLayers.addEventListener('click', () => mode(2));


$btnSettings.addEventListener('click',() => window.location.href = '/settings.html');


$btnLogin.addEventListener('click', () => {
  const email = $email.value;
  const pass = $password.value
  postData('/login', {email, pass}).then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      hideAll();
      show($btnOnePLayer);
      show($btnTwoPLayers);
      show($btnHistory);
      $name.value = data.name;
    }
  }).catch(error => alert(error));
});


$btnSignup.addEventListener('click', () => { 
  hide($btnLogin);
  hide($btnSignup);
  show($name);
  show($btnSignin);
  show($btnCancel);
});


$btnSignin.addEventListener('click', () => {
  const email = $email.value;
  const pass = $password.value;
  const name = $name.value;
  postData('/signup', { email, pass, name, scores: [] }).then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      hideAll();
      show($btnOnePLayer);
      show($btnTwoPLayers);
    }
  }).catch(error => alert(error));
});

$btnCancel.addEventListener('click', () => {
  for (let button of $buttons) hide(button);
  show($btnSetting);
  show($email);
  show($password);
  show($btnLogin);
  hide($btnCancel);
  hide($name);
});

$btnHistory.addEventListener('click', () => {
  localStorage.setItem('email', $email.value);
  location.href = '/history.html';
});

function show(el) {
  el.style.display = 'inline-block';
}

function hide(el) {
  el.style.display = 'none';
}

function hideAll() {
  hide($name);
  hide($email);
  hide($password);
  hide($btnSignup);
  hide($btnLogin);
  hide($btnSignin);
  hide($btnLogin);
  hide($btnCancel);
}