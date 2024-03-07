const express = require('express')
const app = express()
const fs = require('fs')
const mysql = require('mysql')
const haversine = require('haversine-distance')
const cities = require('./filterLonLatCities.json')
app.use(express.json())

var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : ''
});

function getData() {
    sql = "CREATE DATABASE IF NOT EXISTS pogoda"
    con.query(sql, function (err, result, fields) {
        if(err) throw err
        console.log("baza danych utworzona pomyslnie")
        con.query("ALTER DATABASE pogoda CHARACTER SET UTF8", function(err, result, fields) {
            con.changeUser({database : 'pogoda'}, function(err) {
                if (err) throw err;
                sql1 = "CREATE TABLE IF NOT EXISTS dane(id_stacji INT(10) NOT NULL PRIMARY KEY, stacja TEXT(50) NOT NULL, data_pomiaru DATE NOT NULL, godzina_pomiaru INT(5) NOT NULL, temperatura DOUBLE(10, 1) NOT NULL, predkosc_wiatru INT(5) NOT NULL, kierunek_wiatru INT(10) NOT NULL, wilgotnosc_wzgledna DOUBLE(10, 1) NOT NULL, suma_opadu DOUBLE(5, 1) NOT NULL, cisnienie DOUBLE(15, 1) NULL)"
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
                            })}})
                        let sql3 = "CREATE TABLE IF NOT EXISTS lokalizacje(miejscowosc TEXT(20) NOT NULL, lon DOUBLE(10, 3) NOT NULL, lat DOUBLE(10, 3) NOT NULL)"
                        con.query(sql3, function(err, result, fields) {
                            if(err) throw err
                            let sql4 = "INSERT INTO lokalizacje VALUES (?, ?, ?)"
                            con.query("DELETE FROM lokalizacje", function(err, result, fields) {
                                if(err) throw err
                                let iter = 0;
                                cities.forEach((element) => {
                                    con.query(sql4,[element.miejscowosc, element.lon, element.lat], function(err, result, fields) {
                                        if(err) throw err
                                        console.log("Dodano lokalizacje " + iter)
                                        iter++
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
    /*fetch('https://danepubliczne.imgw.pl/api/data/synop')
    .then(response => response.json())
    .then(jsonData => fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => err && console.error(err)))*/
}
getData()
setInterval(getData, 3600000)
app.get('/dane', (req, res) => {
    let sql = "SELECT * FROM dane"
    con.query(sql, function(err, result) {
        res.json(result)
    })
    /*fs.readFile("./data.json", "utf8", (error, data) => {
        if(error) {
            console.log(error)
            return;
        }
        res.send(JSON.parse(data))
    })*/
})
app.get("/dane/:id", (req, res) => {
    stacjaId = req.params['id']
    let sql = "SELECT * FROM dane WHERE id_stacji = ?"
    con.query(sql,[stacjaId], function(err, result) {
        if(err) throw err
        res.json(result)
    })
    /*fs.readFile("./data.json", "utf8", (error, data) => {
        if(error) {
            console.log(error)
            return;
        }
        var json = new Array()
        json = JSON.parse(data)

        res.send(json[stacjaId])
    })*/
})
app.get('/latLon', (req, res) => {
     fs.readFile("./filterLonLatCities.json", "utf8", (err, data) => {
        if(err) throw err
        console.log(data.json.parse)
        res.send(data[0].miejscowosc)
        res.json(JSON.parse(data))
     })
})
app.get('/latLon/:lat/:lon', (req, res) => {
     let latA = req.params["lat"]
     let lonA = req.params["lon"]
    var aplikacja = { lat : latA, lon : lonA}
    let sql = "SELECT * FROM dane"
    con.query(sql, function(err, result) {
        res.json(result)
    })
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
}) // https://www.geeksforgeeks.org/how-http-post-request-work-in-node-js/