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
  password : '',
  database : "pogoda"
});

function getData() {
        con.query("ALTER DATABASE pogoda CHARACTER SET UTF8", function(err, result, fields) {
            if(err) throw err
            sql2 = "INSERT INTO dane VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            fetch('https://danepubliczne.imgw.pl/api/data/synop')
            .then(response => response.json())
            .then(jsonData => { for (let i = 0; i < jsonData.length; i++) {
                con.query(sql2,[jsonData[i].id_stacji, jsonData[i].stacja, jsonData[i].data_pomiaru, jsonData[i].godzina_pomiaru, jsonData[i].temperatura, jsonData[i].predkosc_wiatru, jsonData[i].kierunek_wiatru, jsonData[i].wilgotnosc_wzgledna, jsonData[i].suma_opadu, jsonData[i].cisnienie], function(err, result, field) {
                    if(err) throw err
                    console.log("zapisano rzad: " + i)
        })}})
    })
}
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
})
app.get('/latLon', (req, res) => {
     fs.readFile("./filterLonLatCities.json", "utf8", (err, data) => {
        if(err) throw err
        console.log(JSON.parse(data))
        res.send(JSON.parse(data)[0].miejscowosc)
        //res.json(JSON.parse(data))
     })
})
app.get('/latLon/:lat/:lon', (req, res) => {
     let latA = req.params["lat"]
     let lonA = req.params["lon"]
    var aplikacja = { lat : latA, lon : lonA}
    let sql = "SELECT * FROM lokalizacje"
    let min = 0;
    let nazwa = ""
    con.query(sql, function(err, result) {
            result.forEach((element) => {
                var next = { lat : element.lat, lon : element.lon }
                console.log(next)
                if(min == 0) {
                    min = haversine(aplikacja, next) / 1000
                    nazwa = element.miejscowosc
                }
                let distance = haversine(aplikacja, next) / 1000 // wynik w kilometrach
                //distance = distance.toFixed()
                console.log(distance)
                console.log(nazwa)
                if(min > distance) {
                    min = distance
                    nazwa = element.miejscowosc
                }
            })
        console.log("\n" + min + " " + nazwa)
        res.send(nazwa.toString())
    })
})

// curl -H "Content-Type: application/json" -d "{\"lat\":\"wartosc\", \"lon\":\"wartosc\"}" http://localhost:3000/latLon
app.post('/latLon', (req, res) => { 
   let latA = req.body["lat"]
   let lonA = req.body["lon"]
   var aplikacja = { lat : latA, lon : lonA}
   let sql = "SELECT * FROM lokalizacje"
   let min = 0;
   let nazwa = ""
   let lat = 0
   let lon = 0
   con.query(sql, function(err, result) {
           result.forEach((element) => {
               var next = { lat : element.lat, lon : element.lon }
               console.log(next)
               if(min == 0) {
                   min = haversine(aplikacja, next) / 1000
                   nazwa = element.miejscowosc
               }
               let distance = haversine(aplikacja, next) / 1000 // wynik w kilometrach
               //distance = distance.toFixed()
               console.log(distance)
               console.log(nazwa)
               if(min > distance) {
                   min = distance
                   nazwa = element.miejscowosc
                   lat = element.lat
                   lon = element.lon
               }
           })
       console.log("\n" + min + " " + nazwa + " " + lat + " " + lon)
       res.send({"lat" : lat, "lon" : lon})
   })
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
}) // https://www.geeksforgeeks.org/how-http-post-request-work-in-node-js/