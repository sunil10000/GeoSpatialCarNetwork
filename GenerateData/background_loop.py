import os, psycopg2
import config
from time import sleep
import csv, random
import threading
from datetime import datetime, timezone

petrol_requests = []

def connect():
    conn = psycopg2.connect(
        database=config.db,
        user=config.user,
        password=config.pswd,
        host=config.host,
        port=config.port)
    return conn




def car_loop(conn, cur):
    while(True):
        sleep(2) 
        upd = open('car_update.sql', 'r').read()
        cur.execute(upd)
        conn.commit()
        

def trafficsignal_loop(conn, cur):
    while(True):
        sleep(60)
        cur.execute("update trafficsignal set signal = case\
            when signal = 'R' then 'Y'\
            when signal = 'Y' then 'G'\
            when signal = 'G' then 'R'\
            end")
        conn.commit()

def petrolpump_loop(conn, cur):
    while(True):
        cur.execute("update petrolpump set fuel_amount = fuel_amount + 400 where fuel_amount < 200;")
        sleep(5*60)

def background_loop(conn, cur):
    c_th  = threading.Thread(name='car', target=car_loop, args=(conn, cur))
    ts_th = threading.Thread(name='ts', target=trafficsignal_loop, args=(conn, cur))
    pp_th = threading.Thread(name='pp', target=petrolpump_loop, args=(conn, cur))

    c_th.start()
    ts_th.start()
    pp_th.start()
    pass

if __name__ == '__main__':
    conn = connect()
    cur  = conn.cursor()

    background_loop(conn, cur)

