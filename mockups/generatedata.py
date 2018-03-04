

import json
import random

def getSeller():
	return random.choice(xrange(1, 100))


summaries = {}
for i in xrange(1, 101):

	sales = {}

	for y in xrange(1, 80):
		entry = {
			"dateString": "Feb 14, 15:30",
			"amount": 10
		}
		sales["KEY%s" % (y)] = [entry]


	summaries["A%s" % (i) ] = sales


purchases = {}

for i in xrange(0, 2000):

	entries = []
	for y in xrange(0, 6):
		seller = i % 100

		entry = {
			"amount": 10,
			"dateString": "Feb 14, 15:30",
			"id": y,
			"swish": True,
			"seller": "A%s" % (seller)

		}
		entries.append(entry)


	purchases["KEY%s" % (i)] = entries


data = {
	"vt18": {
		"purchases": purchases
		#"summaries": summaries
	}
}


with open("out.json", "w") as fp:
	fp.write(json.dumps(data))