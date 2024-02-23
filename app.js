const express = require('express')
const app = express()
const fs = require('fs')
var mysql = require('mysql')
app.use(express.json())

var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : ''
});



sql = "CREATE DATABASE IF NOT EXISTS pogoda"
con.query(sql, function (err, result, fields) {
    if(err) throw err
    console.log("baza danych utworzona pomyslnie")
    con.query("ALTER DATABASE pogoda CHARACTER SET UTF8", function(err, result, fields) {
        con.changeUser({database : 'pogoda'}, function(err) {
            if (err) throw err;
            sql1 = "CREATE TABLE IF NOT EXISTS dane(id_stacji VARCHAR(10) NOT NULL PRIMARY KEY, stacja VARCHAR(50) NOT NULL, data_pomiaru VARCHAR(10) NOT NULL, godzina_pomiaru VARCHAR(5) NOT NULL, temperatura VARCHAR(10) NOT NULL, predkosc_wiatru VARCHAR(5) NOT NULL, kierunek_wiatru VARCHAR(10) NOT NULL, wilgotnosc_wzgledna VARCHAR(10) NOT NULL, suma_opadu VARCHAR(5) NOT NULL, cisnienie VARCHAR(15) NULL)"
            con.query(sql1, function (err, result, fields) {
                if(err) throw err
                console.log("tabela utworzona pomyslnie")
                sql2 = "INSERT INTO dane VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                con.query("DELETE FROM dane", function(err, result, fields) {
                    if(err) throw err
                    fetch('https://danepubliczne.imgw.pl/api/data/synop')
                    .then(response => response.json())
                    .then(jsonData => {for(let i = 0; i < jsonData.length; i++) {
                        con.query(sql2,[jsonData[i].id_stacji, jsonData[i].stacja, jsonData[i].data_pomiaru, jsonData[i].godzina_pomiaru, jsonData[i].temperatura, jsonData[i].predkosc_wiatru, jsonData[i].kierunek_wiatru, jsonData[i].wilgotnosc_wzgledna, jsonData[i].suma_opadu, jsonData[i].cisnienie], function(err, result, field) {
                            if(err) throw err
                            console.log("zapisano rzad: " + i)
                        })
                    }})
                })
            })
        })
    })
})

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
setInterval(getData, 3600000)
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
app.get('/', (req, res) => {
     
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
}) // https://www.geeksforgeeks.org/how-http-post-request-work-in-node-js/