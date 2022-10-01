//die Module einbinden
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

//den Datenbanknamen beschaffen
const datenbankName = __dirname + "/daten/cd.db";
//und die Verbindung herstellen
const datenbank = new sqlite3.Database(datenbankName, function (error) {
  //hat es ein Problem gegeben?
  if (error) {
    return console.error(error.message);
  }
  //sonst melden wir Vollzug
  console.log("Verbindung zu " + datenbankName + " hergestellt.");
});

//den Server konfigurieren
//die View-Engine ist EJS
app.set("view engine", "ejs");
//die Templates liegen im Ordner view
app.set("views", __dirname + "/view");
//für den Zugriff auf das Stylesheet
app.use(express.static(__dirname + "/public"));
//für den Zugriff auf die Formulardaten
app.use(express.urlencoded({ extended: false }));

// die Route für / und GET
app.get("/", function (request, response) {
  //die SQL-Abfrage
  //sie beschafft alle Einträge aus der Tabelle cd
  let sqlStatement = "SELECT * FROM cd";
  //die Methode all() für das Datenbankobjekt ausführen
  datenbank.all(sqlStatement, [], function (error, rows) {
    if (error) {
      return console.error(error.message);
    }
    //die Seite rendern
    //übergeben werden die Daten aus der Datenbanktabelle
    response.render("liste", { daten: rows });
  });
});

// die Route für /neu und GET
app.get("/neu", function (request, response) {
  //die Seite rendern
  response.render("neu");
});

// die Route für /neu und POST
app.post("/neu", function (request, response) {
  //das SQL-Statement zum Einfügen
  //es verwendet zunächst Platzhalter für die Werte
  let sqlStatement = "INSERT INTO cd (interpret, titel) VALUES (?, ?)";
  //die Daten aus dem Formular beschaffen und speichern
  let cd = [request.body.interpret, request.body.titel];
  //und das Statement mit der Methode run() ausführen
  datenbank.run(sqlStatement, cd, function (error) {
    if (error) {
      return console.error(error.message);
    }
    //ein Redirect ausführen
    response.redirect("/");
  });
});

// die Route für /bearbeiten und GET
app.get("/bearbeiten/:id", function (request, response) {
  //die ID beschaffen
  let id = request.params.id;
  //die SQL-Abfrage
  //sie beschafft den passenden Eintrag aus der Tabelle cd
  let sqlStatement = "SELECT * FROM cd WHERE id = ?";
  //die Methode get() für das Datenbankobjekt ausführen
  datenbank.get(sqlStatement, id, function (error, row) {
    if (error) {
      return console.error(error.message);
    }
    //die Seite rendern
    //übergeben wird die Zeile aus der Datenbanktabelle
    response.render("bearbeiten", { daten: row });
  });
});

//die Route für /löschen und GET
app.get("/loeschen/:id", function (request, response) {
  //die ID beschaffen
  let id = request.params.id;
  //das SQL-Statement zum Löschen
  let sqlStatement = "DELETE FROM cd WHERE id = ?";
  //und das Statement mit der Methode run() ausführen
  datenbank.run(sqlStatement, id, function (error) {
    if (error) {
      return console.error(error.message);
    }
    //ein Redirect ausführen
    response.redirect("/");
  });
});

// die Route für /bearbeiten und POST
app.post("/bearbeiten/:id", function (request, response) {
  //die ID beschaffen
  let id = request.params.id;
  //das SQL-Statement zum Aktualisieren
  //es verwendet zunächst Platzhalter für die Werte
  let sqlStatement = "UPDATE cd SET interpret = ?, titel = ? WHERE (id = ?)";
  let cd = [request.body.interpret, request.body.titel, id];
  //und das Statement mit der Methode run() ausführen
  datenbank.run(sqlStatement, cd, function (error) {
    if (error) {
      return console.error(error.message);
    }
    //ein Redirect ausführen
    response.redirect("/");
  });
});

const server = app.listen(8080, function () {
  console.log(
    "Der Server läuft auf " +
      server.address().address +
      ":" +
      server.address().port
  );
});
