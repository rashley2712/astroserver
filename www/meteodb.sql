CREATE TABLE meteolog (Date TEXT unique, hostname TEXT, temperature REAL, humidity REAL, pressure REAL, CPU REAL, IRambient REAL, IRsky REAL);

CREATE TABLE meteodetail (Date TEXT unique, hostname TEXT, exttemp REAL, exthumidity REAL, extpressure REAL, inttemp REAL, intpressure REAL, inthumidity, CPU REAL);

