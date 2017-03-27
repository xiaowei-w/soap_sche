'use strict'
var dp = null;

function setCellDim(dp){
    dp.eventHeight = 25;
    dp.headerHeight = 15;
    
    dp.cellWidth = 100;
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

function getResources(dp) {
    getJSONFromURL( '/resources', function(result) {
        dp.resources = result.resources;
        dp.update();
    })
}

function updateRes() {
    getResources(dp);
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
    
    // generate and load events
    // for (var i = 0; i < 1; i++) {
    //     var duration = Math.floor(Math.random() * 6) + 1; // 1 to 6
    //     var start = Math.floor(Math.random() * 6) - 3; // -3 to 3

    //     var e = new DayPilot.Event({
    //         start: new DayPilot.Date("2013-03-25T00:00:00").addHours(start),
    //         end: new DayPilot.Date("2013-03-25T12:00:00").addHours(start).addHours(duration),
    //         id: DayPilot.guid(),
    //         resource: "B",
    //         text: "Event"/*,
    //         bubbleHtml: "Testing bubble"*/
    //     });
    //     dp.events.add(e);
    // }

    dp.eventHoverHandling = "Bubble";

    dp.onBeforeEventRender = function(args) {
        args.e.bubbleHtml = args.e.start + " " + args.e.end;
    };

    // event creating
    dp.onTimeRangeSelected = function (args) {
        // var name = prompt("New event name:", "Event");
        // dp.clearSelection();
        // if (!name) return;
        // var e = new DayPilot.Event({
        //     start: args.start,
        //     end: args.end,
        //     id: DayPilot.guid(),
        //     resource: args.resource,
        //     text: name
        // });
        // dp.events.add(e);
        // dp.message("Created");
        var modal = new DayPilot.Modal();
        modal.onClosed = function(args) {
            dp.clearSelection();
            // var data = args.result;
            // if (data && data.result === "OK") { 
            //     loadEvents(); 
            //     dp.message(data.message); 
            // }
        };
        modal.showUrl("newjob?start=" + args.start + "&end=" + args.end + "&resource=" + args.resource);
    };

    // dp.onEventClicked = function(args) {
    //     alert("clicked: " + args.e.id());
    // };

    // dp.onTimeHeaderClick = function(args) {
    //     alert("clicked: " + args.header.start);
    // };

    dp.snapToGrid = false;
    dp.useEventBoxes = "Never";

    dp.onEventMoving = function(args) {
        var offset = args.start.getMinutes() % 5;
        if (offset) {
            args.start = args.start.addMinutes(-offset);
            args.end = args.end.addMinutes(-offset);
        }

        args.left.enabled = true;
        args.left.html = args.start.toString("h:mm tt");
    };


    dp.onIncludeTimeCell = function(args) {};
    dp.rowClickHandling = true;
    dp.init();

    // Scroll to Today
    dp.scrollTo(new DayPilot.Date());
}