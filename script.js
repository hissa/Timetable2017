var makeTable = function () {
    $("#timetable").addClass("table table-bordered table-striped");
    $("#timetable").append("<thead id=\"timetableThead\"></thead>");
    $("#timetableThead").append("<tr id=\"weeksHead\"></tr>");
    var weeks = ["月", "火", "水", "木", "金"];
    for (var i = 0; i < 6; i++) {
        if (i == 0) {
            // テーブルの左上の空白
            $("#weeksHead")
                .append("<th id=\"weeksHead0\"></th>");
        } else {
            $("#weeksHead")
                .append("<th id=\"weeksHead" + i + "\">" + weeks[i - 1] + "</th>");
        }
    }
    $("#timetable").append("<tbody id=\"timetableTbody\"></tbody>");
    for (var period = 0; period < 3; period++) {
        $("#timetableTbody").append("<tr id=\"row" + period + "\"></tr>");
        for (var week = 0; week < 6; week++) {
            if (week == 0) {
                // コマ数の数字
                $("#row" + period)
                    .append(
                    "<th id=\"periodHead" + period + "\">" + (period + 1) + "</th>"
                    );
            } else {
                var idName = "period" + (week - 1) + "-" + period;
                $("#row" + period)
                    .append("<td id=\"" + idName + "\"></td>");
            }
        }
    }
};

var searchAllPeriod = function(schedules, func){
    var schedule = schedules.schedule;
    var day = 0;
    while(schedule[day]){
        var period = 0;
        while(schedule[day].classes[period]){
            var currentPeriod = schedule[day].classes[period];
            func(currentPeriod, day, period);
            period++;
        }
        day++;
    }
};

var extractDetails = function (schedules) {
    var details = [];
    searchAllPeriod(schedules, function (currentPeriod) {
        if (currentPeriod.event != "none") {
            details.push({
                subject: currentPeriod.subject,
                event: currentPeriod.event,
                text: currentPeriod.text
            });
        }
    });
    console.log(details);
    return details;
};

var makeDetails = function(schedules){
    var details = extractDetails(schedules);
    $("#details").addClass("table table-bordered table-striped");
    $("#details").append("<tbody id=\"detailsTbody\" />");
    var i = 0;
    while(details[i]){
        var rowId = "dRow"+i;
        $("#detailsTbody").append("<tr id=\""+rowId+"\" />");
        $("#"+rowId).append(
            "<td>"+details[i].subject+"</td>"
        );
        $("#"+rowId).append(
            "<td>"+details[i].event+"</td>"
        );
        $("#"+rowId).append(
            "<td>"+details[i].text+"</td>"
        );
        i++;
    }
};

var setSchedule = function(schedules){
    searchAllPeriod(schedules, function(currentPeriod, day, period){
        var currentIdName = "#period" + day + "-" + period;
        $(currentIdName).text(currentPeriod.subject);
        if(currentPeriod.event != "none"){
            $(currentIdName).addClass("info");
        }
    });
};



makeTable();
var gotData;
$.get("testSchedule.json", function (data) {
    console.log(data);
    gotData = data;
    setSchedule(gotData);
    makeDetails(gotData);
});