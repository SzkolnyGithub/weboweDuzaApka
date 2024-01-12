const express = require('express')
const app = express()
const fs = require('fs')

function getData() {
    fetch('https://danepubliczne.imgw.pl/api/data/synop')
    .then(response => response.json())
    .then(jsonData => fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => err && console.error(err)))
}
getData()
setInterval(getData, 30000)
const plik = require('./data.json')
app.get('/dane', (req, res) => {
    res.send(plik)
})
app.get("/dane/id", (req, res) => {
    stacjaId = req.query.id
    fs.readFile("./data.json", "utf8", (error, data) => {
        if(error) {
            var json = new Array()
            json = JSON.parse(data)
            console.log(error)
            console.log(json[stacjaId])
            return;
        }
        var json = new Array()
        json = JSON.parse(data)

        res.send(json[stacjaId])
    })
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})