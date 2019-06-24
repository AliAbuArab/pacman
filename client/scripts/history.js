const email = localStorage.getItem('email');
fetch(`/scores?email=${email}`).then((response) => { 
  response.json().then(games => {
    var table = document.getElementsByTagName('tbody')[0];
    let i = 0;
    for (let game of games) {
      var row = table.insertRow(i);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      cell1.innerHTML = game.enemy;
      cell2.innerHTML = game.scores;
      cell3.innerHTML = game.date;
      i++;
    }
  });
});