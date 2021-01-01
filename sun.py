#!/usr/bin/env python

import sys
import ephem
import datetime
import argparse
import json

if __name__ == "__main__":

	parser = argparse.ArgumentParser(description='Performs astro calculations with PyEphem and returns data.')
	parser.add_argument('-d', '--date', type=str, default="now", help='Date for computation. Default is "now".')
	parser.add_argument('--json', action='store_true', help='Output as JSON object.')
	arg = parser.parse_args()
	output = True
	JSON = False
	if arg.json:
		output = False
		JSON = True
	if arg.date == 'now':	
		currentDate = ephem.Date(datetime.datetime.utcnow())
		(year, month, date, hour, minute, second) = currentDate.tuple()
		# If between 9.00am and midnight. Use the date set to midday
		if hour>9:
			hour = 12
			minute = 0
			second = 0
		else:
			hour = 12
			minute = 0
			second = 0
			date = date - 1
		if output: print(year, month, date, hour, minute, second)
		currentDate = ephem.Date((year, month, date, hour, minute, second))
		
	
	else:
		currentDate = ephem.Date(arg.date)
		currentDate+= .5
			
	if output: 
		print("Using the following date for calculations: ", currentDate)
		print("Current PyEphem date is: ", ephem.now() )

	#---------------------------------------------------------------------------------
		
	roque = ephem.Observer()
	roque.lon = '342.1184'
	roque.lat = '28.7606'
	roque.elevation = 2326			# Useless parameter!
	roque.date = currentDate
	
	roque.horizon = "-1.19"
	sunset = str(roque.next_setting(ephem.Sun())) + " UT"
	sunrise = str(roque.next_rising(ephem.Sun())) + " UT"
	
	roque.horizon = "-18"
	eTwilight = str(roque.next_setting(ephem.Sun(), use_center=False)) + " UT"
	mTwilight = str(roque.next_rising(ephem.Sun(), use_center=False)) + " UT"
	
	if output:  
		print("Sunset:", sunset)
		print("Evening twilight:", eTwilight)
		print("Morning twilight:", mTwilight)
		print("Sunrise:", sunrise)
		
	if JSON:
		response = {}
		response['sunset'] = sunset
		response['sunrise'] = sunrise
		response['etwilight'] = eTwilight
		response['mtwilight'] = mTwilight
		sys.stdout.write(json.dumps(response))
	
	sys.stdout.flush()
	sys.exit()
