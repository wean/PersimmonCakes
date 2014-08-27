#!/bin/env python
#coding: utf-8

import hp
import os

class shubaoBook():
    def __init__(self, clsName, bookName, url):
        self.dirPath = os.path.join(os.path.abspath("."), "ebook", clsName, bookName)
        if os.path.exists(self.dirPath) == False:
            os.makedirs(self.dirPath)
        self.url = url

    def download(self):
        self.soup = hp.getSoup(self.url)
        if self.soup == None:
            print("download book err %s"%(url))
        else:
            options = self.soup.select(".option a")
            for option in options:
                if "下载" in option.text:
                    self.downloadSoup = hp.getSoup(option.attrs["href"])
                    if self.downloadSoup != None:
                        for lk in self.downloadSoup.select(".main .downlink a"):
                            if hp.downloadFile(lk.attrs["href"], self.dirPath, self.url):
                                return
            

class shubaoClass():
    def __init__(self, name, url):
        self.name = name
        self.url = []
        self.url.append(url)

    def main(self):
        self.getBookList()

    def downloadBook(self, name, url):
        shubaoBook(self.name, name, url).download()

    def getBookList(self):
        
        while True:
            if len(self.url)==0:
                break
            geturl = self.url[0]
            del(self.url[0])
            self.soup = hp.getSoup(geturl)
            if self.soup == None:
                print("get book list err %s"%(geturl))
            else:
                for lk in self.soup.select("html body .name a"):
                    self.downloadBook(lk.text, lk.attrs["href"])
                pagelinks = self.soup.select("html body .pages a")
                print(pagelinks)
                if len(pagelinks) > 2 and pagelinks[-2].text == ">":
                    self.url.append(pagelinks[-2].attrs["href"])

class shubao():
    def main(self):
        for cls in self.getClsList():
            if "首页" in cls.text:
                continue
            if "最新上传" in cls.text:
                continue
            if "总排行榜" in cls.text:
                continue
            shubaoClass(cls.text, cls.attrs["href"]).main()

    def getClsList(self):
        return hp.getSoup("http://www.shubao2.com").select("html body .daohang ul li a")

    
if __name__=="__main__":
    shubao().main()
