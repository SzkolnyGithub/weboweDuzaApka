const express = require('express')
const app = express()
const fs = require('fs')
app.use(express.json())
function getData() {
    fetch('https://danepubliczne.imgw.pl/api/data/synop')
    .then(response => response.json())
    .then(jsonData => fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => err && console.error(err)))
}
/*function getLocations() { // to chyba bez sensu
    fetch('https://astronomia.zagan.pl/art/wspolrzedne.html')
    .then(response => response.set('charset=utf-8'))
    .then(utfresponse => utfresponse.text())
    .then(stringData => console.log(stringData))
    //.then(stringData => fs.writeFile("lokacje.txt", stringData, (err) => err && console.error(err)))
}*/
//getLocations()
getData()
setInterval(getData, 30000)
app.get('/dane', (req, res) => {
    fs.readFile("./data.json", "utf8", (error, data) => {
        if(error) {
            console.log(error)
            return;
        }
        res.send(JSON.parse(data))
    })
})
app.get("/dane/id", (req, res) => {
    stacjaId = req.query.id
    fs.readFile("./data.json", "utf8", (error, data) => {
        if(error) {
            console.log(error)
            return;
        }
        var json = new Array()
        json = JSON.parse(data)

        res.send(json[stacjaId])
    })
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
}) // https://www.geeksforgeeks.org/how-http-post-request-work-in-node-js/