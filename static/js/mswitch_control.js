is_pull = false;
var Manual_mode;

$(function(){
    setInterval(con_check, 4000, '');

    Manual_mode =  $('#Manual_mode').prop('checked')?1:0;
    console.log(Manual_mode);

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
                setInterval(update, 3000, '');
            }
        }).fail(function (data) {

        }).always(function() {
            if(typeof callback === 'function')
                callback();
        });
    }

    /*
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
            //window.location.reload('/');
        }).fail(function (data) {
            
        }).always(function() {
        
        });
    });
    */
})

function update (form) {
    //console.log($(form).serialize());
    var formdata;
    if(form == '')
    {
        formdata = new FormData();
        formdata.append('switch', $('#switch').prop('checked')?'1':'0');
        formdata.append('Manual_mode', $('#Manual_mode').prop('checked')?'1':'0');
        for (var key of formdata.entries()) {
            console.log(key[0] + ', ' + key[1]);
        }
    
    }
    else
    {
        formdata = new FormData($(form)[0]);
    }
    
    $.ajax({
        'url': '/update',
        'method': 'POST',
        'contentType': 'text/html',
        'data' : formdata,
        'processData': false,
        'contentType': false
    }).done(function (data) {

        /*
        //console.log(datas);
        data = JSON.parse(data);
        if(data['switch'] != '')
            $('#switch').bootstrapToggle(data['switch']==1?'on':'off');
            //$('#switch').prop('checked',).change();
        if(Manual_mode != data['Manual_mode'] || data['Manual_mode'] != $('#Manual_mode').prop('checked')?1:0)
            //console.log($('#Manual_mode').prop('checked')?'1':'0');
            window.location.reload('/');
        */
        
    }).fail(function (data) {
        
    }).always(function() {
        if(typeof callback === 'function')
            callback();
    });


}

function abc() {
    console.log(123);
}




