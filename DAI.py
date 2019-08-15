import time, random, requests, threading, json, os
import DAN
import atexit

from flask import Flask, render_template, request, jsonify, url_for, redirect

def Auto_pull ():
    global odf_list, odf_data, data
    while True:
        time.sleep(3)
        if DAN.state == 'RESUME' and data['Manual_mode'] == 0:
            for odf in odf_list:
                d = DAN.pull(odf)
                if d != None:
                    odf_data[odf] = d[0]
                else:
                    odf_data[odf] = 'GG'
            flag_h = flag_t = False
            flag_error = True
            if odf_data['Humidity1-O'] != 'GG':
                flag_error = False
                flag_h = data['min_Humidity'] < odf_data['Humidity1-O'] or odf_data['Humidity1-O'] > data['max_Humidity']
            if odf_data['Temperature1-O'] != 'GG':
                flag_error = False
                flag_t = data['min_Temperature'] < odf_data['Temperature1-O'] or odf_data['Temperature1-O'] > data['max_Temperature']
            
            if not flag_error:
                print(data['Manual_mode'])
                if flag_h or flag_t:
                    Switch_control(1, 'control')
                else:
                    Switch_control(0, 'control')

IOT_ServerURL = 'http://140.113.111.72:9999' #with SSL connection
Reg_addr = None #if None, Reg_addr = MAC address

WEB_HOST = '0.0.0.0'
WEB_PORT = 80

config_name = 'config.json'
idf_list = ['Switch1']
odf_list = ['Humidity1-O', 'Temperature1-O']
odf_data = {}



data = {
    'switch':0,
    'start_hour' : 12,
    'start_min' : 13,
    'end_hour' : 21,
    'end_min' : 41,
    'min_Temperature':50,
    'max_Temperature':13,
    'min_Humidity':28,
    'max_Humidity':32,
    'Manual_mode':0
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
    global odf_data
    if DAN.state == 'SUSPEND':
        return redirect(url_for('index'))
    return json.dumps(odf_data)

@app.route('/con_check', methods=['GET'])
def get_con():
    return json.dumps(DAN.state == 'RESUME')

@app.route('/update', methods=['POST', 'GET'])
def update():
    global data
    if request.method == 'POST':
        datas = request.form.to_dict()
        for d in datas:
            data[d] = int(datas[d])
        save_config(config_name)
        return json.dumps(data)
    else:
        datas = request.args.to_dict()
        print(datas)
        switch = datas.get('switch', 'None')
        maum = datas.get('Manual_mode', 'None')
        if switch != 'None':
            if int(switch) != data['switch']:
                data['switch'] = int(switch)
                print(switch)
                Switch_control(switch, 'not_auto')
                save_config(config_name)
                return json.dumps(data)
        else:
            if int(maum) != data['Manual_mode']:
                data['Manual_mode'] = int(maum)
                save_config(config_name)
                return json.dumps(data)
        
        


def killport(port):
    command=f'lsof -nti:{port} | xargs kill -9'
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
    DAN.push('Switch1', flag)

def time_control():
    global data
    while True:
        if data['Manual_mode'] == 0:
            now = time.localtime()  # 当前时间的纪元值
            fmt = "%H %M"
            now = time.strftime(fmt, now)  # 将纪元值转化为包含时、分的字符串
            now_hour, now_min = now.split(' ') #以空格切割，将时、分放入名为now的列表中
            now_hour = int(now_hour)
            now_min = int(now_min)
            if now_hour == data['start_hour'] and now_min == data['start_min']:
                Switch_control(1, 'timer')
            elif now_hour == data['end_hour'] and now_min == data['end_min']:
                Switch_control(0, 'timer')
        time.sleep(5)
        print(now_hour, now_min)

if '__main__' == __name__:
    #killport(WEB_PORT)

    DAN.profile['dm_name'] = 'SwitchAIO'
    DAN.profile['d_name'] = 'TEST_SwitchAIO'
    DAN.profile['df_list'] = idf_list + odf_list

    open_config(config_name)
    #DAN.profile['d_name']= 'Assign a Device Name' 

    DAN.device_registration_with_retry(IOT_ServerURL, Reg_addr)

    t_auto_pull = threading.Thread(target=Auto_pull)
    t_auto_pull.start()

    t_time_control = threading.Thread(target=time_control)
    t_time_control.start()

    atexit.register(on_exit)

    app.run(
        host=WEB_HOST,
        port=WEB_PORT,
        threaded = True,
        debug=True
    )