class App{

    static main(){
        App.login(()=>{
            App.makeNavbar();
            App.showingWeek = 0;
            App.hourOfNextDay = 15;
            App.today = App.getToday();
            console.log("today: {0}".format(App.today.format("YYYY-MM-DD")));
            App.showTimetable();
            App.showPagination();
        });
    }

    static login(callback){
        var accesser = new ServerAccesser();
        if(!accesser.loggedIn){
            App.tryAutoLogin((success)=>{
                if(!success){
                    var loginModal = new LoginModal((data)=>{
                        accesser.login(data.id, data.password, data.enableAutoLogin, (status)=>{
                            if(status.status == "error"){
                                loginModal.showError(status.errorInfo);
                            }else{
                                loginModal.hide();
                                callback();
                            }
                        });
                    }, (data)=>{
                        if(data.password == data.rePassword){
                            accesser.newAccount(data.id, data.name, data.password, (status)=>{
                                if(status.status == "error"){
                                    // 失敗したときの処理
                                    loginModal.showErrorNewAccount(status.errorInfo);
                                }else{
                                    // 成功したときの処理
                                    loginModal.makeLoginForm();
                                    loginModal.info("アカウントを作成しました。", "success");
                                }
                            });
                        }else{
                            // パスワードの確認が一致しない場合の処理
                            loginModal.showErrorNewAccount(
                                "パスワードとパスワードの確認が一致しません。",
                                ["password", "rePassword"]
                            );
                        }
                    });
                loginModal.make($("body"));
                loginModal.show();
                }else{
                    callback();
                }
            });
        }else{
            callback();
        }
    }

    static logout(callback){
        ServerAccesser.logout(()=>{
            location.reload();
        });
    }

    static tryAutoLogin(callback){
        var accesser = new ServerAccesser();
        accesser.autoLogin((status)=>{
            if(status.status == "success"){
                callback(true);
            }else{
                callback(false);
            }
        });
    }

    static makeNavbar(){
        App.navbar = new NavigationBar($("#navbar"));
        App.navbar.make();
        App.navbar.title("WEB版時間割2017");
        App.navbar.logoutButtonFunction(()=>{
            App.logout();
        }); 
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
            App.timetable.setAddEventEvent((date, subject, eventType, text)=>{
                text = text == undefined ?  null : text;
                var event = new Event(null, date, eventType, subject, text);
                var accesser = new ServerAccesser();
                accesser.submitNewEvent(event, ()=>{
                    App.showTimetable();
                    console.log("submitted");
                });
            });
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
        // App.closeAllPopover();
        App.showingWeek += num;
        App.showTimetable();
    }

    static subtractShowingWeek(num = 1){
        // App.closeAllPopover();
        App.showingWeek -= num;
        App.showTimetable();
    }

    static setZeroShowingWeek(){
        // App.closeAllPopover();
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
        this.loggedIn = false;
        this.accessId = null;
        this.accessKey = null;
        this.getLoginInfo();
        this.getSchedulesUrl = "api/v1/get_schedule.php";
        this.getEventListUrl = "api/v1/get_eventlist.php";
        this.submitNewEventUrl = "api/v1/submit_new_event.php";
        this.loginUrl = "api/v1/login.php";
        this.autoLoginUrl = "api/v1/auto_login.php";
        this.newAccountUrl = "api/v1/new_account.php";
    }

    getLoginInfo(){
        if(Cookies.get("access_id") != undefined){
            this.loggedIn = true;
            this.accessId = Cookies.get("access_id");
            this.accessKey = Cookies.get("access_key");
        }
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

    login(id, password, enableAutoLogin, callback){
        var data = {
            "id": id,
            "password": password,
            "enable_auto_login": enableAutoLogin ? 1 : 0
        };
        this.post(this.loginUrl, data, (jsonData)=>{
            var data = JSON.parse(jsonData);
            if(data["status"] == "error"){
                callback({status: "error", errorInfo: data["error_info"]});
                return;
            }
            Cookies.set("access_id", data["access_id"], { expires: 1 });
            Cookies.set("access_key", data["access_key"], { expires: 1 });
            if(data["auto_login_id"] != undefined){
                Cookies.set("auto_login_id", data["auto_login_id"], { expires:30 });
                Cookies.set("auto_login_key", data["auto_login_key"], { expires:30 });
            }
            this.getLoginInfo();
            callback({status: "success"});
            return;
        })
    }

    hasAutoLoginKeys(){
        return Cookies.get("auto_login_id") != undefined && Cookies.get("auto_login_key")
    }

    autoLogin(callback){
        if(!this.hasAutoLoginKeys()){
            callback({
                status: "error",
                errorInfo: "必要な情報がありません。"
            });
            return;
        }
        var data = {
            "auto_login_id": Cookies.get("auto_login_id"),
            "auto_login_key": Cookies.get("auto_login_key")
        };
        this.post(this.autoLoginUrl, data, (jsonData)=>{
            var data = JSON.parse(jsonData);
            if(data["status"] == "error"){
                callback({status: "error", errorInfo: data["error_info"]});
                return;
            }
            Cookies.set("access_id", data["access_id"], { expires: 1 });
            Cookies.set("access_key", data["access_key"], { expires: 1 });
            Cookies.set("auto_login_key", data["new_auto_login_key"], { expires: 30 });
            this.getLoginInfo();
            callback({status: "success"});
            return;
        });
    }

    static logout(callback){
        Cookies.remove("access_id");
        Cookies.remove("access_key");
        Cookies.remove("auto_login_id");
        Cookies.remove("auto_login_key");
        callback();
    }

    newAccount(id, name, password, callback){
        var data = {
            "id": id,
            "name": name,
            "password": password
        };
        this.post(this.newAccountUrl, data, (jsonData)=>{
            var data = JSON.parse(jsonData);
            if(data.status == "success"){
                callback({status: data.status });
                return;
            }
            callback({status: data.status, errorInfo: data.error_info});
        })
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
        this.setClickEvents();
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

    setClickEvents(){
        for(var week = 0; week < 5; week++){
            for(var period = 0; period < 3; period++){
                var periodData = {
                    weekNum: week,
                    periodNum: period,
                    date: this.days[week].date,
                    period: this.days[week].periods[period]
                    
                };
                $("#table{0}w{1}p{2}".format(this.uniqueId, week, period))
                    .off("click").on("click", periodData, (e)=>{
                        console.log("Clicked week: {0}, period: {1}".format(e.data.weekNum, e.data.periodNum));
                        console.log(e.data.period);
                        var modal = new TimetableModal(e.data.date, e.data.period);
                        modal.make($("#modals"));
                        if(this.addEventEvent != undefined){
                            modal.setAddEventEvent(this.addEventEvent);
                        }
                        modal.show();
                    });
            }
        }
    }

    setAddEventEvent(func){
        this.addEventEvent = func;
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
        this.doToAllCells((jqueryObj)=>{
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

    doToAllCells(func){
        func($("#table{0}topleft".format(this.uniqueId)));
        for(var i = 0; i < 5; i++){
            func($("#table{0}week{1}".format(this.uniqueId, i)));
            for(var j = 0; j < 3; j++){
                func($("#table{0}w{1}p{2}".format(this.uniqueId, i, j)));
                func($("#table{0}numhead{1}".format(this.uniqueId, j + 1)));
            }
        }
    }

    doToPeriodCells(func){
        for(var i = 0; i < 5; i++){
            for(var j = 0; j < 3; j++){
                func($("#table{0}w{1}p{2}".format(this.uniqueId, i, j)),
                        i, j);
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

class TimetableModal{
    constructor(date, period){
        this.date = date;
        this.period = period;
        this.uniqueId = TimetableModal.getUniqueId();
        this.idName = "timetableModal{0}".format(this.uniqueId);
        this.title = this.period.subject.name;
    }

    make(modalsJqueryObj){
        modalsJqueryObj.append("<div id=\"{0}\" />".format(this.idName));
        $("#{0}".format(this.idName))
            .addClass("modal fade")
            .attr({"tabindex": "-1"})
            .append("<div id=\"{0}dialog\" />".format(this.idName));
        $("#{0}dialog".format(this.idName))
            .addClass("modal-dialog")
            .append("<div id=\"{0}content\" />".format(this.idName));
        $("#{0}content".format(this.idName))
            .addClass("modal-content")
            .append("<div id=\"{0}header\" />".format(this.idName))
            .append("<div id=\"{0}body\" />".format(this.idName))
            .append("<div id=\"{0}footer\" />".format(this.idName));
        this.makeHeader($("#{0}header".format(this.idName)));
        this.makeBody($("#{0}body".format(this.idName)));
        this.makeFooter($("#{0}footer".format(this.idName)));
    }

    makeHeader(jqueryObj){
        jqueryObj
            .addClass("modal-header")
            .append(this.title)
            .append("<button id=\"{0}closeButton\" />".format(this.idName));
        $("#{0}closeButton".format(this.idName))
            .addClass("close")
            .attr({
                "type": "button",
                "data-dismiss": "modal"
            })
            .append("<span>×</span>");
    }

    makeBody(jqueryObj){
        jqueryObj
            .addClass("modal-body")
            .append("<table id=\"{0}eventlist\" />".format(this.idName));
        var eventlistTable = $("#{0}eventlist".format(this.idName));
        eventlistTable.addClass("table");
        // TODO: 複数のイベントに対応する
        if(this.period.event != null){
            eventlistTable
                .append("<tr><td>{0}</td><td>{1}</td></tr>"
                    .format(this.period.event.eventTypeForShow, this.period.event.text));
        }
    }

    makeFooter(jqueryObj){
        jqueryObj
            .addClass("modal-footer")
            .append("<button id=\"{0}closeModalButton\" />".format(this.idName))
            .append("<button id=\"{0}addEventButton\" />".format(this.idName));
        $("#{0}addEventButton".format(this.idName))
            .addClass("btn btn-primary")
            .append("イベントを追加")
            .on("click", (e)=>{
                this.makeAddEventForm();
            });
        $("#{0}closeModalButton".format(this.idName))
            .addClass("btn btn-default")
            .append("閉じる")
            .on("click", (e)=>{
                this.hide();
            });
    }

    show(){
        $("#{0}".format(this.idName)).modal("show");
    }

    hide(){
        $("#{0}".format(this.idName)).modal("hide");
    }

    destroy(){
        $("#{0}".format(this.idName)).remove();
    }

    static getUniqueId(){
        if(TimetableModal.usedUniqueId == null){
            TimetableModal.usedUniqueId = 0;
        }
        var toUse = TimetableModal.usedUniqueId;
        TimetableModal.usedUniqueId++;
        return toUse;
    }
    
    setAddEventEvent(func){
        this.addEventFunc = func;
    }

    makeAddEventForm(){
        this.makeAddEventFormBody($("#{0}body".format(this.idName)));
        $("#{0}addEventButton".format(this.idName))
            .off("click")
            .on("click", (e)=>{
                console.log($("[name={0}typeRadios]:checked".format(this.idName)).val());
                console.log($("#{0}textboxInput".format(this.idName)).val());
                this.deligateAddEventForm();
                if(this.addEventFunc != undefined){
                    this.addEventFunc(
                        this.date,
                        this.period.subject,
                        $("[name={0}typeRadios]:checked".format(this.idName)).val(),
                        $("#{0}textboxInput".format(this.idName)).val()
                    );
                    this.hide();
                }
            });
    }

    deligateAddEventForm(){
        if($("[name={0}typeRadios]:checked".format(this.idName)).val() == undefined){
            $("#{0}eventTypeRadiosFormGroup".format(this.idName))
                .addClass("has-error");
        }else{
            $("#{0}eventTypeRadiosFormGroup".format(this.idName))
                .removeClass("has-error");
        }
    }

    makeAddEventFormBody(jqueryObj){
        jqueryObj
            .empty()
            .append("<div id=\"{0}eventTypeRadiosFormGroup\" />".format(this.idName))
            .append("<div id=\"{0}textFormGroup\" />".format(this.idName));
        $("#{0}eventTypeRadiosFormGroup".format(this.idName))
            .append("<label id=\"{0}eventTypeRadiosLabel\">課題の種類</label>"
                .format(this.idName))
            .append("<div id=\"{0}radioReport\" />".format(this.idName))
            .append("<div id=\"{0}radioWatch\" />".format(this.idName))
            .append("<div id=\"{0}radioOther\" />".format(this.idName));
        var radiosCommonAttr = {
            "type": "radio",
            "name": "{0}typeRadios".format(this.idName),
        }
        $("#{0}radioReport".format(this.idName))
            .addClass("radio")
            .append("<label><input id=\"{0}inputRadioReport\">レポート</label>"
                .format(this.idName));
        $("#{0}inputRadioReport".format(this.idName))
            .attr({ "value": "report" })
            .attr(radiosCommonAttr);
        $("#{0}radioWatch".format(this.idName))
            .addClass("radio")
            .append("<label><input id=\"{0}inputRadioWatch\">放送視聴</label>"
                .format(this.idName));
        $("#{0}inputRadioWatch".format(this.idName))
            .attr({ "value": "watch" })
            .attr(radiosCommonAttr);
        $("#{0}radioOther".format(this.idName))
            .addClass("radio")
            .append("<label><input id=\"{0}inputRadioOther\">その他</label>"
                .format(this.idName));
        $("#{0}inputRadioOther".format(this.idName))
            .attr({ "value": "other" })
            .attr(radiosCommonAttr);
        $("#{0}textFormGroup".format(this.idName))
            .addClass("form-group")
            .append("<label id=\"{0}textboxLabel\" />".format(this.idName))
            .append("<input id=\"{0}textboxInput\">".format(this.idName));
        $("#{0}textboxLabel".format(this.idName))
            .attr({ "for": "{0}textboxInput".format(this.idName) })
            .text("追加情報");
        $("#{0}textboxInput".format(this.idName))
            .addClass("form-control")
            .attr({
                "type": "text",
                "placeholder": "追加の情報があれば記入してください。"
            });
    }
}

class LoginModal{
    constructor(loginFunc, newAccountFunc){
        this.loginFunc = loginFunc;
        this.newAccountFunc = newAccountFunc;
    }

    make(modalsJqueryObj){
        modalsJqueryObj
            .append("<div id=\"loginModal\" />");
        $("#loginModal")
            .addClass("modal fade")
            .attr({ "tabindex": "-1" })
            .append("<div id=\"loginModalDialog\" />");
        $("#loginModalDialog")
            .addClass("modal-dialog")
            .append("<div id=\"loginModalContent\" />");
        $("#loginModalContent")
            .addClass("modal-content")
            .append("<div id=\"loginModalHeader\" />")
            .append("<div id=\"loginModalBody\" />")
            .append("<div id=\"loginModalFooter\" />");
        this.makeLoginForm();
    }

    info(text, status = "info"){
        $("#loginModalInfo").remove();
        $("#loginModalBody").prepend("<div id=\"loginModalInfo\" />");
        $("#loginModalInfo")
            .addClass("alert alert-{0}".format(status))
            .attr({ "role": "alert" })
            .text(text);
    }

    makeLoginForm(){
        this.makeHeader($("#loginModalHeader"));
        this.makeBody($("#loginModalBody"));
        this.makeFooter($("#loginModalFooter"));
    }

    makeHeader(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-header")
            .append("ログイン");
    }

    makeBody(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-body")
            .append("<div id=\"loginModalIdFormGroup\" />")
            .append("<div id=\"loginModalPasswordFormGroup\" />")
            .append("<div id=\"loginModalSaveCheckbox\" />");
        $("#loginModalIdFormGroup")
            .addClass("form-group")
            .append("<label id=\"loginModalIdLabel\" />")
            .append("<input id=\"loginModalIdInput\" />");
        $("#loginModalIdLabel")
            .attr({ "for": "loginModalIdInput" })
            .text("ID");
        $("#loginModalIdInput")
            .attr({
                "type": "text",
                "placeholder": "IDを入力してください。"
            })
            .addClass("form-control");
        $("#loginModalPasswordFormGroup")
            .addClass("form-group")
            .append("<label id=\"loginModalPasswordLabel\" />")
            .append("<input id=\"loginModalPasswordInput\" />");
        $("#loginModalPasswordLabel")
            .attr({ "for": "loginModalPasswordInput" })
            .text("パスワード");
        $("#loginModalPasswordInput")
            .attr({
                "type": "password",
                "placeholder": "パスワードを入力してください。"
            })
            .addClass("form-control");
        $("#loginModalSaveCheckbox")
            .append("<label id=\"loginModalSaveLabel\" />");
        $("#loginModalSaveLabel")
            .append("<input id=\"loginModalSaveCheckboxInput\" />")
            .append("ログイン状態を保存");
        $("#loginModalSaveCheckboxInput")
            .attr({
                "type": "checkbox",
                "value": "saveLogedIn"
            });
    }

    makeFooter(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-footer")
            .append("<button id=\"loginModalNewAccountButton\" />")
            .append("<button id=\"loginModalLoginButton\" />");
        $("#loginModalNewAccountButton")
            .addClass("btn btn-default pull-left")
            .append("新しいアカウントを作成する")
            .off("click")
            .on("click", (e)=>{
                this.makeNewAccountForm();
            });
        $("#loginModalLoginButton")
            .addClass("btn btn-primary")
            .append("ログイン")
            .off("click")
            .on("click", (e)=>{
                var data = {
                    id: $("#loginModalIdInput").val(),
                    password: $("#loginModalPasswordInput").val(),
                    enableAutoLogin: $("#loginModalSaveCheckboxInput").prop("checked")
                }
                this.loginFunc(data);
            });
    }

    show(){
        $("#loginModal").modal("show");
    }

    hide(){
        $("#loginModal").modal("hide");
    }

    destroy(){
        $("#loginModal").remove();
    }

    showError(text, errorInputs = []){
        $("#loginModalAlert").remove();
        if(text.indexOf("ID") >= 0){
            errorInputs.push("id");
        }
        if(text.indexOf("パスワード") >= 0){
            errorInputs.push("password");
        }
        console.log(errorInputs);
        $("#loginModalBody").append("<div id=\"loginModalAlert\" />");
        $("#loginModalAlert")
            .addClass("alert alert-danger")
            .attr({ "role": "alert" })
            .text(text);
        this.resetInputError();
        if(errorInputs.indexOf("id") >= 0){
            $("#loginModalIdFormGroup").addClass("has-error");
        }
        if(errorInputs.indexOf("password") >= 0){
            $("#loginModalPasswordFormGroup").addClass("has-error");
        }
    }

    showErrorNewAccount(text, errorInputs = []){
        if(text.indexOf("ID") >= 0){
            errorInputs.push("id");
        }
        if(text.indexOf("表示名") >= 0){
            errorInputs.push("name");
        }
        if(text.indexOf("パスワード") >= 0){
            errorInputs.push("password");
            errorInputs.push("rePassword");
        }
        $("#loginModalBody").append("<div id=\"loginModalAlert\" />");
        $("#loginModalAlert")
            .addClass("alert alert-danger")
            .attr({ "role": "alert" })
            .text(text);
        this.resetInputErrorNewAccount();
        if(errorInputs.indexOf("id") >= 0){
            $("#loginModalIdFormGroup").addClass("has-error");
        }
        if(errorInputs.indexOf("name") >= 0){
            $("#loginModalNameFormGroup").addClass("has-error");
        }
        if(errorInputs.indexOf("password") >= 0){
            $("#loginModalPasswordFormGroup").addClass("has-error");
        }
        if(errorInputs.indexOf("rePassword") >= 0){
            $("#loginModalRePasswordFormGroup").addClass("has-error");
        }
    }

    resetInputErrorNewAccount(){
        $("#loginModalIdFormGroup").removeClass("has-error");
        $("#loginModalNameFormGroup").removeClass("has-error");
        $("#loginModalPasswordFormGroup").removeClass("has-error");
        $("#loginModalRePasswordFormGroup").removeClass("has-error");
    }

    resetInputError(){
        $("#loginModalIdFormGroup").removeClass("has-error");
        $("#loginModalPasswordFormGroup").removeClass("has-error");
    }

    makeNewAccountBody(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-body")
            .append("<div id=\"loginModalIdFormGroup\" />")
            .append("<div id=\"loginModalNameFormGroup\" />")
            .append("<div id=\"loginModalPasswordFormGroup\" />")
            .append("<div id=\"loginModalRePasswordFormGroup\" />")
        $("#loginModalIdFormGroup")
            .addClass("form-group")
            .append("<label id=\"loginModalIdLabel\" />")
            .append("<input id=\"loginModalIdInput\" />");
        $("#loginModalIdLabel")
            .attr({ "for": "loginModalIdInput" })
            .text("ID");
        $("#loginModalIdInput")
            .attr({
                "type": "text",
                "placeholder": "IDを入力してください。"
            })
            .addClass("form-control");
        $("#loginModalNameFormGroup")
            .addClass("form-group")
            .append("<label id=\"loginModalNameLabel\" />")
            .append("<input id=\"loginModalNameInput\" />");
        $("#loginModalNameLabel")
            .attr({ "for": "loginModalNameInput" })
            .text("表示名");
        $("#loginModalNameInput")
            .attr({
                "type": "text",
                "placeholder": "表示名を入力してください。"
            })
            .addClass("form-control");
        $("#loginModalPasswordFormGroup")
            .addClass("form-group")
            .append("<label id=\"loginModalPasswordLabel\" />")
            .append("<input id=\"loginModalPasswordInput\" />");
        $("#loginModalPasswordLabel")
            .attr({ "for": "loginModalPasswordInput" })
            .text("パスワード");
        $("#loginModalPasswordInput")
            .attr({
                "type": "password",
                "placeholder": "パスワードを入力してください。"
            })
            .addClass("form-control");
        $("#loginModalRePasswordFormGroup")
            .addClass("form-group")
            .append("<label id=\"loginModalRePasswordLabel\" />")
            .append("<input id=\"loginModalRePasswordInput\" />");
        $("#loginModalRePasswordLabel")
            .attr({ "for": "loginModalRePasswordInput" })
            .text("パスワードの確認");
        $("#loginModalRePasswordInput")
            .attr({
                "type": "password",
                "placeholder": "確認のためもう一度パスワードを入力してください。"
            })
            .addClass("form-control");
    }

    makeNewAccountHeader(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-header")
            .append("新規アカウント作成");
    }

    makeNewAccountFooter(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-footer")
            .append("<button id=\"loginModalBackButton\" />")
            .append("<button id=\"loginModalCreateAccountButton\" />");
        $("#loginModalBackButton")
            .addClass("btn btn-default pull-left")
            .append("戻る")
            .off("click")
            .on("click", (e)=>{
                this.makeLoginForm();
            });
        $("#loginModalCreateAccountButton")
            .addClass("btn btn-primary")
            .append("確定")
            .off("click")
            .on("click", (e)=>{
                var data = {
                    id: $("#loginModalIdInput").val(),
                    name: $("#loginModalNameInput").val(),
                    password: $("#loginModalPasswordInput").val(),
                    rePassword: $("#loginModalRePasswordInput").val()
                }
                this.newAccountFunc(data);
            });
    }

    makeNewAccountForm(){
        this.makeNewAccountBody($("#loginModalBody"));
        this.makeNewAccountHeader($("#loginModalHeader"));
        this.makeNewAccountFooter($("#loginModalFooter"));
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
        this.eventTypeForShow = Event.getEventTypeForShow(eventType);
        this.subject = subject;
        this.text = text;
    }

    static getEventTypeForShow(eventType){
        var et = eventType;
        return et == "watch" ? "放送視聴" : et == "report" ? "レポート" : "その他";
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

class NavigationBar{
    constructor(jqueryObj){
        this.navbarObject = jqueryObj;
        this.loginButtonFunc = null;
    }

    make(){
        this.navbarObject.append("<div id=\"navbarContainer\" />");
        $("#navbarContainer")
            .addClass("container-fluid")
            .append("<div id=\"navbarHeader\" />")
            .append("<div id=\"navbarCollapse\" />");
        $("#navbarHeader")
            .addClass("navbar-header")
            .append("<span id=\"navbarTitle\" />");
        $("#navbarTitle").addClass("navbar-brand");
        $("#navbarCollapse")
            .addClass("collapse navbar-collapse")
            .append("<button id=\"navbarLogoutButton\" />");
        $("#navbarLogoutButton")
            .addClass("btn btn-default navbar-btn navbar-right")
            .text("ログアウト");
    }

    title(title){
        $("#navbarTitle").text(title);
    }
    
    logoutButtonFunction(func){
        $("#navbarLogoutButton").off("click").on("click", func);
    }
}

App.main();