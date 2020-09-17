
DROP TABLE uniqueselection;

CREATE TABLE uniqueselection AS SELECT DISTINCT(Date), Temperature, RelativeHumidity, Pressure, CPUTemperature FROM meteolog; 

DROP TABLE meteolog;

CREATE TABLE meteolog AS SELECT * FROM uniqueselection;

DROP TABLE uniqueselection;


