#!/usr/bin/env python3

import sys
import ephem
import datetime
import argparse
import json
import os

def get_uptime():
    with open('/proc/uptime', 'r') as f:
        uptime_seconds = float(f.readline().split()[0])

    return uptime_seconds

if __name__ == "__main__":

	parser = argparse.ArgumentParser(description='Performs astro calculations with PyEphem and returns data (combines sun and moon).')
	parser.add_argument('-d', '--date', type=str, default="now", help='Date for computation. Default is "now".')
	parser.add_argument('--json', action='store_true', help='Output as JSON object.')
	arg = parser.parse_args()

	moon = ephem.Moon()

	output = True
	JSON = False
	if arg.json:
		output = False
		JSON = True

	responseJSON = {}

	
	########################### SYSTEM ############################
	sysInfo = os.uname()
	sysJSON = {
		'hostname' : sysInfo.nodename,
		'uptime' : get_uptime(),
		'hostutc': str(datetime.datetime.utcnow())
	}

	responseJSON['system'] = sysJSON

	############################ MOON #############################
	if arg.date == 'now':	
		currentDate = ephem.Date(datetime.datetime.utcnow())
	else:
		currentDate = ephem.Date(arg.date)	
	
	if output: print(currentDate)
	
	moon.compute(currentDate)
	
	if output: print("Illuminated:", moon.phase)
	if output: print("Next new moon:", ephem.next_new_moon(currentDate))

	timeToNewMoon = ephem.next_new_moon(currentDate) - currentDate
	timeSinceLastNewMoon = currentDate - ephem.previous_new_moon(currentDate)
	period = timeToNewMoon + timeSinceLastNewMoon
	phase = timeSinceLastNewMoon / period
	
	if phase>0.5:
		mode = "waning"
	else:
		mode = "waxing" 
	if output: print("%1.0f%% illuminated, %s"%(moon.phase, mode))
	moonJSON = {
		'illuminated' : moon.phase, 
		'mode' : mode,
		'daysold' : timeSinceLastNewMoon,
		'daystonew' : timeToNewMoon
	}
	responseJSON['moon'] = moonJSON
	
	############################ SUN ##############################
	roque = ephem.Observer()
	roque.lon = '342.1184'
	roque.lat = '28.7606'
	roque.elevation = 2326			# Useless parameter!
	roque.date = currentDate	
	roque.horizon = "-1.19"
	sunrise = roque.next_rising(ephem.Sun())
	(year, month, date, hour, minute, second) = sunrise.tuple()
	afterSunriseHour = hour+1
	
	(year, month, date, hour, minute, second) = currentDate.tuple()
	# If between 9.00am and midnight. Use the date set to midday
	if hour<afterSunriseHour: date = date - 1
	hour = 12
	minute = 0
	second = 0
	if output: print("Shifting date from: ", currentDate)
	currentDate = ephem.Date((year, month, date, hour, minute, second))
	if output: print("            ... to: ", currentDate)
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
	
	sunJSON = {
		'sunset' : sunset,
		'sunrise' : sunrise,
		'etwilight' : eTwilight,
		'mtwilight' : mTwilight
	}
	responseJSON['sun'] = sunJSON

	
	if JSON:
		sys.stdout.write(json.dumps(responseJSON))
		sys.stdout.flush()
	else: 
		print("JSON response: ")
		print("\t", responseJSON)
