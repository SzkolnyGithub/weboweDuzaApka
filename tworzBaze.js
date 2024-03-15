const cities = require('./filterLonLatCities.json')
const meteo = require('./meteo.json')
const mysql = require('mysql')
const fs = require('fs')
var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : ''
  });
i = 1
function getData() {
    sql = "CREATE DATABASE IF NOT EXISTS pogoda"
    con.query(sql, function (err, result, fields) {
        if(err) throw err
        console.log("baza danych utworzona pomyslnie")
        con.query("ALTER DATABASE pogoda CHARACTER SET UTF8", function(err, result, fields) {
            con.changeUser({database : 'pogoda'}, function(err) {
                if (err) throw err;
                sql1 = "CREATE TABLE IF NOT EXISTS dane(id_stacji INT(10)  NULL , stacja TEXT(50)  NULL, data_pomiaru DATE  NULL, godzina_pomiaru INT(5)  NULL, temperatura DOUBLE(10, 1)  NULL, predkosc_wiatru INT(5)  NULL, kierunek_wiatru INT(10)  NULL, wilgotnosc_wzgledna DOUBLE(10, 1)  NULL, suma_opadu DOUBLE(5, 1)  NULL, cisnienie DOUBLE(15, 1)  NULL)"
                con.query(sql1, function (err, result, fields) {
                    if(err) throw err
                    console.log("tabela utworzona pomyslnie")
                    sql2 = "INSERT INTO dane VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    meteo.forEach((element) => {
                        element.forEach((element1) => {
                            con.query(sql2,[element1.id_stacji, element1.stacja, element1.data_pomiaru, element1.godzina_pomiaru, element1.temperatura, element1.predkosc_wiatru, element1.kierunek_wiatru, element1.wilgotnosc_wzgledna, element1.suma_opadu, element1.cisnienie], function(err, result, field) {
                                if(err) throw err
                                console.log("zapisano rzad: " + i)
                                i++
                        }) // nie dziala trzeba naprawic
                    })
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
    })})
}
getData()
