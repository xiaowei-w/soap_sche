'use strict'
var dp = null;
var events = [];
function setCellDim(dp){
    dp.eventHeight = 55;
    dp.headerHeight = 15;
    
    dp.cellWidth = 40;
}

function setStartDate(dp) {
    // To centerize Today, we start 3 days before today.
    var start = new Date();
    start.setDate( new Date().getDate()-3);
    dp.startDate = start;
}

function setContextMenu(dp) {
    // Right click Menu

    // dp.contextMenu = new DayPilot.Menu({items: [
    //     {text:"Show event ID", onclick: function() {alert("Event value: " + this.source.value());} },
    //     {text:"Show event text", onclick: function() {alert("Event text: " + this.source.text());} },
    //     {text:"Show event start", onclick: function() {alert("Event start: " + this.source.start().toStringSortable());} },
    //     {text:"Go to google.com", href: "http://www.google.com/?q={0}"},
    //     {text:"CallBack: Delete this event", command: "delete"} ,
    //             {text:"submenu", items: [
    //                     {text:"Show event ID", onclick: function() {alert("Event value: " + this.source.value());} },
    //                     {text:"Show event text", onclick: function() {alert("Event text: " + this.source.text());} }
    //                 ]
    //             }
    // ]});
}

function getJSONFromURL( url, onSuccessCallback, onErrorCallback ) {
    $.ajax({
        type: "get",
        beforeSend : function (request) {
            request.setRequestHeader("Accept", "application/json");
        },
        url: url,
        dataType: "json",
        success: function (result) {
            if ( !( onSuccessCallback === undefined) ) {
                onSuccessCallback(result);
            }
        },
        error: function (error) {
            if ( !(onErrorCallback === undefined) ) {
                onErrorCallback(error);
            }
        }
    })
}

function getPOSTFromURL( url, data, onSuccessCallback, onErrorCallback ) {
    $.ajax({
        type: "post",
        beforeSend : function (request) {
            request.setRequestHeader("Accept", "application/json");
        },
        url: url,
        dataType: "json",
        data : data,
        success: function (result) {
            if ( !( onSuccessCallback === undefined) ) {
                onSuccessCallback(result);
            }
        },
        error: function (error) {
            if ( !(onErrorCallback === undefined) ) {
                onErrorCallback(error);
            }
        }
    })
}
function getResources(dp) {
    getJSONFromURL( '/resource/list', function(result) {
        dp.resources = result;
        dp.update();
    })
}

function updateRes() {
    getResources(dp);
}
function flushAllEvents() {
    for( var idx = 0; idx < events.length; ++idx ) {
        dp.events.remove(events[idx]);
    }
    events = [];
}
function generateEvents( jobs ) {
    flushAllEvents()
    for ( var i=0; i< jobs.length; ++i) {
        var job = jobs[i];
        //console.log(job);
        for( var add_day = 0; add_day < 7; ++add_day ) {
            var start_d = dp.startDate;
            start_d = start_d.addDays(add_day);
            if ( job['start_dow'].indexOf(start_d.dayOfWeek()) > -1 ) {
                //console.log("Found" + start_d.dayOfWeek());
                var e = new DayPilot.Event({
                    start: new DayPilot.Date(start_d).addHours(job['start_hr']).addMinutes(job['start_min']),
                    end: new DayPilot.Date(start_d).addHours(job['start_hr']).addMinutes(job['start_min']).addHours(job['duration_hr']).addMinutes(job['duration_min']),
                    id: DayPilot.guid(),
                    resource: job['resource_id'],
                    text: job['name'],
                    tag: job,
                    height: 80
                });
                dp.events.add(e);
                events.push(e);
            }
        }
    }
    
}

function loadEvents() {
    getJSONFromURL( '/job/list', function(result) {
        //console.log(result);
        if (result && result.jobs) {
            generateEvents(result.jobs);
        }
    })
}

function initAddRow() {
    var modal = new DayPilot.Modal();
    modal.onClosed = function(args) {
        var data = args.result;
        if (data && data.result === "OK") { 
             updateRes();
        }
    };
    modal.showUrl("resource/new");
}

function initDelRow() {
    var modal = new DayPilot.Modal();
    modal.onClosed = function(args) {
        var data = args.result;
        if (data && data.result === "OK") { 
             updateRes();
        }
    };
    modal.showUrl("resource/remove");
}
function createBubbleHTML (args) {
    //args.e.bubbleHtml = args.e.start + " to " + args.e.end;
    var DAY_OF_WEEK = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    var job = args.e.tag;
    args.e.bubbleHtml   = "<div style='font-weight:bold'>" + args.e.text;
    args.e.bubbleHtml   += "<br> ";
    for (var i=0; i< DAY_OF_WEEK.length; ++i) {
       if (job['start_dow'].indexOf(i) > -1) {
           args.e.bubbleHtml   += DAY_OF_WEEK[i] + " ";
       }
    }
    args.e.bubbleHtml   += "<br> Runtime " + job['duration_hr'] + "hr " + job['duration_min'] + "min";
    args.e.bubbleHtml   += "<br> StartCMD [" + args.e.tag['start_cmd'] + ']';
    args.e.bubbleHtml   += "<br> EndCMD   [" + args.e.tag['end_cmd'] + ']';
    args.e.bubbleHtml   += "</div>";
}

var slidingTimeout = null;

function showCurrentTime() {
    dp.update({
        separators: [{color:"Red", location: new DayPilot.Date()}]
    });
    
    slidingTimeout = setInterval(function() {
        dp.update({
            separators: [{color:"Red", location: new DayPilot.Date()}]
        });
    }, 60000);  // once per minute
}

function hideCurrentTime() {
  dp.update({
    separators: []
  });
  clearInterval(slidingTimeout);
}

function onModalClosedHandler(args) {
    dp.clearSelection();
    var data = args.result;
    if (data && data.result === "OK") { 
        dp.message(data.message); 
    }
    loadEvents(); 
};

function initEventHandling() {
    // Pop Up Bubble
    dp.eventHoverHandling = "Bubble";
    dp.onBeforeEventRender = createBubbleHTML;

    // event creating
    dp.onTimeRangeSelected = function (args) {
        var modal = new DayPilot.Modal();
        modal.onClosed = onModalClosedHandler;
        modal.showUrl("job/new?start=" + args.start + "&end=" + args.end + "&resource=" + args.resource);
    };

    dp.onEventClick = function(args) {
        var modal = new DayPilot.Modal();
        modal.onClosed = onModalClosedHandler;
        modal.showUrl("job/edit?start=" + args.e.start() + "&end=" + args.e.end() + "&id=" + args.e.tag()['id']);
    };
    dp.onEventMoved = function(args) {
        var modal = new DayPilot.Modal();
        modal.onClosed = onModalClosedHandler;
        modal.showUrl("job/edit?start=" + args.newStart + "&end=" + args.newEnd + "&id=" + args.e.tag()['id']);
    };

    dp.onEventMoving = function(args) {
        var offset = args.start.getMinutes() % 5;
        if (offset) {
            args.start = args.start.addMinutes(-offset);
            args.end = args.end.addMinutes(-offset);
        }

        args.left.enabled = true;
        args.left.html = args.start.toString("h:mm tt");
    };

    dp.eventDeleteHandling="Enabled";
    dp.onEventDeleted = function(args) {
        var modal = new DayPilot.Modal();
        modal.onClosed = onModalClosedHandler;
        modal.showUrl("job/remove?" + "id=" + args.e.tag()['id']);
    };

    dp.eventHoverHandling = "Update";
    dp.eventResizeHandling = "Disabled";
}
function init() {
    dp = new DayPilot.Scheduler("dp");

    // Set Cell Dimensions
    setCellDim(dp);

    // view
    setStartDate(dp);

    dp.cellGroupBy = "Month";
    dp.days = 7;
    dp.cellDuration = 1440; // one day
    dp.eventTextWrappingEnabled = true;
    
    dp.timeHeaders = [
        { groupBy: "Day" , format: "d-MMM-yyyy (dddd)"},
        { groupBy: "Cell" }
    ];
    dp.scale = "Hour";

    // bubble, sync loading
    // see also DayPilot.Event.data.staticBubbleHTML property
    dp.bubble = new DayPilot.Bubble();

    dp.treeEnabled = true;
    dp.rowHeaderWidth = 100;
    
    getResources(dp);

    initEventHandling();

    dp.snapToGrid = false;
    dp.useEventBoxes = "Never";

    dp.onIncludeTimeCell = function(args) {};
    dp.rowClickHandling = true;
    dp.init();

    // Scroll to Today
    dp.scrollTo(new DayPilot.Date().addHours(-4));
    
    showCurrentTime();
    loadEvents();
}