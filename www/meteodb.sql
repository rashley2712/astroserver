CREATE TABLE meteolog (Date TEXT unique, hostname TEXT, temperature REAL, humidity REAL, pressure REAL, CPU REAL, IRambient REAL, IRsky REAL);


CREATE TABLE meteodetail (Date TEXT unique, hostname TEXT, exttemp REAL, exthumidity REAL, extpressure REAL, inttemp REAL, inthumidity REAL, intpressure REAL, CPU REAL);


create table temp as select Date, hostname, exttemp, exthumidity, extpressure, inttemp, inthumidity, intpressure, CPU from meteodetail;

drop table meteodetail;

CREATE TABLE meteodetail (Date TEXT unique, hostname TEXT, exttemp REAL, exthumidity REAL, extpressure REAL, inttemp REAL, inthumidity REAL, intpressure REAL, CPU REAL);

insert into meteodetail select Date, hostname, exttemp, exthumidity, extpressure, inttemp, intpressure, inthumidity, CPU from temp;
