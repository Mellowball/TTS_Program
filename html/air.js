var colorArray = {
            0:"#FF0000",//"red"
            1:"#89d0df",
            2:"#3399ff",
            3:"#ffa500",
            4:"#ff7373",
            5:"#efe8d5",
            6:"#eee82c",
            7:"#bce8fa",
            8:"#e2e3fd",
            9:"#fce2fd",
            10:"#bc7774",
            11:"#bc7e09",
            12:"#001293",
            13:"#6f0000",
            14:"#006f00",
            15:"#964bc8",
            16:"#d300f4",
            17:"#c800c8",
            18:"#37595a",
            19:"#06d33b",
            20:"#7f7f7f"
        }
//측정 데이터용 전역변수
var c_time, c_O2, c_CO2, c_dust, c_temp, c_hum, c_fan_in, c_fan_out, c_req_fan, c_req_fanin, c_req_fanout ;
var c_NH3, c_H2S ,c_HF  ,c_NO2 ,c_CL2 ,c_O3  ,c_CO  ,c_SO2;
var l_time, l_O2, l_CO2, l_dust, l_temp, l_hum, l_fan_in, l_fan_out;
var a_O2 ,a_CO2 ,a_dust ,a_temp ,a_hum ;
var a_NH3, a_H2S ,a_HF  ,a_NO2 ,a_CL2 ,a_O3  ,a_CO  ,a_SO2, a_daydb;
var a_O2al ,a_CO2al ,a_dustal ,a_tempal ,a_humal ,a_enal, a_enmp3;
var a_NH3al, a_H2Sal ,a_HFal  ,a_NO2al ,a_CL2al ,a_O3al  ,a_COal  ,a_SO2al, a_daydbal;
var rfdata = new Array();
rfdata[0] = new Object();
var rfdata_O2      = new Array();
var rfdata_CO2     = new Array();
var rfdata_dust    = new Array();
var rfdata_temp    = new Array();
var rfdata_hum     = new Array();
var rfdata_NH3     = new Array();
var rfdata_H2S     = new Array();
var rfdata_HF      = new Array();
var rfdata_NO2     = new Array();
var rfdata_CL2     = new Array();
var rfdata_O3      = new Array();
var rfdata_CO      = new Array();
var rfdata_SO2     = new Array();
var rfdata_fan_in  = new Array();
var rfdata_fan_out = new Array();
var rf_count = 0;
var viewmode;
var viewlevel = 3;
var reloadmode;
var FANMAX = 6;
var FANMIN = 0;
a_O2al   = 19;
a_CO2al  = 1000;
a_dustal = 100;
a_tempal = 30;
a_humal  = 100;
a_enal   = 0;
a_enmp3  = 0;
a_NH3al  = 100;
a_H2Sal  = 100;
a_HFal   = 100;
a_NO2al  = 100;
a_CL2al  = 100;
a_O3al   = 100;
a_COal   = 100;
a_SO2al  = 100;
a_daydbal= 30;
//google chart
google.charts.load('current', {'packages':['corechart']});
var rowdata= new Array();
function newstart(){
    //today
    document.getElementById('userdate').value = new Date().toISOString().substring(0, 10);
    //DB delete
    dbclearday();
    //timecall_currentdb read
    timecall_currentdb();
}
function timecall_currentdb(){
    //alarm read
    alarmread();
    //current db read
    currentdb();
}
function currentdb(){
    //디비 리드
    args = [];
    webiopi().callMacro("cl_dbcurrent", args, macroCallback);
    //reload on
    //reloadmode = setTimeout ("window.location.reload()",3000);
    reloadmode = setTimeout ("timecall_currentdb()",3000);
}
function hourdb(){
    //reload off
    clearTimeout(reloadmode);
    //read day
    var tempyear = (document.getElementById("userdate").value).split("-");
    var s_year = tempyear[0]; 
    var s_mon = tempyear[1];
    var s_day = tempyear[2];
    var s_hour = document.getElementById("userhour").value;
    //디비 리드 cl_dbhour(s_rf_id,s_year,s_mon,s_day,s_hour):
    args = [s_year,s_mon,s_day,s_hour];
    webiopi().callMacro("cl_dbhour", args, macroCallback);
}
function daydb(){
    //reload off
    clearTimeout(reloadmode);
    //read day
    var tempyear = (document.getElementById("userdate").value).split("-");
    var s_year = tempyear[0]; 
    var s_mon = tempyear[1];
    var s_day = tempyear[2];
    //디비 리드 cl_dbday(s_rf_id,s_year,s_mon,s_day):
    args = [s_year,s_mon,s_day];
    webiopi().callMacro("cl_dbday", args, macroCallback);
    //alert(args);
}

function setalarm(){
    //reload off
    clearTimeout(reloadmode);
    var tempHtml = '';
    var tempHtml2= '';
    //tempHtml += '<tr><th>     </th><th>  설정  </th><th>  O₂(%)  </th><th>  CO₂(ppm)  </th><th>  먼지(㎍/m³)  </th><th>  온도(℃) </th><th>  습도(%)  </th></tr>';
    //tempHtml += '<tr><td><input type="button" value="알람 저장" onClick="alarmdb()"></td><td>';
    //tempHtml += '<input type="checkbox" id="al_en" value="1" ></td><td>';
    //tempHtml += '<input type="number" id="al_O2" min="15" max="30" step="1" value="20"></td><td>';
    //tempHtml += '<input type="number" id="al_CO2"  min="30" max="300" step="10" value="50"></td><td>';
    //tempHtml += '<input type="number" id="al_dust" min="0" max="200" step="5" value="30"></td><td>';
    //tempHtml += '<input type="number" id="al_temp" min="0" max="100" step="1" value="20"></td><td>';
    //tempHtml += '<input type="number" id="al_hum"  min="0" max="100" step="1" value="60"></td></tr>';
    document.getElementById('time_view').innerHTML = "";
    document.getElementById('map').innerHTML = "";
    document.getElementById('ListThead').innerHTML = tempHtml2;
    document.getElementById('RFListTbody').innerHTML = tempHtml;
    args = [];
    webiopi().callMacro("cl_dbrdalarm", args, setalarm2);
}

function alarmdb(){
    var al_O2v   = document.getElementById("al_O2").value;
    var al_CO2v  = document.getElementById("al_CO2").value;
    var al_dustv = document.getElementById("al_dust").value;
    var al_tempv = document.getElementById("al_temp").value;
    var al_humv  = document.getElementById("al_hum").value;
    var al_NH3v  = document.getElementById("al_NH3").value;
    var al_H2Sv  = document.getElementById("al_H2S").value;
    var al_HFv   = document.getElementById("al_HF").value;
    var al_NO2v  = document.getElementById("al_NO2").value;
    var al_CL2v  = document.getElementById("al_CL2").value;
    var al_O3v   = document.getElementById("al_O3").value;
    var al_COv   = document.getElementById("al_CO").value;
    var al_SO2v  = document.getElementById("al_SO2").value;
    var al_daydbv= document.getElementById("al_daydb").value;
    var al_env  = 0;
    var tempen = document.getElementById("al_en")
    if (tempen.checked == true){
        al_env = 1;
    }else{
        al_env = 0;
    }
    args = [al_O2v,al_CO2v,al_dustv,al_tempv,al_humv,al_env,al_NH3v ,al_H2Sv ,al_HFv ,al_NO2v ,al_CL2v ,al_O3v ,al_COv ,al_SO2v ,al_daydbv];
    webiopi().callMacro("cl_dbsetalarm", args, macroCallback);
    a_O2al   = al_O2v   ;
    a_CO2al  = al_CO2v  ;
    a_dustal = al_dustv ;
    a_tempal = al_tempv ;
    a_humal  = al_humv  ;
    a_NH3al  = al_NH3v  ;
    a_H2Sal  = al_H2Sv  ;
    a_HFal   = al_HFv   ;
    a_NO2al  = al_NO2v  ;
    a_CL2al  = al_CL2v  ;
    a_O3al   = al_O3v   ;
    a_COal   = al_COv   ;
    a_SO2al  = al_SO2v  ;
    a_daydbal= al_daydbv;
    //reload on
    reloadmode = setTimeout ("timecall_currentdb()",3000);
}
//콜백함수 - 라즈베리파이로부터 리턴값을 돌려 받아서 처리
function macroCallbackpass(macro, args, data){
}
function macroCallback(macro, args, data){
    //결과 값을 출력
    var tempHtml = "";
    var tempHtml2= "";
    var result = data.split(';');
    rf_count = result[1];
    //for num
    for (var i = 0; i < rf_count; i++){
        rfdata[i] = new Object();
        rfdata[i]['list_time'] = result[i*16+3];
        rfdata[i]['O2']        = result[i*16+4];
        rfdata[i]['CO2']       = result[i*16+5];
        rfdata[i]['dust']      = result[i*16+6];
        rfdata[i]['temp']      = result[i*16+7];
        rfdata[i]['hum']       = result[i*16+8];
        rfdata[i]['NH3']       = result[i*16+9];
        rfdata[i]['H2S']       = result[i*16+10];
        rfdata[i]['HF']        = result[i*16+11];
        rfdata[i]['NO2']       = result[i*16+12];
        rfdata[i]['CL2']       = result[i*16+13];
        rfdata[i]['O3']        = result[i*16+14];
        rfdata[i]['CO']        = result[i*16+15];
        rfdata[i]['SO2']       = result[i*16+16];
        rfdata[i]['fan_in']    = result[i*16+17];
        rfdata[i]['fan_out']   = result[i*16+18];
    }
    var temptime = new Date();
    temptime.setTime(Date.parse(result[3]));
    var timestring = temptime.toTimeString();
    //if(macro=='cl_dbhour'){
    //    //for num
    //    for (var i = 0; i < rf_count; i++){
    //        tempHtml = tempHtml+ "<tr><td>" + (i+1) + '</td><td>' + rfdata[i]['list_time'] + '</td><td>' + rfdata[i]['O2'] + '</td><td>' +rfdata[i]['CO2'] + '</td><td>' +rfdata[i]['dust'] + '</td><td>' +rfdata[i]['temp'] + '</td><td>' +rfdata[i]['hum']+'</td><td>'+rfdata[i]['fan_in']+'</td><td>'+rfdata[i]['fan_out']+"</td></tr>";
    //    }
    //    //google chart
    //    drawVisualization();
    //    document.getElementById('time_view').innerHTML = rfdata[0]['list_time'];
    //    document.getElementById('ListThead').innerHTML = tempHtml2;
    //    document.getElementById('RFListTbody').innerHTML = tempHtml;
    //}else 
    if(macro=='cl_dbday' || macro=='cl_dbhour'){
        
        //html tr make
        tempHtml = '<table>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_O2"     ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_NH3"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_H2S"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_NO2"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_O3"     ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_SO2"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_HF"     ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_CL2"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_CO"     ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_CO2"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_dust"   ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_temp"   ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_hum"    ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_fan_in" ></div></td> </tr>';
        tempHtml +='<tr> <td><div style="width:90%; " id="map_fan_out"></div></td></tr>';
        tempHtml +='</table>';
        document.getElementById('map').innerHTML = tempHtml;
        if (macro=='cl_dbday'){
            tempHtml2 = '이전 일자 : '+rfdata[0]['list_time'];
        }else {
            tempHtml2 = '이전 시간 : '+rfdata[0]['list_time'];
        }
        document.getElementById('time_view').innerHTML = tempHtml2;
        document.getElementById('ListThead').innerHTML = "";
        document.getElementById('RFListTbody').innerHTML = tempHtml;
		if (rf_count == 0){
			tempHtml2 ='저장된 데이터가 없습니다';
			document.getElementById('time_view').innerHTML = tempHtml2;
		}else{
			//google chart data make
			//for num
			rfdata_O2      = new Array();
			rfdata_CO2     = new Array();
			rfdata_dust    = new Array();
			rfdata_temp    = new Array();
			rfdata_hum     = new Array();
			rfdata_NH3     = new Array();
			rfdata_H2S     = new Array();
			rfdata_HF      = new Array();
			rfdata_NO2     = new Array();
			rfdata_CL2     = new Array();
			rfdata_O3      = new Array();
			rfdata_CO      = new Array();
			rfdata_SO2     = new Array();
			rfdata_fan_in  = new Array();
			rfdata_fan_out = new Array();
			rfdata_O2[0]     = new Object();
			rfdata_CO2[0]    = new Object();
			rfdata_dust[0]   = new Object();
			rfdata_temp[0]   = new Object();
			rfdata_hum[0]    = new Object();
			rfdata_NH3[0]    = new Object();
			rfdata_H2S[0]    = new Object();
			rfdata_HF[0]     = new Object();
			rfdata_NO2[0]    = new Object();
			rfdata_CL2[0]    = new Object();
			rfdata_O3[0]     = new Object();
			rfdata_CO[0]     = new Object();
			rfdata_SO2[0]    = new Object();
			rfdata_fan_in[0] = new Object();
			rfdata_fan_out[0]= new Object();
			rfdata_O2[0]     = ['list_time','O2'     ,'Alarm'];
			rfdata_CO2[0]    = ['list_time','CO2'    ,'Alarm'];
			rfdata_dust[0]   = ['list_time','dust'   ,'Alarm'];
			rfdata_temp[0]   = ['list_time','temp'   ,'Alarm'];
			rfdata_hum[0]    = ['list_time','hum'    ,'Alarm'];
			rfdata_NH3[0]    = ['list_time','NH3'    ,'Alarm'];
			rfdata_H2S[0]    = ['list_time','H2S'    ,'Alarm'];
			rfdata_HF[0]     = ['list_time','HF'     ,'Alarm'];
			rfdata_NO2[0]    = ['list_time','NO2'    ,'Alarm'];
			rfdata_CL2[0]    = ['list_time','CL2'    ,'Alarm'];
			rfdata_O3[0]     = ['list_time','O3'     ,'Alarm'];
			rfdata_CO[0]     = ['list_time','CO'     ,'Alarm'];
			rfdata_SO2[0]    = ['list_time','SO2'    ,'Alarm'];
			rfdata_fan_in[0] = ['list_time','fan_in' ];
			rfdata_fan_out[0]= ['list_time','fan_out'];
			
			for (var i = 0; i < rf_count; i++){
				rfdata_O2[i+1]= new Object();
				rfdata_CO2[i+1]= new Object();
				rfdata_dust[i+1]= new Object();
				rfdata_temp[i+1]= new Object();
				rfdata_hum[i+1]= new Object();
				rfdata_NH3[i+1]= new Object();
				rfdata_H2S[i+1]= new Object();
				rfdata_HF[i+1]= new Object();
				rfdata_NO2[i+1]= new Object();
				rfdata_CL2[i+1]= new Object();
				rfdata_O3[i+1]= new Object();
				rfdata_CO[i+1]= new Object();
				rfdata_SO2[i+1]= new Object();
				rfdata_fan_in[i+1]= new Object();
				rfdata_fan_out[i+1]= new Object();
				//rowdata[i+1] =[temptime.toTimeString().substr(0,9),parseInt(rfdata[i]['O2']),parseInt(rfdata[i]['CO2']),parseInt(rfdata[i]['dust']),parseInt(rfdata[i]['temp']),parseInt(rfdata[i]['hum']),parseInt(rfdata[i]['fan_in']),parseInt(rfdata[i]['fan_out'])];
				temptime.setTime(Date.parse(result[i*16+3]));
				timestring = temptime.toTimeString();
				rfdata_O2[i+1]     = [timestring.substr(0,9),parseFloat(result[i*16+4]) ,parseFloat(a_O2al  )]; 
				rfdata_CO2[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+5]) ,parseFloat(a_CO2al )]; 
				rfdata_dust[i+1]   = [timestring.substr(0,9),parseFloat(result[i*16+6]) ,parseFloat(a_dustal)]; 
				rfdata_temp[i+1]   = [timestring.substr(0,9),parseFloat(result[i*16+7]) ,parseFloat(a_tempal)]; 
				rfdata_hum[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+8]) ,parseFloat(a_humal )]; 
				rfdata_NH3[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+9]) ,parseFloat(a_NH3al )]; 
				rfdata_H2S[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+10]),parseFloat(a_H2Sal )]; 
				rfdata_HF[i+1]     = [timestring.substr(0,9),parseFloat(result[i*16+11]),parseFloat(a_HFal  )]; 
				rfdata_NO2[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+12]),parseFloat(a_NO2al )]; 
				rfdata_CL2[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+13]),parseFloat(a_CL2al )]; 
				rfdata_O3[i+1]     = [timestring.substr(0,9),parseFloat(result[i*16+14]),parseFloat(a_O3al  )]; 
				rfdata_CO[i+1]     = [timestring.substr(0,9),parseFloat(result[i*16+15]),parseFloat(a_COal  )]; 
				rfdata_SO2[i+1]    = [timestring.substr(0,9),parseFloat(result[i*16+16]),parseFloat(a_SO2al )]; 
				rfdata_fan_in[i+1] = [timestring.substr(0,9),parseFloat(result[i*16+17])];
				rfdata_fan_out[i+1]= [timestring.substr(0,9),parseFloat(result[i*16+18])];
			}
			//drawAreaChart('map_O2'     ,rfdata_O2    ,0,100);
			//drawAreaChart('map_NH3'    ,rfdata_NH3   ,0,100);
			//drawAreaChart('map_H2S'    ,rfdata_H2S   ,0,100);
			//drawAreaChart('map_NO2'    ,rfdata_NO2   ,0,20);
			//drawAreaChart('map_O3'     ,rfdata_O3    ,0,20);
			//drawAreaChart('map_SO2'    ,rfdata_SO2   ,0,20);
			//drawAreaChart('map_HF'     ,rfdata_HF    ,0,10);
			//drawAreaChart('map_CL2'    ,rfdata_CL2   ,0,10);
			//drawAreaChart('map_CO'     ,rfdata_CO    ,0,1000);
			//drawAreaChart('map_CO2'    ,rfdata_CO2   ,0,5000);
			//drawAreaChart('map_dust'   ,rfdata_dust  ,0,1000);
			//drawAreaChart('map_temp'   ,rfdata_temp  ,-40,120);
			//drawAreaChart('map_hum'    ,rfdata_hum   ,0,100);
			//drawAreaChart('map_fan_in' ,rfdata_fan_in,0,10);
			//drawAreaChart('map_fan_out',rfdata_fan_out,0,10);
			//draw AreaChart 
			//alert('timestring'+timestring+'rf_count:'+rf_count);
			var data_O2     = google.visualization.arrayToDataTable(rfdata_O2);
			var data_NH3    = google.visualization.arrayToDataTable(rfdata_NH3);
			var data_H2S    = google.visualization.arrayToDataTable(rfdata_H2S);
			var data_NO2    = google.visualization.arrayToDataTable(rfdata_NO2);
			var data_O3     = google.visualization.arrayToDataTable(rfdata_O3);
			var data_SO2    = google.visualization.arrayToDataTable(rfdata_SO2);
			var data_HF     = google.visualization.arrayToDataTable(rfdata_HF);
			var data_CL2    = google.visualization.arrayToDataTable(rfdata_CL2);
			var data_CO     = google.visualization.arrayToDataTable(rfdata_CO);
			var data_CO2    = google.visualization.arrayToDataTable(rfdata_CO2);
			var data_dust   = google.visualization.arrayToDataTable(rfdata_dust);
			var data_temp   = google.visualization.arrayToDataTable(rfdata_temp);
			var data_hum    = google.visualization.arrayToDataTable(rfdata_hum);
			var data_fan_in = google.visualization.arrayToDataTable(rfdata_fan_in);
			var data_fan_out= google.visualization.arrayToDataTable(rfdata_fan_out);
			var window_wnum = parseInt(window.innerWidth * 0.9);
			var options_O2      = { title:'O2',     'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
			var options_NH3     = { title:'NH3',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
			var options_H2S     = { title:'H2S',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
			var options_NO2     = { title:'NO2',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 20} };
			var options_O3      = { title:'O3',     'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 20} };
			var options_SO2     = { title:'SO2',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 20} };
			var options_HF      = { title:'HF',     'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
			var options_CL2     = { title:'CL2',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
			var options_CO      = { title:'CO',     'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 1000} };
			var options_CO2     = { title:'CO2',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 5000} };
			var options_dust    = { title:'dust',   'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 1000} };
			var options_temp    = { title:'temp',   'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: -10, maxValue : 50} };
			var options_hum     = { title:'hum',    'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
			var options_fan_in  = { title:'fan_in', 'width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
			var options_fan_out = { title:'fan_out','width':window_wnum,'height':150, colors: ['#3F8BFF', '#FF3F3F'], explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
			var chart;
			chart = new google.visualization.AreaChart(document.getElementById('map_O2'     ));
			chart.draw(data_O2, options_O2);
			chart = new google.visualization.AreaChart(document.getElementById('map_NH3'    ));
			chart.draw(data_NH3, options_NH3);
			chart = new google.visualization.AreaChart(document.getElementById('map_H2S'    ));
			chart.draw(data_H2S, options_H2S);
			chart = new google.visualization.AreaChart(document.getElementById('map_NO2'    ));
			chart.draw(data_NO2, options_NO2);
			chart = new google.visualization.AreaChart(document.getElementById('map_O3'     ));
			chart.draw(data_O3, options_O3);
			chart = new google.visualization.AreaChart(document.getElementById('map_SO2'    ));
			chart.draw(data_SO2, options_SO2);
			chart = new google.visualization.AreaChart(document.getElementById('map_HF'     ));
			chart.draw(data_HF, options_HF);
			chart = new google.visualization.AreaChart(document.getElementById('map_CL2'    ));
			chart.draw(data_CL2, options_CL2);
			chart = new google.visualization.AreaChart(document.getElementById('map_CO'     ));
			chart.draw(data_CO, options_CO);
			chart = new google.visualization.AreaChart(document.getElementById('map_CO2'    ));
			chart.draw(data_CO2, options_CO2);
			chart = new google.visualization.AreaChart(document.getElementById('map_dust'   ));
			chart.draw(data_dust, options_dust);
			chart = new google.visualization.AreaChart(document.getElementById('map_temp'   ));
			chart.draw(data_temp, options_temp);
			chart = new google.visualization.AreaChart(document.getElementById('map_hum'    ));
			chart.draw(data_hum, options_hum);
			chart = new google.visualization.AreaChart(document.getElementById('map_fan_in' ));
			chart.draw(data_fan_in, options_fan_in);
			chart = new google.visualization.AreaChart(document.getElementById('map_fan_out'));
			chart.draw(data_fan_out, options_fan_out);
		}
    }else {//macro=='cl_dbcurrent' defulte
        var result = data.split(';');
        //db air_state 
        //c_time,c_O2,c_CO2,c_dust,c_temp,c_hum,c_fan_in,c_fan_out
        c_time      =result[1];
        c_O2        =result[2];
        c_CO2       =result[3];
        c_dust      =result[4];
        c_temp      =result[5];
        c_hum       =result[6];
        c_NH3       =result[7];
        c_H2S       =result[8];
        c_HF        =result[9];
        c_NO2       =result[10];
        c_CL2       =result[11];
        c_O3        =result[12];
        c_CO        =result[13];
        c_SO2       =result[14];
        c_fan_in    =result[15];
        c_fan_out   =result[16];
        c_req_fan   =result[17];
        c_req_fanin =result[18];
        c_req_fanout=result[19];
        //alarm
        var alarmHtml = "";
        a_enmp3 = 0;
        if (a_enal == 1){
            if (parseFloat(a_O2al) > parseFloat(c_O2)){			alert("c_O2 alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_CO2al) < parseFloat(c_CO2)){			alert("c_CO2 alarm"+a_CO2al+":"+c_CO2);
                a_enmp3 = 1;            }
            if (parseFloat(a_dustal) < parseFloat(c_dust)){			alert("c_dust alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_tempal) < parseFloat(c_temp)){			alert("c_temp alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_humal) < parseFloat(c_hum)){			alert("c_hum alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_NH3al) < parseFloat(c_NH3)){			alert("c_NH3 alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_H2Sal) < parseFloat(c_H2S)){			alert("c_H2S alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_HFal) < parseFloat(c_HF)){			alert("c_HF alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_NO2al) < parseFloat(c_NO2)){			alert("c_NO2 alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_CL2al) < parseFloat(c_CL2)){			alert("c_CL2 alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_O3al) < parseFloat(c_O3)){			alert("c_O3 alarm");
                a_enmp3 = 1;            }
            if (parseFloat(a_COal) < parseFloat(c_CO)){			alert("c_CO alarm"+a_COal+":"+c_CO);
                a_enmp3 = 1;            }
            if (parseFloat(a_SO2al) < parseFloat(c_SO2)){			alert("c_SO2 alarm");
                a_enmp3 = 1;            }
        }
//		alert("알람:"+a_O2al+",현재:"+c_O2+
//			"\n알람:"+a_CO2al +",현재:"+ c_CO2+
//			"\n알람:"+a_dustal +",현재:"+ c_dust+
//			"\n알람:"+a_tempal +",현재:"+ c_temp+
//			"\n알람:"+a_humal +",현재:"+ c_hum+
//			"\n알람:"+a_NH3al +",현재:"+ c_NH3+
//			"\n알람:"+a_H2Sal +",현재:"+ c_H2S+
//			"\n알람:"+a_HFal +",현재:"+ c_HF+
//			"\n알람:"+a_NO2al +",현재:"+ c_NO2+
//			"\n알람:"+a_CL2al +",현재:"+ c_CL2+
//			"\n알람:"+a_O3al +",현재:"+ c_O3+
//			"\n알람:"+a_COal +",현재:"+ c_CO+
//			"\n알람:"+a_SO2al +",현재:"+ c_SO2+
//			"\non:"+a_enmp3);
        if (a_enmp3 == 1){
            alarmHtml = ' <audio controls autoplay loop><source src="/media/beep.mp3" type="audio/mp3">'
                        '이 문장은 사용자의 웹 브라우저가 audio 요소를 지원하지 않을 때 나타납니다!</audio> ';
        }else {
            alarmHtml = ' <audio controls ><source src="/media/beep.mp3" type="audio/mp3">'
                        '이 문장은 사용자의 웹 브라우저가 audio 요소를 지원하지 않을 때 나타납니다!</audio> ';
        }
        
        //fan control
        var fanchHtml = "";
        if (c_req_fan == 1){
            fanchHtml = ' style="color:Tomato;" ';
            c_fan_in  = c_req_fanin;
            c_fan_out = c_req_fanout;
        }else {
            fanchHtml = 'style="color:DodgerBlue;"';
        }
        //html change
        tempHtml = tempHtml + '<tr ><td></td> <td></td> <td></td> <td></td> </tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td> O₂(%) </td><td > NH₃(ppm) </td><td> H₂S(ppm) </td> <td> HF(ppm) </td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td>'+c_O2+'</td><td >'+c_NH3+'</td><td>'+c_H2S+'</td> <td>'+c_HF+'</td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td> NO₂(ppm) </td><td > CL₂(ppm) </td><td> O₃(ppm) </td> <td> CO(ppm) </td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td>'+c_NO2+'</td><td >'+c_CL2+'</td><td>'+c_O3+'</td> <td>'+c_CO+'</td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td> SO₂(ppm) </td><td > Temp(℃) </td><td> HUMID(%) </td> <td> DUST(㎍/m³) </td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td>'+c_SO2+'</td><td >'+c_temp+'</td><td>'+c_hum+'</td> <td>'+c_dust+'</td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td> CO₂(ppm) </td><td > 배기 </td><td> 흡기 </td> <td> </td></tr>';
        tempHtml = tempHtml + '<tr style="font-size:4vw;"><td>'+c_CO2+'</td><td id="fan_in" onClick="faninchange()"'+fanchHtml+'>' +c_fan_in+ '</td><td id="fan_out" onClick="fanoutchange()"'+fanchHtml+'>' +c_fan_out+'</td> <td></td></tr>';

        document.getElementById('ListThead').innerHTML = tempHtml2;
        document.getElementById('RFListTbody').innerHTML = tempHtml;
        document.getElementById('map').innerHTML = "";
        document.getElementById('time_view').innerHTML = c_time + alarmHtml;
    }
}
function setalarm2(macro, args, data){
    var result = data.split(';');
    a_O2al   = result[1];
    a_CO2al  = result[2];
    a_dustal = result[3];
    a_tempal = result[4];
    a_humal  = result[5];
    a_enal   = result[6];
    a_NH3al    = result[7];
    a_H2Sal    = result[8]; 
    a_HFal     = result[9]; 
    a_NO2al    = result[10]; 
    a_CL2al    = result[11]; 
    a_O3al     = result[12]; 
    a_COal     = result[13]; 
    a_SO2al    = result[14]; 
    a_daydbal  = result[15];
    var al_check = result[6];
    var tempHtml = '';
    var tempHtml2= '';
    if (al_check == 1) {
        al_check = 'checked';
    }else {
        al_check = '';    }
    //html change
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td><input style="font-size:4vw;" type="button" value="알람 저장" onClick="alarmdb()"></td>';
    tempHtml += '<td>  설정  </td><td><input type="checkbox" style="width:4vw;height:4vw;" id="al_en" value="1" '+al_check+'></td><td></td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td> O₂(%) </td><td > NH₃(ppm) </td><td> H₂S(ppm) </td> <td> HF(ppm) </td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_O2"  min="15" max="30" step="1" value="'+a_O2al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_NH3" min="0" max="100" step="1" value="'+a_NH3al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_H2S" min="0" max="100" step="1" value="'+a_H2Sal+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_HF"  min="0" max="100" step="1" value="'+a_HFal+'"></td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td> NO₂(ppm) </td><td > CL₂(ppm) </td><td> O₃(ppm) </td> <td> CO(ppm) </td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_NO2"  min="0" max="100"   step="1" value="'+a_NO2al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_CL2"  min="0" max="100"   step="1" value="'+a_CL2al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_O3"   min="0" max="100"   step="1" value="'+a_O3al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_CO"   min="0" max="1000" step="1" value="'+a_COal+'"></td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td> SO₂(ppm) </td><td > Temp(℃) </td><td> HUMID(%) </td> <td> DUST(㎍/m³) </td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_SO2"  min="0" max="100"  step="1" value="'+a_SO2al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_temp" min="0" max="100" step="1" value="'+a_tempal+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_hum"  min="0" max="100" step="1" value="'+a_humal+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_dust" min="0" max="300" step="1" value="'+a_dustal+'"></td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td> CO₂(ppm) </td><td > DB저장날짜 </td><td>  </td> <td> </td></tr>';
    tempHtml += '<tr style="font-size:4vw;">';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_CO2"  min="15" max="3000" step="1" value="'+a_CO2al+'"></td>';
    tempHtml += '<td><input type="number" style="font-size:4vw;" id="al_daydb" min="0" max="30" step="1" value="'+a_daydbal+'"></td>';
    tempHtml += '<td><input style="font-size:4vw;" type="button" value="날짜 초기화" onClick="dbclearday()"></td>';
    tempHtml += '<td><input style="font-size:4vw;" type="button" value="전체 초기화" onClick="dbclearall()"></td> </tr>';
    document.getElementById('map').innerHTML = "";
    document.getElementById('time_view').innerHTML = "";
    document.getElementById('ListThead').innerHTML = tempHtml2;
    document.getElementById('RFListTbody').innerHTML = tempHtml;
    
}
function drawVisualization(){
    //var rowdata= new Array();
    rowdata[0] = new Object();
    rowdata[0] = ['list_time','O2','CO2','dust','temp','hum', 'fan_in', 'fan_out'];
    var temptime = new Date();
    for (var i = 0; i < rf_count; i++){
        temptime.setTime(Date.parse(rfdata[i]['list_time']));
        rowdata[i+1] = new Object();
        rowdata[i+1] =[temptime.toTimeString().substr(0,9),parseInt(rfdata[i]['O2']),parseInt(rfdata[i]['CO2']),parseInt(rfdata[i]['dust']),parseInt(rfdata[i]['temp']),parseInt(rfdata[i]['hum']),parseInt(rfdata[i]['fan_in']),parseInt(rfdata[i]['fan_out'])];
    }
    var data = google.visualization.arrayToDataTable(rowdata);
    
    var options = {
      title: 'air monitoring log',
      explorer: { actions: ['dragToZoom', 'rightClickToReset'] },
      hAxis: {title: temptime.toDateString(),  titleTextStyle: {color: '#333'}},
      vAxis: {minValue: 0, maxValue : 200}
    };

    var chart = new google.visualization.AreaChart(document.getElementById('map'));
    chart.draw(data, options);
}
function drawVisualizationday(data){
            //google chart data make
        var rfdata_O2      = new Array();
        var rfdata_CO2     = new Array();
        var rfdata_dust    = new Array();
        var rfdata_temp    = new Array();
        var rfdata_hum     = new Array();
        var rfdata_NH3     = new Array();
        var rfdata_H2S     = new Array();
        var rfdata_HF      = new Array();
        var rfdata_NO2     = new Array();
        var rfdata_CL2     = new Array();
        var rfdata_O3      = new Array();
        var rfdata_CO      = new Array();
        var rfdata_SO2     = new Array();
        var rfdata_fan_in  = new Array();
        var rfdata_fan_out = new Array();
        //for num
        rfdata_O2[0]= new Object();
        rfdata_CO2[0]= new Object();
        rfdata_dust[0]= new Object();
        rfdata_temp[0]= new Object();
        rfdata_hum[0]= new Object();
        rfdata_NH3[0]= new Object();
        rfdata_H2S[0]= new Object();
        rfdata_HF[0]= new Object();
        rfdata_NO2[0]= new Object();
        rfdata_CL2[0]= new Object();
        rfdata_O3[0]= new Object();
        rfdata_CO[0]= new Object();
        rfdata_SO2[0]= new Object();
        rfdata_fan_in[0]= new Object();
        rfdata_fan_out[0]= new Object();
        rfdata_O2[0]= ['list_time','O2'];
        rfdata_CO2[0]= ['list_time','CO2'];
        rfdata_dust[0]= ['list_time','dust'];
        rfdata_temp[0]= ['list_time','temp'];
        rfdata_hum[0]= ['list_time','hum'];
        rfdata_NH3[0]= ['list_time','NH3'];
        rfdata_H2S[0]= ['list_time','H2S'];
        rfdata_HF[0]= ['list_time','HF'];
        rfdata_NO2[0]= ['list_time','NO2'];
        rfdata_CL2[0]= ['list_time','CL2'];
        rfdata_O3[0]= ['list_time','O3'];
        rfdata_CO[0]= ['list_time','CO'];
        rfdata_SO2[0]= ['list_time','SO2'];
        rfdata_fan_in[0]= ['list_time','fan_in'];
        rfdata_fan_out[0]= ['list_time','fan_out'];
        for (var i = 1; i < rf_count; i++){
            rfdata_O2[i]= new Object();
            rfdata_CO2[i]= new Object();
            rfdata_dust[i]= new Object();
            rfdata_temp[i]= new Object();
            rfdata_hum[i]= new Object();
            rfdata_NH3[i]= new Object();
            rfdata_H2S[i]= new Object();
            rfdata_HF[i]= new Object();
            rfdata_NO2[i]= new Object();
            rfdata_CL2[i]= new Object();
            rfdata_O3[i]= new Object();
            rfdata_CO[i]= new Object();
            rfdata_SO2[i]= new Object();
            rfdata_fan_in[i]= new Object();
            rfdata_fan_out[i]= new Object();
            rfdata_O2[i]['list_time']     = result[i*16+3];
            rfdata_CO2[i]['list_time']    = result[i*16+3];
            rfdata_dust[i]['list_time']   = result[i*16+3];
            rfdata_temp[i]['list_time']   = result[i*16+3];
            rfdata_hum[i]['list_time']    = result[i*16+3];
            rfdata_NH3[i]['list_time']    = result[i*16+3];
            rfdata_H2S[i]['list_time']    = result[i*16+3];
            rfdata_HF[i]['list_time']     = result[i*16+3];
            rfdata_NO2[i]['list_time']    = result[i*16+3];
            rfdata_CL2[i]['list_time']    = result[i*16+3];
            rfdata_O3[i]['list_time']     = result[i*16+3];
            rfdata_CO[i]['list_time']     = result[i*16+3];
            rfdata_SO2[i]['list_time']    = result[i*16+3];
            rfdata_fan_in[i]['list_time'] = result[i*16+3];
            rfdata_fan_out[i]['list_time']= result[i*16+3];
            rfdata_O2[i]['O2']            = result[i*16+4];
            rfdata_CO2[i]['CO2']          = result[i*16+5];
            rfdata_dust[i]['dust']        = result[i*16+6];
            rfdata_temp[i]['temp']        = result[i*16+7];
            rfdata_hum[i]['hum']          = result[i*16+8];
            rfdata_NH3[i]['NH3']          = result[i*16+9];
            rfdata_H2S[i]['H2S']          = result[i*16+10];
            rfdata_HF[i]['HF']            = result[i*16+11];
            rfdata_NO2[i]['NO2']          = result[i*16+12];
            rfdata_CL2[i]['CL2']          = result[i*16+13];
            rfdata_O3[i]['O3']            = result[i*16+14];
            rfdata_CO[i]['CO']            = result[i*16+15];
            rfdata_SO2[i]['SO2']          = result[i*16+16];
            rfdata_fan_in[i]['fan_in']    = result[i*16+17];
            rfdata_fan_out[i]['fan_out']  = result[i*16+18];
        }
        //drawAreaChart('map_O2'     ,rfdata_O2    ,0,100);
        //drawAreaChart('map_NH3'    ,rfdata_NH3   ,0,100);
        //drawAreaChart('map_H2S'    ,rfdata_H2S   ,0,100);
        //drawAreaChart('map_NO2'    ,rfdata_NO2   ,0,20);
        //drawAreaChart('map_O3'     ,rfdata_O3    ,0,20);
        //drawAreaChart('map_SO2'    ,rfdata_SO2   ,0,20);
        //drawAreaChart('map_HF'     ,rfdata_HF    ,0,10);
        //drawAreaChart('map_CL2'    ,rfdata_CL2   ,0,10);
        //drawAreaChart('map_CO'     ,rfdata_CO    ,0,1000);
        //drawAreaChart('map_CO2'    ,rfdata_CO2   ,0,5000);
        //drawAreaChart('map_dust'   ,rfdata_dust  ,0,1000);
        //drawAreaChart('map_temp'   ,rfdata_temp  ,-40,120);
        //drawAreaChart('map_hum'    ,rfdata_hum   ,0,100);
        //drawAreaChart('map_fan_in' ,rfdata_fan_in,0,10);
        //drawAreaChart('map_fan_out',rfdata_fan_out,0,10);
        //draw AreaChart 
        alert('result[20]'+result[16+4]+'rfdata_O2:'+rfdata_O2);
        var data_O2     = google.visualization.arrayToDataTable(rfdata_O2     );
        var data_NH3    = google.visualization.arrayToDataTable(rfdata_NH3    );
        var data_H2S    = google.visualization.arrayToDataTable(rfdata_H2S    );
        var data_NO2    = google.visualization.arrayToDataTable(rfdata_NO2    );
        var data_O3     = google.visualization.arrayToDataTable(rfdata_O3     );
        var data_SO2    = google.visualization.arrayToDataTable(rfdata_SO2    );
        var data_HF     = google.visualization.arrayToDataTable(rfdata_HF     );
        var data_CL2    = google.visualization.arrayToDataTable(rfdata_CL2    );
        var data_CO     = google.visualization.arrayToDataTable(rfdata_CO     );
        var data_CO2    = google.visualization.arrayToDataTable(rfdata_CO2    );
        var data_dust   = google.visualization.arrayToDataTable(rfdata_dust   );
        var data_temp   = google.visualization.arrayToDataTable(rfdata_temp   );
        var data_hum    = google.visualization.arrayToDataTable(rfdata_hum    );
        var data_fan_in = google.visualization.arrayToDataTable(rfdata_fan_in );
        var data_fan_out= google.visualization.arrayToDataTable(rfdata_fan_out);
        
        var options_O2      = { title:'O2',     explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
        var options_NH3     = { title:'NH3',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
        var options_H2S     = { title:'H2S',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
        var options_NO2     = { title:'NO2',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 20} };
        var options_O3      = { title:'O3',     explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 20} };
        var options_SO2     = { title:'SO2',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 20} };
        var options_HF      = { title:'HF',     explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
        var options_CL2     = { title:'CL2',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
        var options_CO      = { title:'CO',     explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 1000} };
        var options_CO2     = { title:'CO2',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 5000} };
        var options_dust    = { title:'dust',   explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 1000} };
        var options_temp    = { title:'temp',   explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: -40, maxValue : 120} };
        var options_hum     = { title:'hum',    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 100} };
        var options_fan_in  = { title:'fan_in', explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
        var options_fan_out = { title:'fan_out',explorer: { actions: ['dragToZoom', 'rightClickToReset'] }, vAxis: {minValue: 0, maxValue : 10} };
        var chart;
        chart = new google.visualization.AreaChart(document.getElementById('map_O2'     ));
        chart.draw(data_O2, options_O2);
        chart = new google.visualization.AreaChart(document.getElementById('map_NH3'    ));
        chart.draw(data_NH3, options_NH3);
        chart = new google.visualization.AreaChart(document.getElementById('map_H2S'    ));
        chart.draw(data_H2S, options_H2S);
        chart = new google.visualization.AreaChart(document.getElementById('map_NO2'    ));
        chart.draw(data_NO2, options_NO2);
        chart = new google.visualization.AreaChart(document.getElementById('map_O3'     ));
        chart.draw(data_O3, options_O3);
        chart = new google.visualization.AreaChart(document.getElementById('map_SO2'    ));
        chart.draw(data_SO2, options_SO2);
        chart = new google.visualization.AreaChart(document.getElementById('map_HF'     ));
        chart.draw(data_HF, options_HF);
        chart = new google.visualization.AreaChart(document.getElementById('map_CL2'    ));
        chart.draw(data_CL2, options_CL2);
        chart = new google.visualization.AreaChart(document.getElementById('map_CO'     ));
        chart.draw(data_CO, options_CO);
        chart = new google.visualization.AreaChart(document.getElementById('map_CO2'    ));
        chart.draw(data_CO2, options_CO2);
        chart = new google.visualization.AreaChart(document.getElementById('map_dust'   ));
        chart.draw(data_dust, options_dust);
        chart = new google.visualization.AreaChart(document.getElementById('map_temp'   ));
        chart.draw(data_temp, options_temp);
        chart = new google.visualization.AreaChart(document.getElementById('map_hum'    ));
        chart.draw(data_hum, options_hum);
        chart = new google.visualization.AreaChart(document.getElementById('map_fan_in' ));
        chart.draw(data_fan_in, options_fan_in);
        chart = new google.visualization.AreaChart(document.getElementById('map_fan_out'));
        chart.draw(data_fan_out, options_fan_out);

}

function faninchange(){
    var tempdata = document.getElementById("fan_in").innerHTML;
    tempdata *=1;
    if (tempdata >= FANMAX){
        tempdata = FANMIN;
    }else{
        tempdata += 1;
    }
    document.getElementById("fan_in").innerHTML = tempdata;
    args = [tempdata];
    webiopi().callMacro("cl_faninchange", args, macroCallback);
}
function fanoutchange(){
    var tempdata = document.getElementById("fan_out").innerHTML;
    tempdata *=1;
    if (tempdata >= FANMAX){
        tempdata = FANMIN;
    }else{
        tempdata += 1;
    }
    document.getElementById("fan_out").innerHTML = tempdata;
    args = [tempdata];
    webiopi().callMacro("cl_fanoutchange", args, macroCallback);
}
function alarmread(){
    args = [];
    webiopi().callMacro("cl_dbrdalarm", args, alarmread2);
}
function alarmread2(macro, args, data){
    var result = data.split(';');
    a_O2al   = result[1];
    a_CO2al  = result[2];
    a_dustal = result[3];
    a_tempal = result[4];
    a_humal  = result[5];
    a_enal   = result[6];
    a_NH3al    = result[7];
    a_H2Sal    = result[8]; 
    a_HFal     = result[9]; 
    a_NO2al    = result[10]; 
    a_CL2al    = result[11]; 
    a_O3al     = result[12]; 
    a_COal     = result[13]; 
    a_SO2al    = result[14]; 
    a_daydbal  = result[15];
    
}
function dbclearday(){
    args = [];
    webiopi().callMacro("cl_dbclearday", args, macroCallbackpass);
    
}
function dbclearall(){
    args = [];
    webiopi().callMacro("cl_dbclearall", args, macroCallbackpass);
    
}
