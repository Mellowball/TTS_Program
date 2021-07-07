from __future__ import print_function
import RPi.GPIO as IoPort
import serial
import time
import spidev
import webiopi
import mysql.connector
import os
import logging
import logging.handlers
from datetime import date, timedelta
import datetime
from mysql.connector import errorcode
from collections import namedtuple
from math import pi,sqrt,sin,cos,atan2
webiopi.setDebug()
#DEFINE
P_DBUSER = 'airclean'
P_DBPW = 'raspberry'
P_DBHOST = 'localhost'
P_DBDB = 'db_air'
c_time   =0.00
c_time2  =0.00
c_O2     =0.00
c_CO2    =0.00
c_dust   =0.00
c_temp   =0.00
c_hum    =0.00
c_fan_in     =0
c_fan_out    =0
c_req_con    =0
c_req_fan_in =0
c_req_fan_out=0


@webiopi.macro
def cl_dbcurrent():
    try:
        #logger.info("cl_dbcurrent")
        webiopi.debug("cl_dbcurrent")
        print("cl_dbcurrent")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #read DB air_state 
        add_list = ("SELECT list_no, list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2 , "
        "fan_in, fan_out, req_con, req_fan_in, req_fan_out "
        "FROM air_state WHERE list_no = '1'")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        c_time   =datetime.datetime.strptime(str(temp_return[0][1]), '%Y-%m-%d %H:%M:%S')
        c_time   =c_time.strftime('%Y-%m-%d %H:%M')
        c_O2         =temp_return[0][2]
        c_CO2        =temp_return[0][3]
        c_dust       =temp_return[0][4]
        c_temp       =temp_return[0][5]
        c_hum        =temp_return[0][6]
        c_NH3        =temp_return[0][7]
        c_H2S        =temp_return[0][8]
        c_HF         =temp_return[0][9]
        c_NO2        =temp_return[0][10]
        c_CL2        =temp_return[0][11]
        c_O3         =temp_return[0][12]
        c_CO         =temp_return[0][13]
        c_SO2        =temp_return[0][14]
        c_fan_in     =temp_return[0][15]
        c_fan_out    =temp_return[0][16]
        c_req_con    =temp_return[0][17]
        c_req_fan_in =temp_return[0][18]
        c_req_fan_out=temp_return[0][19]
        rtdata = "dbcurrent;"
        for i in range(1, len(temp_return[0])):
            rtdata = rtdata+str(temp_return[0][i])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
################################################################################################

@webiopi.macro
def cl_dbday(s_year,s_mon,s_day):
    try:
        #logger.info("cl_dbday")
        webiopi.debug("cl_dbday"+s_year+s_mon+s_day)
        print("cl_dbday")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #count air_log 
        #SELECT count(*) FROM air_log WHERE list_time >= '2019-10-30' AND list_time < DATE_ADD('2019-10-30', INTERVAL 1 DAY);
        add_list = ("SELECT count(*) FROM air_log"
                    " WHERE list_time >= %(sqlday)s AND list_time < DATE_ADD( %(sqlday)s , INTERVAL 1 DAY)"
                    " ORDER BY list_time DESC LIMIT 3600")
        data_list = {
            'sqlday': s_year+"-"+s_mon+"-"+s_day,
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = "count;"+str(temp_return[0][0])+";";
        #SELECT * FROM data WHERE datetime>='2009-10-20' AND datetime<'2009-10-21'
        add_list = ("SELECT list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2 , "
                    " fan_in, fan_out FROM air_log"
                    " WHERE list_time >= %(sqlday)s AND list_time < DATE_ADD( %(sqlday)s , INTERVAL 1 DAY)"
                    " ORDER BY list_time DESC LIMIT 3600")
        data_list = {
            'sqlday': s_year+"-"+s_mon+"-"+s_day,
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = rtdata+"dbday;"
        for i in range(0, len(temp_return)):
            for j in range(0,len(temp_return[i])):
                rtdata = rtdata+str(temp_return[i][j])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
@webiopi.macro
def cl_dbhour(s_year,s_mon,s_day,s_hour):
    try:
        #logger.info("cl_dbhour")
        webiopi.debug("cl_dbhour"+s_year+s_mon+s_day+s_hour)
        print("cl_dbhour")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #count list 
        #SELECT count(*) FROM air_log  WHERE list_time >= '2019-10-31 01' AND list_time < DATE_ADD('2019-10-31 01', INTERVAL 1 HOUR)  ;
        add_list = ("SELECT count(*) FROM air_log"
                    " WHERE list_time >= %(sqlday)s AND list_time < DATE_ADD( %(sqlday)s , INTERVAL 1 HOUR)"
                    " ORDER BY list_time DESC LIMIT 60")
        data_list = {
            'sqlday': s_year+"-"+s_mon+"-"+s_day+" "+s_hour ,
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = "count;"+str(temp_return[0][0])+";";
        #SELECT * FROM data WHERE datetime>='2009-10-20' AND datetime<'2009-10-21'
        add_list = ("SELECT list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2 , "
                    " fan_in, fan_out FROM air_log"
                    " WHERE list_time >= %(sqlday)s AND list_time < DATE_ADD( %(sqlday)s , INTERVAL 1 HOUR)"
                    " ORDER BY list_time DESC LIMIT 60")
        data_list = {
            'sqlday': s_year+"-"+s_mon+"-"+s_day+" "+s_hour ,
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = rtdata+"dbhour;"
        for i in range(0, len(temp_return)):
            for j in range(0,len(temp_return[i])):
                rtdata = rtdata+str(temp_return[i][j])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
        
@webiopi.macro
def cl_dbsetalarm(al_O2v,al_CO2v,al_dustv,al_tempv,al_humv,al_env,al_NH3v ,al_H2Sv ,al_HFv ,al_NO2v ,al_CL2v ,al_O3v ,al_COv ,al_SO2v ,al_daydbv):
    try:
        #logger.info("cl_dbsetalarm")
        webiopi.debug("cl_dbsetalarm"+al_O2v+al_CO2v+al_dustv+al_tempv+al_humv)
        print("cl_dbsetalarm")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #update
        add_list = ("UPDATE air_alarm SET O2 = %(O2)s, CO2 = %(CO2)s, "
        "dust = %(dust)s, temp = %(temp)s, hum = %(hum)s, en_alarm = %(en_alarm)s, "
        "NH3 = %(NH3)s, H2S = %(H2S)s, HF = %(HF)s, NO2 = %(NO2)s, "
        "CL2 = %(CL2)s, O3 = %(O3)s, CO = %(CO)s, SO2 = %(SO2)s, "
        "daydb = %(daydb)s, req_con = '1' WHERE list_no = '1' ")
        data_list = {
            'O2'      :str(al_O2v   ),
            'CO2'     :str(al_CO2v  ),
            'dust'    :str(al_dustv ),
            'temp'    :str(al_tempv ),
            'hum'     :str(al_humv  ),
            'en_alarm':str(al_env   ),
            'NH3'     :str(al_NH3v  ),
            'H2S'     :str(al_H2Sv  ),
            'HF'      :str(al_HFv   ),
            'NO2'     :str(al_NO2v  ),
            'CL2'     :str(al_CL2v  ),
            'O3'      :str(al_O3v   ),
            'CO'      :str(al_COv   ),
            'SO2'     :str(al_SO2v  ),
            'daydb'   :str(al_daydbv),
        }
        cursor.execute(add_list, data_list)
        cnx.commit()
        #current data return
        add_list = ("SELECT list_no, list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2 , "
        "fan_in, fan_out, req_con, req_fan_in, req_fan_out "
        "FROM air_state WHERE list_no = '1'")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = "dbcurrent;"
        for i in range(1, len(temp_return[0])):
            rtdata = rtdata+str(temp_return[0][i])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
        
@webiopi.macro
def cl_dbrdalarm():
    try:
        #logger.info("cl_dbrdalarm")
        webiopi.debug("cl_dbrdalarm")
        print("cl_dbrdalarm")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #SELECT * FROM data WHERE datetime>='2009-10-20' AND datetime<'2009-10-21'
        add_list = ("SELECT list_time, O2, CO2, dust, temp, hum, en_alarm, "
                    " NH3, H2S, HF, NO2, CL2, O3, CO, SO2, daydb  FROM air_alarm "
                    " WHERE list_no = '1' LIMIT 1")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = "dbrdalarm;"
        for i in range(1, len(temp_return[0])):
            rtdata = rtdata+str(temp_return[0][i])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata

@webiopi.macro
def cl_faninchange(fan_in):
    try:
        #logger.info("cl_faninchange")
        webiopi.debug("cl_faninchange"+fan_in)
        print("cl_faninchange")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #update
        add_list = ("UPDATE air_state SET req_con = '1', req_fan_in = %(req_fan_in)s WHERE list_no = '1' ")
        data_list = {
            'req_fan_in': int(fan_in),
        }
        cursor.execute(add_list, data_list)
        cnx.commit()
        #current data return
        add_list = ("SELECT list_no, list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2 , "
        "fan_in, fan_out, req_con, req_fan_in, req_fan_out "
        "FROM air_state WHERE list_no = '1'")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = "dbcurrent;"
        for i in range(1, len(temp_return[0])):
            rtdata = rtdata+str(temp_return[0][i])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
        
@webiopi.macro
def cl_fanoutchange(fan_out):
    try:
        #logger.info("cl_fanoutchange")
        webiopi.debug("cl_fanoutchange"+fan_out)
        print("cl_fanoutchange")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        cursor = cnx.cursor()
        #update
        add_list = ("UPDATE air_state SET req_con = '1', req_fan_out = %(req_fan_out)s WHERE list_no = '1' ")
        data_list = {
            'req_fan_out': int(fan_out),
        }
        cursor.execute(add_list, data_list)
        cnx.commit()
        #current data return
        add_list = ("SELECT list_no, list_time, O2, CO2, dust, temp, hum, NH3, H2S, HF, NO2, CL2, O3, CO, SO2 , "
        "fan_in, fan_out, req_con, req_fan_in, req_fan_out "
        "FROM air_state WHERE list_no = '1'")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        rtdata = "dbcurrent;"
        for i in range(1, len(temp_return[0])):
            rtdata = rtdata+str(temp_return[0][i])+";"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
@webiopi.macro
def cl_dbclearday():
    try:
        #logger.info("cl_dbclearday")
        webiopi.debug("cl_dbclearday")
        print("cl_dbclearday")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        rtdata = ""
        cursor = cnx.cursor()
        #read daydb
        add_list = ("SELECT daydb FROM air_alarm WHERE list_no = '1'")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        temp_return = cursor.fetchall()
        daydb = temp_return[0][0]
        rtdata += 'daydb:'+str(daydb)
        #delete for day limit
        #SELECT DATE_ADD(NOW(), INTERVAL 1 DAY);
        #DELETE FROM  air_log WHERE DATE_FORMAT(list_time, '%Y%m%d')  <= DATE_FORMAT(DATE_ADD(now(), INTERVAL -30 DAY), '%Y%m%d'); 
        add_list = ("DELETE FROM  air_log WHERE DATE_FORMAT(list_time, '%Y%m%d')  <= DATE_FORMAT(DATE_ADD(now(), INTERVAL -"+str(daydb)+" DAY), '%Y%m%d')")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        rtdata += ", DATE_FORMAT(list_time, '%Y%m%d') <= DATE_ADD(DATE_FORMAT(now(), '%Y%m%d'), INTERVAL -"+str(daydb)+" DAY)"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
    
@webiopi.macro
def cl_dbclearall():
    try:
        #logger.info("cl_dbclearall")
        webiopi.debug("cl_dbclearall")
        print("cl_dbclearall")
        cnx = mysql.connector.connect(user=P_DBUSER, password=P_DBPW, host=P_DBHOST, database=P_DBDB)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #logger.warning("Something is wrong with your user name or password")
            print("Something is wrong with your user name or password")
            rtdata = "0 Something is wrong with your user name or password"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #logger.warning("Database does not exists")
            print("Database does not exists")
            rtdata = "0 Database does not exists"
        else:
            #logger.warning(err)
            print(err)
            rtdata = "0 "+err
        return rtdata    
    else:
        rtdata = ""
        cursor = cnx.cursor()
        #delete for day limit
        #SELECT DATE_ADD(NOW(), INTERVAL 1 DAY);
        add_list = ("DELETE FROM air_log ")
        data_list = {
        }
        cursor.execute(add_list, data_list)
        rtdata += ", sqlday:NOW()"
        # Make sure data is committed to the database
        cnx.commit()
        cursor.close()
        cnx.close()
        webiopi.debug("rtdata:"+rtdata)
        return rtdata
    
@webiopi.macro
def cl_test():
    print("cl_test")