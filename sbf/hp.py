#!/bin/env python
#coding: utf-8

#import urlparse
import requests as rq
from requests.auth import AuthBase as ab
import hashlib
#from urllib import urlencode
#from cookielib import MozillaCookieJar
from bs4 import BeautifulSoup as bs
import time
import uuid
from os.path import basename
from urllib.parse import urlsplit
import os

user_agent = 'Chrome/20.0.1132.57 Safari/536.11'
session = rq.session()
session.headers['User-Agent'] = user_agent
session.timeout = 5
#cookies = dict(cookies_are='working')
#session.cookies = cookies

def detectEncoding(r):
    if r.encoding == 'ISO-8859-1':
        encodings = rq.utils.get_encodings_from_content(r.text)
        if encodings:
            r.encoding = encodings[0]
        else:
            r.encoding = r.apparent_encoding
            
    if r.encoding == 'gb2312':
        r.encoding = 'gb18030'

def getText(url):
    time.sleep(1)
    print("get Text %s"%(url))
    try:
        r = session.get(url)
        
        detectEncoding(r)
        return r.text
    except Exception:
        return None

def getSoup(url):
    time.sleep(1)
    print("get SOUP %s"%(url))
    try:
        r = session.get(url)

        detectEncoding(r)
        return bs(r.text)
    except Exception:
        return None

def url2name(url):
    return basename(urlsplit(url)[2])

def downloadFile(url, path, referUrl, fileName=None):
    print("download File %s"%(url))
    time.sleep(1)
    #try:
    session.headers["Referer"] = referUrl
    try:
        r = session.get(url, stream=True)

        localName = url2name(url)
        if r.headers.get('Content-Disposition') != None:
            print(r.headers['Content-Disposition'])
            # If the response has Content-Disposition, we take file name from it
            localName = r.headers['Content-Disposition'].encode("latin-1").decode("utf-8").split('filename=')[1]
            if localName[0] == '"' or localName[0] == "'":
                localName = localName[1:-1]
                localName = localName.replace("%0A", "").replace("%0a", "")
        elif r.url != url:
            # if we were redirected, the real file name we take from the final URL
            localName = url2name(r.url)
        if fileName:
            # we can force to save the file as specified name
            localName = fileName
        
        localName = os.path.join(path, localName)
        if os.path.exists(localName):
            print("local file size %d remote file size %d"%(os.path.getsize(localName), len(r.content)))
            if len(r.content) == os.path.getsize(localName):
                return True
        print("download file to %s"%(localName))
        with open(localName, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
                f.flush()
            f.close()
        return True
    except Exception:
        return False


if __name__=="__main__":
    print("ffff")
    r = session.get("http://we.99bitgc.in/")
    print(r)
    detectEncoding(r)
    print(r.text)
