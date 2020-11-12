import json

class WEBdb:
	def __init__(self):
		self.dates = None
		self.filename = "htmldb.json"
		self.db = { }

	def load(self):
		try:
			jsonFile = open(self.filename, 'rt')
			self.db = json.loads(jsonFile.read())
			jsonFile.close()
		except Exception as e:
			print(e)
			print("Unable to load", self.filename)

	def dump(self):
		jsonFile = open(self.filename, 'wt')
		json.dump(self.db, jsonFile, indent=4)
		jsonFile.close()

	def set(self, property, value):
		print("property, value", property, value)
		if type(value) is dict:
			print("adding a nested property.")
			print("Current root level keys", self.db.keys())
			if property not in self.db.keys():
				self.db[property] = {}
			for key in value.keys():
				print(key, value[key])
				self.db[property][key] = value[key]
			
		else:
			self.db[property] = value
		
		
		self.dump()

	def append(self, property, value):
		if property not in self.db.keys(): self.db[property] = []
		self.db[property].append(value)
		sortedList = sorted(self.db[property])
		self.db[property] = sortedList
		self.dump()

	def removeDuplicates(self, property):
		itemArray = self.db[property]
		dedupedArray = []
		for item in itemArray:
			if item not in dedupedArray: dedupedArray.append(item)
		self.db[property] = dedupedArray
		self.dump()