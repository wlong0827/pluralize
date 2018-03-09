
#!/usr/bin/python

'''
	InFB - Information Facebook
	Usage: infb.py user@domain.tld password
	       infb.py

	http://ruel.me

	Forked by Nate Plamondon
		Pulls email, phone, birthday, company, job title, spouse, and web page.
		Adds option to retain info pages.
		Sleeps between pulls to reduce risk of detection.
		Dates need to be standardized (MM-DD-YYYY or DD-MM-YYYY) before importing to Google.

	Copyright (c) 2011, Ruel Pagayon
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
		* Redistributions of source code must retain the above copyright
		  notice, this list of conditions and the following disclaimer.
		* Redistributions in binary form must reproduce the above copyright
		  notice, this list of conditions and the following disclaimer in the
		  documentation and/or other materials provided with the distribution.
		* Neither the name of the author nor the names of its contributors
		  may be used to endorse or promote products derived from this software
		  without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS "AS IS" AND ANY
	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
	INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
	OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
	ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
'''

import sys
import re
import urllib
import urllib2
import cookielib
import csv
import json
import os
import time

def main():
	# Check the arguments
	if len(sys.argv) == 3:
		user = sys.argv[1]
		passw = sys.argv[2]
		pull(user, passw)
		foo = raw_input('Would you like to scrape now? ')
		if foo == "y" or foo == "Y":
			scrape()
		bar = raw_input('Delete .htm files? ')
		if bar == "y" or bar == "Y":
			cleanup()
		sys.exit(0)

	elif len(sys.argv) == 1:
		scrape()

def cleanup():
	files = os.listdir(".")
	files = [fn for fn in files if fn[-4:] == '.htm']
	try:
		[os.remove(fn) for fn in files]
		print "Removed %d .htm files." % len(files)
	except:
		print "Couldn't delete all .htm files."
		sys.exit(1)

def pull(user, passw):
	# Initialize the needed modules
	CHandler = urllib2.HTTPCookieProcessor(cookielib.CookieJar())
	browser = urllib2.build_opener(CHandler)
	browser.addheaders = [('User-agent', 'InFB - ruel@ruel.me - http://ruel.me')]
	urllib2.install_opener(browser)

	# Initialize the cookies and get the post_form_data
	print 'Initializing..'
	res = browser.open('http://m.facebook.com/index.php')
	# mxt = re.search('name="post_form_id" value="(\w+)"', res.read())
	# pfi = mxt.group(1)
	# print 'Using PFI: %s' % pfi
	# res.close()
	mxt = re.search('name="m_ts" value="(\w+)"', res.read())
	pfi = mxt.group(1)
	print 'Using PFI: %s' % pfi
	res.close()



	# Initialize the POST data
	data = urllib.urlencode({
		'lsd'				: '',
		'post_form_id'		: pfi,
		'charset_test' 		: urllib.unquote_plus('%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84'),
		'email'				: user,
		'pass'				: passw,
		'login'				: 'Login'
	})

	# Login to Facebook
	print 'Logging in to account ' + user
	print data
	res = browser.open('https://www.facebook.com/login.php?m=m&refsrc=http%3A%2F%2Fm.facebook.com%2Findex.php&refid=8', data)
	rcode = res.code
	if not re.search('Logout', res.read()):
		print 'Login Failed'

		# For Debugging (when failed login)
		fh = open('debug.html', 'w')
		fh.write(res.read())
		fh.close

		# Exit the execution :(
		exit(2)
	res.close()

	# Get Access Token
	res = browser.open('http://developers.facebook.com/docs/reference/api')
	conft = res.read()
	mat = re.search('access_token=(.*?)"', conft)
	acct = mat.group(1)
	print 'Using access token: %s' % acct

	# Get friend's ID
	res = browser.open('https://graph.facebook.com/me/friends?access_token=%s' % acct)
	fres = res.read()
	jdata = json.loads(fres)

	# God for each ID in the JSON response
	for acc in jdata['data']:
		fid = acc['id']
		fname = acc['name']

		# Go to ID's profile
		res = browser.open('http://m.facebook.com/profile.php?id=%s&v=info&refid=17' % fid)
		html = res.read()
		out = open(fname + '.htm', 'w')
		out.write(html)
		out.close()

		time.sleep(4)
		
def scrape():
	count = 0
	
	files = os.listdir(".")
	files = [fn for fn in files if fn[-4:] == '.htm']

	# Initialize the CSV writer
	fbwriter = csv.writer(open('friends.csv', 'ab'), delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

	fbwriter.writerow(["Name", "E-Mail Address", "Mobile Phone", "Birthday", "Company", "Job Title", "Spouse", "Web Page"])

	for fn in files:
		count += 1

		html = open(fn, 'r').read()
		fname = fn[:-4]
		xma = re.search('mailto:(.*?)"', html)
		xmb = re.search('tel:(.*?)"', html)
		xmc = re.search('Birthday:</div></td><td valign="top"><div class="mfsm">(.*?)<', html)
		xmd = re.search('Company:</div></td><td valign="top"><div class="mfsm">(.*?)<', html)
		xme = re.search('Position:</div></td><td valign="top"><div class="mfsm">(.*?)<', html)
		xmf = re.search('Married to <[^>]*>(.*?)<', html)
		xmg = re.search('Website:[^?]*\?u=(.*?)"', html)
		row = [fname]
		if xma:
			# Replace the html entity from the scraped information
			email = xma.group(1).replace('%40', '@')
			try:
				row.append(email)
			except:
				row.append(repr(email))
		else:
			row.append("")

		for info in [xmb, xmc, xmd, xme, xmf]:
			if info:
				try:
					row.append(info.group(1))
				except:
					row.append(repr(info.group(1)))
			else:
				row.append("")

		if xmg:
			try:
				url = xmg.group(1).replace('&amp;', '&')
				row.append(urllib2.unquote(url))
			except:
				row.append(repr(urllib2.unquote(url)))
		else:
			row.append("")

		fbwriter.writerow(row)

	if count:
		print "Scraped %d files for user data." % count
	else:
		print "Scrape failed. Have you pulled the pages yet?"
		usage()

def usage():
	'''
		Usage: infb.py user@domain.tld password
	'''
	print 'Usage: ' + sys.argv[0] + ' user@domain.tld password'
	sys.exit(1)

if __name__ == '__main__':
	main()
