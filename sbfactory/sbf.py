#!/usr/bin/env python3
#-*- coding: utf-8 -*-

import urllib.request
import chardet
from bs4 import BeautifulSoup

from urllib.parse import urlparse

startLocation = None
dbPath = '~/.sbfactory'

def getContent(url):
    """
    
    Arguments:
    - `url`:
    """
    content = urllib.request.urlopen(url)
    s = content.read()
    cs = chardet.detect(s)
    return s.decode(cs['encoding'],'ignore')

def getSoup(url):
    """
    
    Arguments:
    - `url`:
    """
    return BeautifulSoup(getContent(url))

def handleUrl(url):
    """
    
    Arguments:
    - `url`:
    """
    

if __name__ == '__main__':
    starturl = 'http://99.99btgc.info/00/01.html'
    startLocation = urlparse(starturl)
    handleUrl(starturl)
