/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/moment/moment.d.ts" />
class ServerAccesser {
    private HostName: string;
    private GetScheduleUrl: string;
    private GetEventListUrl: string;

    constructor() {
        this.HostName = location.hostname;
        this.GetScheduleUrl = "/api/v1/get_schedule.php";
        this.GetEventListUrl = "/api/v1/get_eventlist.php";
    }

    public GetSchedules(callback: (data: any) => void): any {
        $.getJSON(this.GetScheduleUrl, callback);
    }
}