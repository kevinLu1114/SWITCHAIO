import time, random, requests, threading, json, os
import DAN
import atexit


from flask import Flask, render_template, request, jsonify, url_for

'''
#ServerURL = 'http://IP:9999'      #with non-secure connection
IOT_ServerURL = 'http://140.113.111.72:9999' #with SSL connection
Reg_addr = None #if None, Reg_addr = MAC address

DAN.profile['dm_name'] = 'SwitchAIO'
DAN.profile['df_list'] = ['Switch1', 'Humidity1-O', 'Temperature1-O']
#DAN.profile['d_name']= 'Assign a Device Name' 

DAN.device_registration_with_retry(IOT_ServerURL, Reg_addr)
#DAN.deregister()  #if you want to deregister this device, uncomment this line
#exit()            #if you want to deregister this device, uncomment this line
'''

'''
while True:
    try:
        IDF_data = random.uniform(1, 10)
        DAN.push ('Switch1', IDF_data) #Push data to an input device feature "Dummy_Sensor"

        #==================================

        ODF_data = DAN.pull('Humidity1-O')#Pull data from an output device feature "Dummy_Control"
        if ODF_data != None:
            print ('Humidity1-O', ODF_data[0])

        #DF_data = DAN.pull('Temperature1_O')#Pull data from an output device feature "Dummy_Control"
        #if ODF_data != None:
        #    print ('Temperature1_O', ODF_data[0])

    except Exception as e:
        print(e)
        if str(e).find('mac_addr not found:') != -1:
            print('Reg_addr is not found. Try to re-register...')
            DAN.device_registration_with_retry(IOT_ServerURL, Reg_addr)
        else:
            print('Connection failed due to unknow reasons.')
            time.sleep(1)    

    time.sleep(0.2)
'''
def Auto_pull():
    pass

def on_exit():
    DAN.deregister()
    killport(WEB_PORT)


WEB_HOST = '0.0.0.0'
WEB_PORT = 80

odf_data_queue = {}


app = Flask(__name__)


@app.route('/')
def mail_page():
    return render_template('index.html', profile=DAN.profile
                                       , state=DAN.state=='SUSPEND')

@app.route('/pull', methods=['POST', 'GET'])
def get_pull():
    ret = {'Humidity1-O': odf_data_queue['Humidity1-O'].pop(), 'Temperature1-O': odf_data_queue['Temperature1-O'].pop()}
    return json.dumps(ret)

def killport(port):
    command=f'lsof -nti:{port} | xargs kill -9'
    os.system(command)

if '__main__' == __name__:
    global odf_data_queue
    #killport(WEB_PORT)
    IOT_ServerURL = 'http://140.113.111.72:9999' #with SSL connection
    Reg_addr = None #if None, Reg_addr = MAC address

    idf_list = ['Switch1']
    odf_list = ['Humidity1-O', 'Temperature1-O']
    for odf in odf_list:
        odf_data_queue[odf] = ['None']

    DAN.profile['dm_name'] = 'SwitchAIO'
    DAN.profile['d_name'] = 'TEST_SwitchAIO'
    DAN.profile['df_list'] = idf_list.extend(odf_list)

    #atuo pull odf data
    auto_pull = threading.Thread(target = auto_pull)
    auto_pull.start()

    #DAN.profile['d_name']= 'Assign a Device Name' 

    DAN.device_registration_with_retry(IOT_ServerURL, Reg_addr)


    atexit.register(on_exit)

    app.run(
        host=WEB_HOST,
        port=WEB_PORT,
        threaded = True,
        debug=True
    )