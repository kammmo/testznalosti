#!/Program Files/Python32/python
print("Content-type: text/html");
print();

import os
import cgi, cgitb
import math
import time
import datetime
import random
import csv
import pdb

#get value from POST (ajax request)
form = cgi.FieldStorage();
mod = form.getvalue('mode');
nV = form.getvalue('nick');
tV = form.getvalue('title');
iV = form.getvalue('itext');
eV = form.getvalue('expMin');
url = form.getvalue('url');
i=0;
dNow = datetime.datetime.now()
#if mode is 'w' (write data from form)  
if mod == 'w':
  #calculate time from exp
  eV = int(eV)
  dayDE = eV/1440
  dayNE = math.floor(dayDE)
  dayZE = dayDE-dayNE
  hourDE = dayZE*24
  hourNE = math.floor(hourDE)
  hourZE = hourDE-hourNE
  minuteDE = hourZE*60
  minuteNE = math.floor(minuteDE)
  minuteZE = minuteDE-minuteNE
  secondNE = math.floor(minuteZE*60)
  #exp in datetime format
  dPlus = datetime.timedelta(days=dayNE, seconds=secondNE, microseconds=0, milliseconds=0, minutes=minuteNE, hours=hourNE, weeks=0)
  #entry exp in actual datetime (dNow) + time to exp from form (dPlus)
  dExp = dNow + dPlus
  #random number for url
  rand = random.random()*1234567891234
  urlCode = math.floor(rand)
  #open data file
  myDataB = csv.writer(open('data.csv', 'a', newline=''))
  #write new record (new line with input from form)
  myDataB.writerow([nV, tV, dExp, urlCode, iV])
  #send back urlCode number
  print(urlCode)

#mod url > show text via url  
elif mod == 'url':
  myData = csv.reader(open('data.csv', newline=''))
  for row in myData:
    #fin row with url
    if row[3]==url:
      #print text
      print("Hi ", row[0], ". Here is your text: \n", row[4])
#mod for search via nick      
elif mod == 'sN':
  myData = csv.reader(open('data.csv', newline=''))
  for row in myData:
    dExp = row[2]
    dEEE = dExp.partition(".")
    dExpi = datetime.datetime.strptime(dEEE[0], "%Y-%m-%d %H:%M:%S")
    #find exp lines
    if dNow < dExpi:
      #search in non-exp lines and print lines as array
      if row[0]==nV:
        if i==0:
          print('[')  
        i += 1
        print(row)
        print(',')
  if i>0:
    print(']')
  
#mod for search via title      
elif mod == 'sT':
  myData = csv.reader(open('data.csv', newline=''))
  myNData = csv.writer(open('tdata.csv', 'w', newline=''))
  for row in myData:
    dExp = row[2]
    dEEE = dExp.partition(".")
    dExpi = datetime.datetime.strptime(dEEE[0], "%Y-%m-%d %H:%M:%S")
    #find exp lines
    if dNow < dExpi:
      #search in non-exp lines and print lines as array
      if row[1]==tV:
        if i==0:
          print('[')
        i += 1
        print(row)
        print(',')
      #write row no new csv file
      myNData.writerow(row)
  if i>0:
    print(']')