/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/moment/moment.d.ts" />
var ServerAccesser = (function () {
    function ServerAccesser() {
        this.HostName = location.hostname;
        this.GetScheduleUrl = "/api/v1/get_schedule.php";
        this.GetEventListUrl = "/api/v1/get_eventlist.php";
    }
    ServerAccesser.prototype.GetSchedules = function (callback) {
        $.getJSON(this.GetScheduleUrl, callback);
    };
    return ServerAccesser;
}());
