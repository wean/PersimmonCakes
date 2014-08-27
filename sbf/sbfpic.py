#!/bin/env python
#coding: utf-8

import hp
import os
import re
import glob
import bs4

if __name__=="__main__":
    for filePath in glob.glob(os.path.abspath(".") + "/sb/*/*/PICURL"):
        dirPath = os.path.join(os.path.split(filePath)[0], "PIC")
        if os.path.exists(dirPath) == False:
            os.makedirs(dirPath)
        f = open(filePath)
        for url in f.readlines():
            hp.downloadFile(url, dirPath, "")
        f.close()
        
