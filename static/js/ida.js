 $(function(){
        csmapi.set_endpoint ('http://140.113.111.72:9999');
        var profile = {
		    'dm_name': 'SwitchAIO',          
			'idf_list':[Switch1],
			'odf_list':[Switch, Humidity1_O, Temperature1_O],
            'd_name': 'only',
            'is_sim':false,
        };
		
        function Switch1(){
            return switch_control() ? 1 : 0;
        }

        function Humidity1_O(data){
           $('.Humidity1_O')[0].innerText=data[0];
           
        }

        function Temperature1_O(data){
            $('.Temperature1_O')[0].innerText=data[0];
            
        }

        function Switch(data){
            set_switch_control(data[0]);
        }

        
      
/*******************************************************************/                
        function ida_init(){
        console.log(profile.d_name);
        //$('#switch').bootstrapToggle('off');
        console.log(switch_control());
	}
        var ida = {
            'ida_init': ida_init,
        }; 
        dai(profile,ida);     
});
