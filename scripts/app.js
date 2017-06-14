class App{

    static main(){
        this.accesser = new ServerAccesser();
        this.accesser.getSchedule((data)=>{
            console.log(data);
        });
        var start = moment("2017-04-17", "YYYY-MM-DD");
        var end = moment("2017-04-17", "YYYY-MM-DD");
        this.accesser.getEventList(start, end, (data)=>{
            console.log(data);
        });        
    }
}

class ServerAccesser{

    constructor(){
        this.getSchedulesUrl = "api/v1/get_schedule.php";
        this.getEventListUrl = "api/v1/get_eventlist.php";
    }

    getSchedule(callback){
        this.getJson(this.getSchedulesUrl, callback);
    }

    getEventList(start, end, callback){
        var startStr = start.format("YYYY-MM-DD");
        var endStr = end.format("YYYY-MM-DD");
        var getReqStr = "?start={0}&end={1}".format(startStr, endStr);
        this.getJson(this.getEventListUrl + getReqStr, callback);
    }

    getJson(url, success){
        $.getJSON(url, (data, textStatus)=>{
            if(textStatus != "success"){
                throw new Error("サーバーとの通信に失敗しました。 status: {0}".format(textStatus));
            }
            success(data);
        });
    }
}

App.main();