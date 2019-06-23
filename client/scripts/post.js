function postData(url = '', data = {}) {
  // Default options are marked with *
  return fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  .then(response => response.json()); // parses JSON response into native Javascript objects 
}