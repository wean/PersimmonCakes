#!/bin/env python
#coding: utf-8

import hp
import os
import re
import glob
import bs4

class ClsPage():
    def __init__(self, baseUrl, pageUrl):
        self.baseUrl = baseUrl
        self.pageUrl = pageUrl

    def nextDir(self):
        self.dirName = None
        self.dirDirPath = None
        self.dirReadMePath = None
        self.dirPicPath = None
        self.dirLinkPath = None
        self.hasLink = False

    def collectContent(self, contents):
        for cnt in contents:
            if cnt == None:
                continue
            elif isinstance(cnt, bs4.element.Tag):
                if cnt.name.lower() == "br":
                    pass
                elif cnt.name.lower() == "a" or cnt.name.lower() == "img":
                    if len(cnt.contents) <= 1:
                        self.cnts.append(cnt)
                        continue
                
                self.collectContent(cnt.contents)
            elif isinstance(cnt, bs4.element.NavigableString):
                self.cnts.append(cnt)

    def parse(self):
        self.fileName = os.path.split(self.pageUrl)[1]
        self.dirName = os.path.splitext(self.fileName)[0]
        self.dirPath = os.path.join(os.path.abspath("."), "sb", self.dirName)
        if len(glob.glob(self.dirPath + "/*")) > 0:
            return
        if os.path.exists(self.dirPath) == False:
            os.makedirs(self.dirPath)
        soup = hp.getSoup(self.baseUrl+self.pageUrl)
        if soup == None:
            return
        f = open(os.path.join(self.dirPath, "README"), "w")
        f.write(str(soup))
        f.close()
        contents = soup.select("#content")
        if len(contents) == 0:
            return
        content = contents[0]
        self.nextDir()
        self.cnts = []
        self.collectContent(content.contents)

        for cnt in self.cnts:
            strContent=""
            if cnt == None:
                continue
            elif isinstance(cnt, bs4.element.Tag):
                if cnt.name.lower() == "img":
                    if self.dirPicPath != None:
                        f = open(self.dirPicPath, "a")
                        f.write(cnt.attrs["src"] + "\n")
                        f.close()
                elif cnt.name.lower() == "a":
                    if len(cnt.contents) == 1 and isinstance(cnt.contents[0], bs4.element.Tag) and cnt.contents[0].name == "img":
                        if self.dirPicPath != None:
                            f = open(self.dirPicPath, "a")
                            f.write(cnt.contents[0].attrs["src"] + "\n")
                            f.close()
                    else:
                        if self.dirLinkPath != None:
                            self.hasLink = True
                            f = open(self.dirLinkPath, "a")
                            f.write(cnt.attrs["href"] + "\n")
                            f.close()
                else:
                    strContent=cnt.text
            elif isinstance(cnt, bs4.element.NavigableString):
                strContent=str(cnt)

            if strContent != None:
                strContent = strContent.strip()
            if strContent!="":
                if self.hasLink == True:
                    strToNextA=""
                    nxtCnt = cnt
                    while True:
                        if nxtCnt == None:
                            break
                        if isinstance(nxtCnt, bs4.element.Tag):
                            if nxtCnt.name.lower() == "a":
                                if len(nxtCnt.contents) == 1 and isinstance(nxtCnt.contents[0], bs4.element.Tag) and nxtCnt.contents[0].name == "img":
                                    pass
                                else:
                                    break
                            elif nxtCnt.name.lower() == "img":
                                pass
                            else:
                                strToNextA += nxtCnt.text
                        elif isinstance(nxtCnt, bs4.element.NavigableString):
                            strToNextA += str(nxtCnt)
                        nxtCnt = nxtCnt.next
                    if len(strToNextA) > 50:
                        self.nextDir()

                if len(strContent) > 8:
                    isSharp = True
                    for s in strContent:
                        if s != '=':
                            isSharp = False
                            break
                    if isSharp == True:
                        self.nextDir()
                        continue
                
                    isMinus = True
                    for s in strContent:
                        if s != '-':
                            isMinus = False
                            break
                    if isMinus == True:
                        self.nextDir()
                        continue

                if self.dirName == None:
                    self.dirName = strContent.replace("/", "")
                    if len(self.dirName) > 30:
                        self.dirName = self.dirName[0:30]
                    self.dirDirPath = os.path.join(self.dirPath, self.dirName)
                    if os.path.exists(self.dirDirPath) == False:
                        os.makedirs(self.dirDirPath)
                    self.dirReadMePath = os.path.join(self.dirDirPath, "README")
                    self.dirPicPath = os.path.join(self.dirDirPath, "PICURL")
                    self.dirLinkPath = os.path.join(self.dirDirPath, "LINKURL")
                if self.dirReadMePath != None:
                    f = open(self.dirReadMePath, "a")
                    f.write(strContent + "\n")
                    f.close()

class HomeCls():
    def __init__(self, baseUrl, clsUrl):
        self.baseUrl = baseUrl
        self.clsUrl = clsUrl

    def parse(self):
        soup = hp.getSoup(self.baseUrl+self.clsUrl)
        if soup == None:
            return
        links = soup.select("html #content a")
        for link in links:
            if link.attrs["href"][0:4] == "/p2p":
                ClsPage(self.baseUrl, link.attrs["href"]).parse()

class Home():
    def main(self):
        self.loadCls()
        self.parseCls()

    def parseCls(self):
        for url in self.clsUrls:
            HomeCls(self.baseUrl,url).parse()

    def loadCls(self):
        self.baseUrls = []
        self.clsUrls = []
        f = open("99.url")
        for url in f.readlines():
            self.baseUrls.append(url.strip("\n"))
        f.close()
        for url in self.baseUrls:
            text = hp.getText(url+"/hgc1.js")
            urls = []
            if text != None:
                urls = re.findall("<a href=(.*) target=_blank>", text)
            if len(urls) == 0:
                text = hp.getText(url+"/sgc2.js")
                if text == None:
                    continue
                urls = re.findall("src=\\\\\"(.*)/hgc1.js\\\\\">", text)
            print(urls)
            for newUrl in urls:
                newUrl = newUrl.replace("\\/", "/")
                if (newUrl in self.baseUrls) == False:
                    self.baseUrls.append(newUrl)
        
        for url in self.baseUrls:
            soup = hp.getSoup(url)
            if soup == None:
                self.baseUrls.remove(url)
                continue
            clsLinks = soup.select("html body div table tr a")
            for clsLink in clsLinks:
                if clsLink.attrs["href"][0:2].lower() == "00":
                    self.clsUrls.append(clsLink.attrs["href"])
            if len(self.clsUrls) > 0:
                self.baseUrl = url
                break
                    
        f = open('99.url', 'w')
        for url in self.baseUrls:
            f.write(url+"\n")
        f.close()


if __name__=="__main__":
    Home().main()
    
    #ClsPage("http://we.99bitgc.net/", "/p2p/08/14-08-05-23-56-37.html").parse()

