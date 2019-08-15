is_pull = false;

$(function(){
    setInterval(con_check, 5000, '');

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
            }
            if(!is_con && !is_pull)
            {
                is_pull = true;
                console.log(is_pull);
                //setInterval(pull, 3000, '');
                //setInterval(update, 5000, '');
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
            console.log(data);
            $('#Temperature1-O').text(data['Temperature1-O']);
            $('#Humidity1-O').text(data['Humidity1-O']);
        }).fail(function (data) {
            $('#Temperature1-O').text('None');
            $('#Humidity1-O').text('None');
        }).always(function() {
            if(typeof callback === 'function')
                callback();
        });
    }

    $('.cb').change(function() {
        console.log('????');
        var id = $(this).attr('id');
        var k = $(this).prop('checked')?1:0;
        if(id == 'switch')
            var str = {'switch' : k};
        else
            var str = {'Manual_mode': k}
        console.log(str[id]);
        $.ajax({
            'url': '/update',
            'method': 'GET',
            'contentType': 'text/html',
            'data': str
        }).done(function (data) {
            console.log(id);
            window.location.reload('/');
        }).fail(function (data) {
            
        }).always(function() {
        
        });
    });
})

function update (form) {
    //console.log($(form).serialize());
    var data = new FormData($(form)[0]);
    //console.log(data);
    $.ajax({
        'url': '/update',
        'method': 'POST',
        'contentType': 'text/html',
        'data' : data,
        'processData': false,
        'contentType': false
    }).done(function (datas) {
       // console.log(datas);
        datas = JSON.parse(datas);
        for(var k in datas) {
            $(`select[name=${k}]`).val(datas[k]);
            console.log(k,  $(`select[name=${k}]`).val());
        }
        if(datas['switch'] != '')
             $('#switch').bootstrapToggle(datas['switch']==1?'on':'off');
        //$('#switch').prop('checked',).change();
        if(datas['Manual_mode'] != '')
            $('#Manual_mode').bootstrapToggle(datas['Manual_mode']==1?'on':'off');
            //$('#Manual_mode').prop('checked',datas['Manual_mode']==1?true:false).change(true);
    
    }).fail(function (datas) {
        
    }).always(function() {
        if(typeof callback === 'function')
            callback();
    });
}



