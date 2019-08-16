#todo 
#溫溼度 濕度只要低於多少啟動 溫度是高於多少啟動
#時間到了 判斷濕度有沒有低於控制值
#todo 
#溫溼度 濕度只要低於多少啟動 溫度是高於多少啟動
#時間到了 判斷濕度有沒有低於控制值

import time, random, requests, threading, json, os, datetime
import DAN
import atexit

from flask import Flask, render_template, request, jsonify, url_for, redirect, abort

def Auto_pull():
    global odf_list, odf_data, data
    while True:
        time.sleep(5)
        if DAN.state == 'RESUME':
            for odf in odf_list:
                d = DAN.pull(odf)
                if d != None:
                    odf_data[odf] = d[0]
                else:
                    odf_data[odf] = 'GG'

IOT_ServerURL = 'http://140.113.111.72:9999' #with SSL connection
Reg_addr = None #if None, Reg_addr = MAC address

WEB_HOST = '127.0.0.1'
WEB_PORT = 80

config_name = 'config.json'
idf_list = ['Switch1']
odf_list = ['Humidity1-O', 'Temperature1-O']
odf_data = {'Humidity1-O':'GG', 'Temperature1-O':'GG'}




data = {
    "Manual_mode":0,
    "end_hour":15,
    "end_min":32,
    "max_Temperature":9,
    "min_Humidity":23,
    "start_hour":16,
    "start_min":27,
    "switch":0
}


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    global data
    return render_template('index.html', profile=DAN.profile
                                       , state=DAN.state=='SUSPEND'
                                       , data=data
                                       , IOT_ServerURL=IOT_ServerURL)

@app.route('/pull', methods=['GET'])
def get_pull():
    global odf_data, data
    if DAN.state == 'SUSPEND':
        abort(404)
    return json.dumps(dict( **odf_data, **data))

@app.route('/con_check', methods=['GET'])
def get_con():
    return json.dumps(DAN.state == 'RESUME')

@app.route('/update', methods=['POST'])
def update():
    global data
    datas = request.form.to_dict()
    print(datas)
    for d in datas:
        data[d] = int(datas[d])
    save_config(config_name)
    return json.dumps(data)
        
def killport(port):
    command= f'lsof -nti:{port} | xargs kill -9'
    os.system(command)

def on_exit():
    DAN.deregister()
    killport(WEB_PORT)
    save_config(config_name)
    

def open_config(filename):
    global data
    if os.path.isfile(filename):
        with open(filename, 'r') as f:
            if f != None:
                data = json.load(f)

def save_config(filename):
    global data
    with open(filename, 'w') as f:
        t = json.dumps(data, sort_keys=True, indent=4, separators=(',', ':'))
        f.write(t)

def Switch_control(flag, con):
    global data
    print(con)
    if flag == '1' or flag == True or flag == 'true':
        flag = 1
    else:
        flag = 0
    data['switch'] = flag


def check_time():
    global data
    now = datetime.datetime.now()
    sh = data['start_hour']
    sm = data['start_min']
    eh = data['end_hour']
    em = data['end_min']
    if datetime.time(sh,sm) <= now.time() <= datetime.time(eh,em):
        return True
    else:
        return False
        
def check_control():
    global data, odf_data
    if odf_data['Humidity1-O'] != 'GG':
        return data['min_Humidity'] > odf_data['Humidity1-O']
    else:
        return True



def auto_push_switch():
    global data
    while True:
        if data['Manual_mode'] == 0:
            if check_time() and check_control():
                Switch_control(1, 'control')
            else:
                Switch_control(0, 'control')
        DAN.push('Switch1', data['switch'])
        time.sleep(5)
        


#killport(WEB_PORT)

DAN.profile['dm_name'] = 'SwitchAIO'
#DAN.profile['d_name'] = 'TEST_SwitchAIO'
DAN.profile['df_list'] = idf_list + odf_list

open_config(config_name)
#DAN.profile['d_name']= 'Assign a Device Name' 

DAN.device_registration_with_retry(IOT_ServerURL, Reg_addr)

t_auto_pull = threading.Thread(target=Auto_pull)
t_auto_pull.start()

t_time_control = threading.Thread(target=auto_push_switch)
t_time_control.start()

atexit.register(on_exit)

app.run(
    host=WEB_HOST,
    port=WEB_PORT,
    threaded = True,
    debug=False
)