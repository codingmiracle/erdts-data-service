fetch('http://127.0.0.1:3001/signup', {
    method: 'POST',
    headers: {
        "Content-type": "application/json"
    },
    body: JSON.stringify({
        "firstName": "Marcos",
        "lastName": "Silva",
        "email": "marcos.henrique@toptal.com",
        "password": "s3cr3tp4sswo4rd"
    })
})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    console.log('Request succeeded with JSON response', data);
})
.catch(function(error) {
    console.log('Request failed', error);
});

// start session
fetch('http://127.0.0.1:3001/start-session', {
    method: 'POST',
    headers: {
        "Content-type": "application/json"
    },
    body: JSON.stringify({
        "token": "CwWXN"
    })
})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    console.log('start session: ', data);
})
.catch(function(error) {
    console.log('Request failed', error);
});

// clear data
fetch('http://127.0.0.1:3001/data', {
    method: 'DELETE',
    headers: {
        "Content-type": "application/json"
    }
})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    console.log('clear data: ', data);
})
.catch(function(error) {
    console.log('Request failed', error);
});
