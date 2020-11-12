#!/usr/bin/env python3

import argparse, os
#from HTMLParser import HTMLParser
#from bs4 import BeautifulSoup
import urllib.error
import urllib.request
import sys
import json, datetime
import webdb

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
	
	parser = argparse.ArgumentParser(description='Opens up a URL for the La Palma Meteo site and downloads images and data.')
	parser.add_argument('--show', action='store_true', help='Show the images in a window on the desktop.')
	parser.add_argument('-c','--config', type=str, default="autometeo.cfg", help='The config file.')
	args = parser.parse_args()
	
	configFile = open(args.config, 'rt')
	config = json.loads(configFile.read())
	print(config)

	db = webdb.WEBdb()
	db.filename = config['dbFile']
	db.load()
	db.dump()

	print("Base URL is:", config['baseURL']) 

	now = datetime.datetime.now()
	nowString = now.strftime("%Y%m%d_%H%M")
	print("Running the fetch at:",nowString)

	params = [  {	"query": 'temp_act_',
					"store_as" : 'temperature',
			 	}, 
				{	"query": 'hum_act_',
					"store_as" : 'humidity',
				},
				{	"query": 'cloud_act_',
					"store_as" : 'cloud',
				}
			]
	for param in params: 
	
		JSONURL = os.path.join(config['baseURL'], "api?p=%s&lat=%.3f&lon=%.3f"%(param['query'], config['lat'], config['lon']))
		print(JSONURL)

		response = URLget(JSONURL)
	
		headers = str(response.headers)
		responseData = response.read()
		data = json.loads(responseData)
		response.close()

		param['value'] = data['poi']['value']
		param['map'] = data['map']['map_url']
		param['overlay'] = data['map']['overlay_url']
		param['time'] = data['record_found']
		timeStamp = datetime.datetime.strptime(param['time'], '%Y-%m-%dT%H:%M:%S%z')
		timeString = timeStamp.strftime("%Y%m%d_%H%M")
		param['timeString'] = timeString

		
	for param in params:
		# Get the map image first
		imageURL = param['map']
		mapOutput = os.path.join(config['tmpPath'], "%s_%s.png"%(param['store_as'], param['timeString']))
		if os.path.exists(mapOutput): 
			print("skipping...%s"%imageURL)
		else:
			response = URLget(imageURL)
			outFile = open(mapOutput, 'wb')
			outFile.write(response.read())
			outFile.close()
			print("written to file %s"%mapOutput)
			
		# Now get the text information overlay to the map
		imageURL = param['overlay']
		overlayOutput = os.path.join(config['tmpPath'], "%s_%s_overlay.png"%(param['store_as'], param['timeString']))
		if os.path.exists(overlayOutput): 
			print("skipping...%s"%imageURL)
		else:
			response = URLget(imageURL)
			outFile = open(overlayOutput, 'wb')
			outFile.write(response.read())
			outFile.close()
			print("written to file %s"%overlayOutput)

		# and merge the two images...
		mapImage = Image.open(mapOutput)
		overlayImage = Image.open(overlayOutput)
		mergedImage = Image.alpha_composite(mapImage, overlayImage)
		mapImage.close()
		overlayImage.close()
		if args.show: mergedImage.show(title="combined")
		dateString = param['timeString'][:-5]
		destinationFolder = os.path.join(config['HTMLPath'], dateString)
		if not os.path.exists(destinationFolder):
			os.mkdir(destinationFolder)

		destinationImage = os.path.join(destinationFolder,  "%s_%s.png"%(param['store_as'],param['timeString']))
	
		mergedImage.save(destinationImage)
		mergedImage.close()
		webPathToImage = os.path.join(config['webRoot'], dateString,  "%s_%s.png"%(param['store_as'],param['timeString']) )
		db.set(param['store_as'], { "value": param['value']})
		db.set(param['store_as'], { "update": param['timeString']})
		db.set(param['store_as'], { "image": webPathToImage })
		
		
	db.set("lastCrawl", nowString)

	# Also write the text information to a simple log file...
	outline = "%s"%timeString
	for param in params:
		outline+=", %.1f"%param['value']
	print(outline)
	outline+="\n"
	logfile = open(config['logfile'], "at")
	logfile.write(outline)
	logfile.close()


	print("Fetched the data ok...")
	print("Written updates to %s and files to %s"%(config['dbFile'], destinationFolder))