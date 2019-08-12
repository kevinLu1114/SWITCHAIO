is_pull = false;

$(function(){
    setInterval(con_check, 4000, '');

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

    $('.cb').change(function() {
        console.log('????');
        $.ajax({
            'url': '/update',
            'method': 'GET',
            'contentType': 'text/html',
            'data': `{${$(this).attr('id')}:${$(this).prop('checked')?1:0}}`
        }).done(function (data) {
            
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
        console.log(datas);
        datas = JSON.parse(datas);
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





