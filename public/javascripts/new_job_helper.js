function modclose(result) { 
    DayPilot.Modal.close(result); 
}

$(document).ready( function() {
    $("#f").submit(function (ev) {
        ev.preventDefault();
            
        // submit using AJAX
        var f = $("#f");
        $.post("/job/add", f.serialize(), function (result) {
            modclose(eval(result));
        });
            
    });
});
