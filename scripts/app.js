class App{

    static main(){
        App.showingWeek = 0;
        App.hourOfNextDay = 15;
        App.today = App.getToday();
        console.log("today: {0}".format(App.today.format("YYYY-MM-DD")));
        App.showTimetable();
        App.showPagination();
    }

    static getToday(date = null){
        date = date == null ? moment() : date;
        if(date.format("H") >= App.hourOfNextDay){
            date.add(1, "days");
        }
        if(date.format("d") == 0){
            date.add(1, "days");
        }
        if(date.format("d") == 6){
            date.add(2, "days");
        }
        return date;
    }

    static showPagination(){
        App.pagination = new TimetablePagination(
            "今週を表示", "前の週へ", "次の週へ"
        );
        App.pagination.makePagination($("#timetablePagination"));
        App.pagination.setFuncCenter(()=>{App.setZeroShowingWeek();});
        App.pagination.setFuncPrevious(()=>{App.subtractShowingWeek();});
        App.pagination.setFuncNext(()=>{App.addShowingWeek();});
    }

    static showTimetable(){
        App.removeShowing();
        var date = App.today.clone();
        console.log("showingWeek:{0}".format(App.showingWeek));
        var start = date.clone().add(App.showingWeek, "weeks").day("Monday");
        var end = start.clone().day("Friday");
        console.log("showing start:{0} end:{1}"
            .format(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")));
        App.timetable = new Timetable(start, end, ()=>{
            App.removeShowing();
            App.timetable.makeTimetable($("#timetable"));
            App.timetable.makeEventList($("#eventlist"));
            if(App.timetable.isContain(App.today)){
                App.timetable.highlightDay(App.today);
            }
        });
    }

    static removeShowing(){
        $("#timetable").empty();
        $("#eventlist").empty();
    }

    static addShowingWeek(num = 1){
        App.showingWeek += num;
        App.showTimetable();
    }

    static subtractShowingWeek(num = 1){
        App.showingWeek -= num;
        App.showTimetable();
    }

    static setZeroShowingWeek(){
        App.showingWeek = 0;
        App.showTimetable();
    }
}

class TimetablePagination{    
    constructor(center = "", previous = "", next = ""){
        this.paginationObject = null;
        this.UniqueId = TimetablePagination.getUniqueId();
        this.center = center;
        this.previous = previous;
        this.next = next;
        this.linkCenter = "#";
        this.linkPrevious = "#";
        this.linkNext = "#";
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
                .wrapInner("<a href=\"{0}\" />".format(this.linkPrevious));
        $("#{0}".format(this.idNameCenter)).text(this.center)
                .wrapInner("<a href=\"{0}\" />".format(this.linkCenter));
        $("#{0}".format(this.idNameNext)).text(this.next)
                .wrapInner("<a href=\"{0}\" />".format(this.linkNext));
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

    setFuncCenter(func){
        $("#{0}".format(this.idNameCenter)).off("click").on("click", func);
    }

    setFuncPrevious(func){
        $("#{0}".format(this.idNamePrevious)).off("click").on("click", func);
    }

    setFuncNext(func){
        $("#{0}".format(this.idNameNext)).off("click").on("click", func);
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
        this.submitNewEventUrl = "api/v1/submit_new_event.php";
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

    submitNewEvent(event, callback){
        var data = {
            "date": event.date.format("YYYY-MM-DD"),
            "subject_id": event.subject.id,
            "event_type": event.eventType,
            "text": event.text
        };
        this.post(this.submitNewEventUrl, data, (data)=>{
            callback();
        });
    }

    post(url, data, success){
        $.post(url, data, (data, textStatus)=>{
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
    }

    setSubjectNames(shortName = false){
        for(var week = 0; week < 5; week++){
            var day = this.days[week];
            for(var period = 0; period < 3; period++){
                if(day == undefined){
                    console.log(this.days);
                }
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
        console.log(this.eventsData);
        this.ready();
    }

    searchEvents(date, subjectId){
        var i = 0;
        var results = [];
        while(this.eventsData[i]){
            var current = this.eventsData[i];
            if(current.date.isSame(date, "day") && current.subject.id == subjectId){
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

    clearHilightDay(){
        this.doToAllCell((jqueryObj)=>{
            if(jqueryObj.hasClass("success")){
                jqueryObj.removeClass("success");
            }
        });
    }

    doToColumn(columnNum, func){
        func($("#table{0}week{1}".format(this.uniqueId, columnNum)));
        for(var i = 0; i < 3; i++){
            func($("#table{0}w{1}p{2}".format(this.uniqueId, columnNum, i)))
        }
    }

    doToAllCell(func){
        func($("#table{0}topleft".format(this.uniqueId)));
        for(var i = 0; i < 5; i++){
            func($("#table{0}week{1}".format(this.uniqueId, i)));
            for(var j = 0; j < 3; j++){
                func($("#table{0}w{1}p{2}".format(this.uniqueId, i, j)));
                func($("#table{0}numhead{1}".format(this.uniqueId, j + 1)));
            }
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

    makeEventList(tableObject){
        tableObject.append("<thead id=\"table{0}eventlistThead\" />".format(this.uniqueId))
            .append("<tbody id=\"table{0}eventlistTbody\" />".format(this.uniqueId));
        $("#table{0}eventlistThead".format(this.uniqueId))
            .append("<tr id=\"table{0}eventlistTheadTr\" />".format(this.uniqueId));
        $("#table{0}eventlistTheadTr".format(this.uniqueId))
            .append("<th id=\"table{0}eventlistHead{1}\">{2}</th>"
                .format(this.uniqueId, "Date", "日付"))
            .append("<th id=\"table{0}eventlistHead{1}\">{2}</th>"
                .format(this.uniqueId, "Subject", "教科"))
            .append("<th id=\"table{0}eventlistHead{1}\">{2}</th>"
                .format(this.uniqueId, "Text", "詳細"));
        var i =0;
        while(this.eventsData[i]){
            $("#table{0}eventlistTbody".format(this.uniqueId))
                .append("<tr id=\"table{0}eventlistId{1}\" />"
                    .format(this.uniqueId, this.eventsData[i].id));
            $("#table{0}eventlistId{1}".format(this.uniqueId, this.eventsData[i].id))
                .append("<td id=\"table{0}eventlistId{1}{2}\">{3}</td>"
                    .format(this.uniqueId, this.eventsData[i].id, "Date",
                            this.eventsData[i].date.format("MM / DD")))
                .append("<td id=\"table{0}eventlistId{1}{2}\">{3}</td>"
                    .format(this.uniqueId, this.eventsData[i].id, "Subject",
                            this.eventsData[i].subject.shortName))
                .append("<td id=\"table{0}eventlistId{1}{2}\">{3}</td>"
                    .format(this.uniqueId, this.eventsData[i].id, "Text",
                            this.eventsData[i].text));
            i++;
        }
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
    constructor(id, date, eventType, subject, text){
        this.id = id;
        this.date = date;
        this.eventType = eventType;
        this.subject = subject;
        this.text = text;
    }

    static parse(data){
        var id = data["id"];
        var date = moment(data["date"], "YYYY-MM-DD");
        var eventType = data["eventtype"];
        var subject = Subject.parse(data["subject"]);
        var text = data["text"];
        return new Event(id, date, eventType, subject, text);
    }
}

App.main();