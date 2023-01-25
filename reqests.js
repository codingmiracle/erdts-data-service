fetch('http://10.117.247.49:3000/signup', {
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

fetch('http://10.117.247.49:3000/start-session', {
    method: 'POST',
    headers: {
        "Content-type": "application/json"
    },
    body: JSON.stringify({
        "token": "aaaaa"
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