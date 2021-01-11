#!/usr/bin/env python3

import argparse, os
#from HTMLParser import HTMLParser
#from bs4 import BeautifulSoup
import urllib.error
import urllib.request
import sys
import json, datetime
import webdb
import numpy

from PIL import Image
		
def URLget(URL):
	try:
		response = urllib.request.urlopen(URL)
	except  urllib.error.HTTPError as e:
		print("We got an error of:", e.code)
		sys.exit()
	except urllib.error.URLError as e:
		print(e.reason)
		sys.exit()
	return response


if __name__ == "__main__":
	
	parser = argparse.ArgumentParser(description='Opens the LPMeteo SQLITE3 databases and produces some tables with stats.')
	parser.add_argument('-c','--config', type=str, default="autometeo.cfg", help='The config file.')
	parser.add_argument('--clean', action="store_true", help="Clean out the sqllite database.")
	args = parser.parse_args()
	
	configFile = open(args.config, 'rt')
	config = json.loads(configFile.read())
	print(config)

	dbFilename = config['sqldb']

	print("Database is:", dbFilename)

	# Open the sql database
	import sqlite3
	connection = sqlite3.connect(config['sqldb'])


	# Get all available dates
	SQLstring = "SELECT DISTINCT(substr(Date, 0, 9)) AS availableDate FROM temperature"
	try:
		cursor = connection.cursor()	
		cursor.execute(SQLstring)
		rows = cursor.fetchall()
	except sqlite3.OperationalError as e:
		print(e)
	
	allDates = []
	for row in rows:
		rowDate = str(row[0])
		allDates.append(rowDate)

	print(allDates)

	histograms = []
	for rowDate in allDates:
		#rowDate = '20201126'
		# Get humidity stats for this date
		rowEntry = { "date" : rowDate, "00-09": 0, "10-19" : 0,  "20-29" : 0,  "30-39" : 0,  "40-49" : 0,  "50-59" : 0,  "60-69" : 0,  "70-79" : 0,  "80-89" : 0, "90-100" : 0, "total" : 0, "histogram": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
		SQLstring = "select cast(value/10 as int)*10 as bin_floor, count(Date) as count from humidity WHERE substr(Date, 0, 9)=\"" + rowDate + "\" group by bin_floor;"
		try:
			cursor = connection.cursor()	
			cursor.execute(SQLstring)
			rows = cursor.fetchall()
		except sqlite3.OperationalError as e:
			print(e)
			sys.exit()

		print(rowDate)
		total = 0
		for row in rows:
			bucket = row[0]
			bucketString = "%d0-%d9"%(int(bucket/10), int(bucket/10))
			if bucketString=="100-109": bucketString = "90-100"
			if bucketString=="90-99": bucketString = "90-100"
			print(bucketString)
			rowEntry[bucketString]+=row[1]
			bucket = int(row[0]/10) 
			print(bucket)
			if bucket==10: bucket = 9 
			rowEntry['histogram'][bucket]+=row[1]
			total+= row[1]

		rowEntry["total"] = total
		
		# Now get the median humidity for the day
		print("rowDate:", rowDate)
		SQLstring = "select value from humidity WHERE Date > \"" + rowDate + "_0000" + "\" AND Date<\"" + rowDate + "_2359" "\";"
		print(SQLstring)
		try:
			cursor = connection.cursor()	
			cursor.execute(SQLstring)
			rows = cursor.fetchall()
		except sqlite3.OperationalError as e:
			print(e)
			sys.exit()
		values = []
		for row in rows:
			values.append(float(row[0]))
		print(values)
		rowEntry["median"] = numpy.median(values)
		histograms.append(rowEntry)
	
	for h in histograms:
		print(h)

	# Rebuild the database tables
	try:
		SQLstring = "DROP table IF EXISTS humidityhistograms;"
		connection.execute(SQLstring)
		SQLstring =  "CREATE table humidityhistograms ( Date TEXT unique, median REAL, bin00 INTEGER, bin10 INTEGER, bin20 INTEGER, bin30 INTEGER, bin40 INTEGER, bin50 INTEGER, bin60 INTEGER, bin70 INTEGER, bin80 INTEGER, bin90 INTEGER);"
		connection.execute(SQLstring)
		
	except sqlite3.OperationalError as e:
		print(e)
	
	for h in histograms:
		# Import the data
		try:
			SQLstring = "INSERT INTO humidityhistograms VALUES ("
			SQLstring+= "'" + str(h['date']) + "', " + str(h['median']) 
			for bin in h['histogram']:
				SQLstring+= ", " + str(bin)
			SQLstring+= ");"
			print(SQLstring)
			connection.execute(SQLstring)
			
		except sqlite3.OperationalError as e:
			print(e)
		
	connection.commit()
	connection.close()
	