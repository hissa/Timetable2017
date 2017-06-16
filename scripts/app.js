class App{

    static main(){
        var start = moment("2017-04-17", "YYYY-MM-DD");
        var end = moment("2017-04-21", "YYYY-MM-DD");
        App.timetables = [];
        App.timetables.push(new Timetable(start, end));
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
    constructor(startDate, endDate){
        this.uniqueId = Timetable.getUniqueId;
        this.startDate = startDate;
        this.endDate = endDate;
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

    }

    getUniqueId(){
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