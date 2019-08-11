var switch_control = (function () {
    return $('#switch').prop('checked');
});

var set_switch_control = (function (state) {
    if(state == 0)
    {
        $('#switch').bootstrapToggle('off');
    }
    else
    {
        $('#switch').bootstrapToggle('on');
    }
});

var check_placeholder = (function (id) {
    var ele = $('#'+id);
    
    if(parseInt(ele.val()) > parseInt(ele.prop('max')))
    {
        ele.val(ele.prop('max'));
    }

    if(parseInt(ele.val()) < parseInt(ele.prop('min')))
    {
        ele.val(ele.prop('min'));
    }

});

$(function(){
    setInterval(pull, 3000, '');
    
    function pull (callback) {
        console.log("callback");
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
    
})


