CREATE TABLE temperature ( Date TEXT unique, value REAL);
CREATE TABLE humidity ( Date TEXT unique, value REAL);
CREATE TABLE cloud ( Date TEXT unique, value REAL);
CREATE TABLE wind (Date TEXT unique, mag REAL, from_x REAL, from_y REAL);
CREATE TABLE humidityhistograms ( Date TEXT unique, median REAL, bin00 INTEGER, bin10 INTEGER, bin20 INTEGER, bin30 INTEGER, bin40 INTEGER, bin50 INTEGER, bin60 INTEGER, bin70 INTEGER, bin80 INTEGER, bin90 INTEGER);

