#-*- coding: utf-8 -*-
from __future__ import print_function
import time
from datetime import date, timedelta
import datetime
from collections import namedtuple
import logging
import logging.handlers
import webiopi
import mysql.connector
import os
from mysql.connector import errorcode
from math import pi,sqrt,sin,cos,atan2

# 로거 인스턴스를 만든다
logger = logging.getLogger('mylogger2')
# 포매터를 만든다
fomatter = logging.Formatter('[%(levelname)s|%(filename)s:%(lineno)s] %(asctime)s > %(message)s')
# 스트림과 파일로 로그를 출력하는 핸들러를 각각 만든다.
fileMaxByte = 1024 * 1024 * 100 #100MB
fileHandler = logging.handlers.RotatingFileHandler('./airclean.log', maxBytes=fileMaxByte, backupCount=10)
streamHandler = logging.StreamHandler()
# 각 핸들러에 포매터를 지정한다.
fileHandler.setFormatter(fomatter)
streamHandler.setFormatter(fomatter)
# 로거 인스턴스에 스트림 핸들러와 파일핸들러를 붙인다.
logger.addHandler(fileHandler)
logger.addHandler(streamHandler)
# 로거 인스턴스로 로그를 찍는다.
logger.setLevel(logging.DEBUG)
logger.debug("===========================")
logger.info("TEST START")
logger.warning("스트림으로 로그가 남아요~")
logger.error("파일로도 남으니 안심이죠~!")
logger.critical("치명적인 버그는 꼭 파일로 남기기도 하고 메일로 발송하세요!")
logger.debug("===========================")
logger.info("TEST END!")

class airclean():
    def __init__(self):
        self.l_time   =datetime.datetime(2019, 7, 13, 21, 40, 5)
        self.l_O2     =0.00
        self.l_CO2    =0.00
        self.l_dust   =0.00
        self.l_temp   =0.00
        self.l_hum    =0.00
        self.l_NH3    =0.00
        self.l_H2S    =0.00
        self.l_HF     =0.00
        self.l_NO2    =0.00
        self.l_CL2    =0.00
        self.l_O3     =0.00
        self.l_CO     =0.00
        self.l_SO2    =0.00
        self.l_fan_in =0
        self.l_fan_out=0
        self.c_time   =datetime.datetime(2019, 7, 13, 21, 40, 5)
        self.c_O2     =0.00
        self.c_CO2    =0.00
        self.c_dust   =0.00
        self.c_temp   =0.00
        self.c_hum    =0.00
        self.c_NH3    =0.00
        self.c_H2S    =0.00
        self.c_HF     =0.00
        self.c_NO2    =0.00
        self.c_CL2    =0.00
        self.c_O3     =0.00
        self.c_CO     =0.00
        self.c_SO2    =0.00
        self.c_fan_in =0
        self.c_fan_out=0
        self.dbuser     ="airclean"
        self.dbpassword ="raspberry"
        self.dbhost     ="localhost"
        self.dbdatabase ="db_air2"
        self.RUNMODE = 1
    def avr_min(self, log, new):
        return round((log*3+ new)/4 , 2)
        
    def db_makelog(self):
        try:
            logger.info("db_makelog")
            cnx = mysql.connector.connect(user=self.dbuser, password=self.dbpassword, host=self.dbhost, database=self.dbdatabase)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                logger.info("Something is wrong with your user name or password")
                rtdata = "0 Something is wrong with your user name or password"
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                logger.info("Database does not exists")
                rtdata = "0 Database does not exists"
            else:
                logger.info(err)
                rtdata = "0 "+err
            return rtdata
        else:
            cursor = cnx.cursor()
            #read state
            add_list    = ("SELECT * FROM air_state WHERE list_no = '1'")
            data_list   = {}
            cursor.execute(add_list, data_list)
            temp_return = cursor.fetchall()
            self.c_time   =datetime.datetime.strptime(str(temp_return[0][1]), '%Y-%m-%d %H:%M:%S')
            self.c_time   =self.c_time.strftime('%Y-%m-%d %H:%M')
            self.c_O2     =temp_return[0][2]
            self.c_CO2    =temp_return[0][3]
            self.c_dust   =temp_return[0][4]
            self.c_temp   =temp_return[0][5]
            self.c_hum    =temp_return[0][6]
            self.c_NH3    =temp_return[0][7]
            self.c_H2S    =temp_return[0][8]
            self.c_HF     =temp_return[0][9]
            self.c_NO2    =temp_return[0][10]
            self.c_CL2    =temp_return[0][11]
            self.c_O3     =temp_return[0][12]
            self.c_CO     =temp_return[0][13]
            self.c_SO2    =temp_return[0][14]
            self.c_fan_in =temp_return[0][15]
            self.c_fan_out=temp_return[0][16]
            #count log current time
            add_list    = ("SELECT count(*) FROM air_log WHERE list_time = %(list_time)s")
            data_list   = {'list_time' : self.c_time}
            cursor.execute(add_list, data_list)
            temp_return = cursor.fetchall()
            if temp_return[0][0] == 1: # find min data: update
                add_list    = ("SELECT * FROM air_log WHERE list_time = %(list_time)s")
                data_list   = {'list_time' : self.c_time}
                cursor.execute(add_list, data_list)
                temp_return = cursor.fetchall()
                self.l_time   =datetime.datetime.strptime(str(temp_return[0][1]), '%Y-%m-%d %H:%M:%S')
                self.l_time   =self.l_time.strftime('%Y-%m-%d %H:%M')
                self.l_O2     =temp_return[0][2]
                self.l_CO2    =temp_return[0][3]
                self.l_dust   =temp_return[0][4]
                self.l_temp   =temp_return[0][5]
                self.l_hum    =temp_return[0][6]
                self.l_NH3    =temp_return[0][7]
                self.l_H2S    =temp_return[0][8]
                self.l_HF     =temp_return[0][9]
                self.l_NO2    =temp_return[0][10]
                self.l_CL2    =temp_return[0][11]
                self.l_O3     =temp_return[0][12]
                self.l_CO     =temp_return[0][13]
                self.l_SO2    =temp_return[0][14]
                self.l_fan_in =temp_return[0][15]
                self.l_fan_out=temp_return[0][16]
                self.l_O2     = self.avr_min(self.l_O2     ,self.c_O2       )
                self.l_CO2    = self.avr_min(self.l_CO2    ,self.c_CO2      )
                self.l_dust   = self.avr_min(self.l_dust   ,self.c_dust     )
                self.l_temp   = self.avr_min(self.l_temp   ,self.c_temp     )
                self.l_hum    = self.avr_min(self.l_hum    ,self.c_hum      )
                self.l_NH3    = self.avr_min(self.l_NH3    ,self.c_NH3      )
                self.l_H2S    = self.avr_min(self.l_H2S    ,self.c_H2S      )
                self.l_HF     = self.avr_min(self.l_HF     ,self.c_HF       )
                self.l_NO2    = self.avr_min(self.l_NO2    ,self.c_NO2      )
                self.l_CL2    = self.avr_min(self.l_CL2    ,self.c_CL2      )
                self.l_O3     = self.avr_min(self.l_O3     ,self.c_O3       )
                self.l_CO     = self.avr_min(self.l_CO     ,self.c_CO       )
                self.l_SO2    = self.avr_min(self.l_SO2    ,self.c_SO2      )
                self.l_fan_in = self.avr_min(self.l_fan_in ,self.c_fan_in   )
                self.l_fan_out= self.avr_min(self.l_fan_out,self.c_fan_out  )
                #update DB air_log
                add_list  = ("UPDATE air_log "
                "SET O2 = %(O2)s, CO2 = %(CO2)s, dust = %(dust)s,temp = %(temp)s,"
                "hum = %(hum)s, NH3= %(NH3)s, H2S= %(H2S)s, HF= %(HF)s, NO2= %(NO2)s, "
                "CL2= %(CL2)s, O3= %(O3)s, CO= %(CO)s, SO2= %(SO2)s, "
                " fan_in = %(fan_in)s, fan_out = %(fan_out)s  "
                "WHERE list_time = %(list_time)s LIMIT 1")
                data_list = {'list_time' : self.l_time,
                            'O2'        : self.l_O2     ,
                            'CO2'       : self.l_CO2    ,
                            'dust'      : self.l_dust   ,
                            'temp'      : self.l_temp   ,
                            'hum'       : self.l_hum    ,
                            'NH3'       : self.l_NH3    ,
                            'H2S'       : self.l_H2S    ,
                            'HF'        : self.l_HF     ,
                            'NO2'       : self.l_NO2    ,
                            'CL2'       : self.l_CL2    ,
                            'O3'        : self.l_O3     ,
                            'CO'        : self.l_CO     ,
                            'SO2'       : self.l_SO2    ,
                            'fan_in'    : self.l_fan_in ,
                            'fan_out'   : self.l_fan_out   }
                cursor.execute(add_list, data_list)
                
            else :  # new min data : insert
                self.l_time   = self.c_time
                self.l_O2     = self.c_O2     
                self.l_CO2    = self.c_CO2    
                self.l_dust   = self.c_dust   
                self.l_temp   = self.c_temp   
                self.l_hum    = self.c_hum    
                self.l_fan_in = self.c_fan_in 
                self.l_fan_out= self.c_fan_out
                #insert DB air_log
                add_list  = ("INSERT INTO air_log "
                "( list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2, fan_in, fan_out)"
                "VALUES (%(list_time)s, %(O2)s, %(CO2)s, %(dust)s, %(temp)s, %(hum)s, "
                "%(NH3)s, %(H2S)s, %(HF)s, %(NO2)s, %(CL2)s, %(O3)s, %(CO)s, %(SO2)s, "
                "%(fan_in)s, %(fan_out)s )")
                data_list = {'list_time' : self.l_time,
                            'O2'        : self.l_O2     ,
                            'CO2'       : self.l_CO2    ,
                            'dust'      : self.l_dust   ,
                            'temp'      : self.l_temp   ,
                            'hum'       : self.l_hum    ,
                            'NH3'       : self.l_NH3    ,
                            'H2S'       : self.l_H2S    ,
                            'HF'        : self.l_HF     ,
                            'NO2'       : self.l_NO2    ,
                            'CL2'       : self.l_CL2    ,
                            'O3'        : self.l_O3     ,
                            'CO'        : self.l_CO     ,
                            'SO2'       : self.l_SO2    ,
                            'fan_in'    : self.l_fan_in ,
                            'fan_out'   : self.l_fan_out   }
                cursor.execute(add_list, data_list)
            # Make sure data is committed to the database
            cnx.commit()
            cursor.close()
            cnx.close()

print ("sleep 1s")
time.sleep(1)
air = airclean()
while (1):
    air.db_makelog()
    if air.RUNMODE == 1 :
        print ("sleep 5s")
        time.sleep(5)
    else : 
        print ("sleep 40s")
        time.sleep(40)
        #print ("sleep 300s")
        #time.sleep(300)  
