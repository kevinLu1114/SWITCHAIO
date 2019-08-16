is_pull = false;



$(function(){

    setInterval(con_check, 5000, '');

    console.log('#Manual_mode', $('#Manual_mode').prop('checked'));
    console.log('#switch', $('#switch').prop('checked'));

    if($('#Manual_mode').prop('checked'))
        $('#auto_block').css("display","none");
    else
        $('#auto_block').css("display","block");


    function con_check (callback) {
        console.log("con_check");
        $.ajax({
            'url': '/con_check',
            'method': 'GET',
            'contentType': 'text/html'
        }).done(function (data) {
            //console.log(data);
            is_con = $("title").html().trim() == 'No_con';
            //console.log(is_con);
            if((data == 'false' && !is_con) || (data == 'true' && is_con))
            {
                window.location.reload('/');
                console.log("reload now!!!!");
            }
            if(!is_con && !is_pull)
            {
                is_pull = true;
                setInterval(pull, 3000, '');
            }
        }).fail(function (data) {

        }).always(function() {
            if(typeof callback === 'function')
                callback();
        });
    }

    
    function pull (callback) {
        console.log("pull");
        $.ajax({
            'url': '/pull',
            'method': 'GET',
            'contentType': 'text/html'
        }).done(function (data) {
            data = JSON.parse(data);
            //console.log(data);
            $('#Manual_mode').bootstrapToggle(data['Manual_mode']?'on':'off');
            $('#switch').bootstrapToggle(data['switch']?'on':'off');
            /*
            for(var k in data) {
                $(`select[name=${k}]`).val(data[k]);
            }
            */
            $('#current_start_timeSet').text(data['start_hour'] + ' : ' + data['start_min']);
            $('#current_end_timeSet').text(data['end_hour'] + ' : ' + data['end_min']);
            //console.log(data['switch']);

            $('#Temperature1-O').text(data['Temperature1-O']);
            $('#Humidity1-O').text(data['Humidity1-O']);

        }).fail(function (data) {
            $('#Temperature1-O').text('None');
            $('#Humidity1-O').text('None');
        }).always(function() {
            if(typeof callback === 'function')
                callback('');
        });
    }

    $('#Manual_mode').change(function() {

        if($(this).prop('checked'))
        {
            $('#auto_block').css("display", "none");
            $('#switch').bootstrapToggle('destroy');
            $('#switch').bootstrapToggle({
                'onstyle':'primary',
                'offstyle':'light'
            });
            $('#switch').bootstrapToggle('enable');
        }
        else
        {
            $('#auto_block').css("display","block");
            $('#switch').bootstrapToggle('destroy');
            $('#switch').bootstrapToggle({
                'onstyle':'danger',
                'offstyle':'warning'
            });
            
            $('#switch').bootstrapToggle('disable');
        }
    });

})


function push (form, callback) {
    //console.log($(form).serialize());
    
    console.log('#Manual_mode', $('#Manual_mode').prop('checked'));
    console.log('#switch', $('#switch').prop('checked'));

    var formdata;

    if(form == '#Manual_mode')
    {
        formdata = new FormData();
        sw = $('#Manual_mode').prop('checked')?'0':'1';
        formdata.append('Manual_mode',sw);
    }
    else if(form == '#switch')
    {
        if(!$('#Manual_mode').prop('checked')) return;
        formdata = new FormData();
        formdata.append('switch', $('#switch').prop('checked')?'0':'1');
    }
    else
    {
        formdata = new FormData($(form)[0]);
    }

    for (var key of formdata.entries()) {
        console.log(key[0] + ', ' + key[1]);
    }
    
    $.ajax({
        'url': '/update',
        'method': 'POST',
        'contentType': 'text/html',
        'data' : formdata,
        'processData': false,
        'contentType': false
    }).done(function (data) {
        
        //console.log(datas);
        data = JSON.parse(data);
        console.log(data);
        /*
        for(var k in data) {
            $(`select[name=${k}]`).val(data[k]);
            //console.log(k,  $(`select[name=${k}]`).val());
        }
        if(Manual_mode != data['Manual_mode'])
            //console.log($('#Manual_mode').prop('checked')?'1':'0');
            window.location.reload('/');
            //$('#Manual_mode').prop('checked',datas['Manual_mode']==1?true:false).change(true);
        */
        
    }).fail(function (data) {
        
    }).always(function() {
        if(typeof callback === 'function')
            callback();
    });
}

