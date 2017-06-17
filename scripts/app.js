class App{

    static main(){
        var start = moment("2017-04-17", "YYYY-MM-DD");
        var end = moment("2017-04-21", "YYYY-MM-DD");
        App.timetables = [];
        App.timetables.push(new Timetable(start, end, ()=>{
            App.timetables[0].makeTimetable($("#timetable"));
        }));
        var pagination = new TimetablePagination(
            "Current", "PreviousButton", "NextButton"
        );
        pagination.makePagination($("#timetablePagination"));
    }
}

class TimetablePagination{    
    constructor(center = "", previous = "", next = ""){
        this.paginationObject = null;
        this.UniqueId = TimetablePagination.getUniqueId();
        this.center = center;
        this.previous = previous;
        this.next = next;
        this.idNameCenter = "pagination{0}Center".format(this.UniqueId);
        this.idNamePrevious = "pagination{0}Previous".format(this.UniqueId);
        this.idNameNext = "pagination{0}Next".format(this.UniqueId);
    }
    
    makePagination(paginationObject){
        paginationObject.append("<li id=\"{0}\" />".format(this.idNamePrevious));
        paginationObject.append("<li id=\"{0}\" />".format(this.idNameCenter));
        paginationObject.append("<li id=\"{0}\" />".format(this.idNameNext));
        this.setTexts();
    }

    setTexts(){
        $("#{0}".format(this.idNamePrevious)).text(this.previous)
            .wrapInner("<a href=\"#\" />");
        $("#{0}".format(this.idNameCenter)).text(this.center)
            .wrapInner("<a href=\"#\" />").addClass("active");
        $("#{0}".format(this.idNameNext)).text(this.next)
                .wrapInner("<a href=\"#\" />");
    }

    setCenter(str){
        this.center = str;
        this.setTexts();
    }

    setPrevious(str){
        this.previous = previous;
        this.setText();
    }

    setNext(str){
        this.next = str;
        this.setTexts();
    }

    static getUniqueId(){
        if(TimetablePagination.usedUniqueId == undefined){
            TimetablePagination.usedUniqueId = 0;
        }
        var toUse = TimetablePagination.usedUniqueId;
        TimetablePagination.usedUniqueId++;
        return toUse;
    }
}

class ServerAccesser{

    constructor(){
        this.getSchedulesUrl = "api/v1/get_schedule.php";
        this.getEventListUrl = "api/v1/get_eventlist.php";
    }

    getSchedule(callback){
        this.getJson(this.getSchedulesUrl, (data)=>{
            var parsedSchedule = [];
            var day = 0;
            while(data[day]){
                var period = 0;
                parsedSchedule[day] = [];
                while(data[day][period]){
                    var current = data[day][period];
                    parsedSchedule[day][period] = Subject.parse(current);
                    period++;
                }
                day++;
            }
            callback(parsedSchedule);
        });
    }

    getEventList(start, end, callback){
        var startStr = start.format("YYYY-MM-DD");
        var endStr = end.format("YYYY-MM-DD");
        var getReqStr = "?start={0}&end={1}".format(startStr, endStr);
        this.getJson(this.getEventListUrl + getReqStr, (data)=>{
            var parsedEventList = [];
            var i = 0;
            while(data[i]){
                var current = data[i];
                parsedEventList[i] = Event.parse(current);
                i++;
            }
            callback(parsedEventList);
        });
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

class Timetable{
    constructor(startDate, endDate, ready){
        this.uniqueId = Timetable.getUniqueId();
        this.startDate = startDate;
        this.endDate = endDate;
        this.ready = ready;
        this.days = [];
        this.accesser = new ServerAccesser();
        this.accesser.getSchedule((data)=>{
            this.addScheduleData(data);
            this.tryMakeData();
        });
        this.accesser.getEventList(this.startDate, this.endDate, (data)=>{
            this.addEventsData(data);
            this.tryMakeData();
        });
    }

    makeTimetable(tableObject){
        var weeks = ["月", "火", "水", "木", "金"];
        tableObject.append("<thead id=\"table{0}thead\" />".format(this.uniqueId));
        $("#table{0}thead".format(this.uniqueId))
            .append("<tr id=\"table{0}headtr\" />".format(this.uniqueId));
        $("#table{0}headtr".format(this.uniqueId))
            .append("<th id=\"table{0}topleft\" />".format(this.uniqueId));
        for(var i = 0; i < 5; i++){
            $("#table{0}headtr".format(this.uniqueId))
                .append("<th id=\"table{0}week{1}\">{2}</th>"
                    .format(this.uniqueId, i, weeks[i]));
        }
        tableObject.append("<tbody id=\"table{0}tbody\" />".format(this.uniqueId));
        for(var period = 0; period <= 2; period++){
            $("#table{0}tbody".format(this.uniqueId))
                .append("<tr id=\"table{0}tr{1}\" />".format(this.uniqueId, period));
            for(var week = 0; week <= 5; week++){
                if(week == 0){
                    $("#table{0}tr{1}".format(this.uniqueId, period))
                        .append("<th id=\"table{0}numhead{1}\">{1}</th>"
                            .format(this.uniqueId, period + 1));
                }else{
                    $("#table{0}tr{1}".format(this.uniqueId, period))
                        .append("<td id=\"table{0}w{1}p{2}\" />"
                            .format(this.uniqueId, week - 1, period));
                }
            }
        }
        this.setSubjectNames();
        this.setEvents();
        //debug
        console.log(this.startDate.format("YYYY-MM-DD"));
        this.highlightDay(this.startDate);
    }

    setSubjectNames(shortName = false){
        for(var week = 0; week < 5; week++){
            var day = this.days[week];
            for(var period = 0; period < 3; period++){
                $("#table{0}w{1}p{2}".format(this.uniqueId, week, period))
                    .text(day.periods[period].subject.name);
            }
        }
    }

    setEvents(){
        for(var week = 0; week < 5; week++){
            var day = this.days[week];
            for(var period = 0; period < 3; period++){
                if(day.periods[period].event != null){
                    $("#table{0}w{1}p{2}".format(this.uniqueId, week, period))
                        .addClass("info");
                }
            }
        }
    }

    static getUniqueId(){
        if(Timetable.usedUniqueId == undefined){
            Timetable.usedUniqueId = 0;
        }
        var toUse = Timetable.usedUniqueId;
        Timetable.usedUniqueId++;
        return toUse;
    }

    addScheduleData(data){
        this.scheduleData = data;
    }

    addEventsData(data){
        this.eventsData = data;
    }

    isDataCompleted(){
        if(this.scheduleData != null && this.eventsData != null){
            return true;
        }
        return false;
    }

    tryMakeData(){
        if(this.isDataCompleted()){
            this.makeData();
        }
    }

    makeData(){
        if(!this.isDataCompleted()){
            throw new Error("必要なデータが揃っていません。");
        }
        var day = 0;
        while(this.scheduleData[day]){
            var currentDate = this.startDate.clone().add(day, "days");
            var period = 0;
            var periods = [];
            while(this.scheduleData[day][period]){
                var current = this.scheduleData[day][period];
                var events = this.searchEvents(currentDate, current.id);
                var newPeriod = new Period(current);
                newPeriod.addEvent(events[0]);
                periods.push(newPeriod);
                period++;
            }
            this.days.push(new Day(currentDate, periods));
            day++;
        }
        console.log(this.days);
        this.ready();
    }

    searchEvents(date, subjectId){
        var i = 0;
        var results = [];
        while(this.eventsData[i]){
            var current = this.eventsData[i];
            if(current.date.isSame(date, "day") && current.subjectId == subjectId){
                results.push(current);
            }
            i++;
        }
        return results;
    }

    isContain(date){
        // startとendの日が含まれるようにする。
        return date.isAfter(this.startDate.clone().subtract(1, "days")) &&
            date.isBefore(this.endDate.clone().add(1, "days"));
    }

    highlightDay(date){
        if(!this.isContain(date)){
            throw new Error("指定された日付はこのテーブルに含まれません。");
        }
        var dayNum = this.getWeekNumber(date);
        this.doToColumn(dayNum, (jqueryObj)=>{
            if(!jqueryObj.hasClass("info")){
                jqueryObj.addClass("success");
            }
        });
    }

    doToColumn(columnNum, func){
        func($("#table{0}week{1}".format(this.uniqueId, columnNum)));
        for(var i = 0; i < 3; i++){
            func($("#table{0}w{1}p{2}".format(this.uniqueId, columnNum, i)))
        }
    }

    getWeekNumber(date){
        var dayNum = null;
        for(var day = 0; day < 5; day++){
            if(this.days[day].date.isSame(date, "day")){
                dayNum = day;
            }
        }
        if(dayNum == null){
            throw new Error("日付が見つかりませんでした。");
        }
        return dayNum;
    }
}

class Subject{
    constructor(id, name, shortName){
        this.id = id;
        this.name = name;
        this.shortName = shortName;   
    }

    static parse(data){
        var id = data.id;
        var name = data.name;
        var shortName = data.short_name;
        return new Subject(id, name, shortName);
    }

    equalTo(subject){
        return this.id == subject.id;
    }
}

class Day{
    constructor(date, periods){
        this.date = date;
        this.periods = periods;
    }
}

class Period{
    constructor(subject){
        this.subject = subject;
        this.event = null;
    }

    addEvent(event){
        if(event == undefined){
            this.event = null;
        }
        else{
            this.event = event;
        }
    }
}

class Event{
    constructor(id, date, eventType, subjectId, text){
        this.id = id;
        this.date = date;
        this.eventType = eventType;
        this.subjectId = subjectId;
        this.text = text;
    }

    static parse(data){
        var id = data["id"];
        var date = moment(data["date"], "YYYY-MM-DD");
        var eventType = data["eventtype"];
        var subjectId = data["subject_id"];
        var text = data["text"];
        return new Event(id, date, eventType, subjectId, text);
    }
}

App.main();