const express = require('express')
const app = express()
const fs = require('fs')
const plik = require('./data.json')

function getData() {
    fetch('https://danepubliczne.imgw.pl/api/data/synop')
    .then(response => response.json())
    .then(jsonData => fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => err && console.error(err)))
}
setInterval(getData, 30000)
app.get('/dane', (req, res) => {
    res.send(plik)
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})