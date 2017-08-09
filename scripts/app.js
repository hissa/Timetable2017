class App{

    static main(){
        App.login(()=>{
            App.makeNavbar();
            App.showingWeek = 0;
            App.hourOfNextDay = 15;
            App.today = App.getToday();
            console.log("today: {0}".format(App.today.format("YYYY-MM-DD")));
            App.showTimetable();
            Timetable.makeAddEventButton();
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
                            accesser.newAccount(data.id, data.name, data.password, data.inviteKey ,(status)=>{
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
        var accesser = new ServerAccesser();
        var account = accesser.getUserInfo((data)=>{
            console.log(data);
            var id = data["user_id"];
            var name = data["user_name"];
            App.navbar.addLoginInfo(id, name);
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
        this.getUserInfoUrl = "api/v1/get_account_info.php";
        this.getSubjectListUrl = "api/v1/get_subjectlist.php";
    }

    getLoginInfo(){
        if(Cookies.get("access_id") != undefined){
            this.loggedIn = true;
            this.accessId = Cookies.get("access_id");
            this.accessKey = Cookies.get("access_key");
        }
    }

    getUserInfo(callback){
        this.getLoginInfo();
        this.post(this.getUserInfoUrl, {
            "access_id": this.accessId,
            "access_key": this.accessKey
        },(data)=>{
            callback(JSON.parse(data));
        });
    }

    getSchedule(callback){
        this.getLoginInfo();
        var reqStr = "?access_id={0}&access_key={1}"
            .format(this.accessId, this.accessKey);
        this.getJson(this.getSchedulesUrl + reqStr, (data)=>{
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
        this.getLoginInfo();
        var startStr = start.format("YYYY-MM-DD");
        var endStr = end.format("YYYY-MM-DD");
        var getReqStr = "?start={0}&end={1}&access_id={2}&access_key={3}"
        .format(startStr, endStr, this.accessId, this.accessKey);
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
        this.getLoginInfo();
        var data = {
            "date": event.date.format("YYYY-MM-DD"),
            "subject_id": event.subject.id,
            "event_type": event.eventType,
            "text": event.text,
            "access_id": this.accessId,
            "access_key": this.accessKey
        };
        this.post(this.submitNewEventUrl, data, (data)=>{
            callback();
        });
    }

    getSubjectList(callback){
        this.getLoginInfo();
        var url = "{0}?access_id={1}&access_key={2}"
            .format(this.getSubjectListUrl, this.accessId, this.accessKey);
        this.getJson(url, (data)=>{
            var subjects = [];
            data.forEach((value)=>{
                subjects.push(Subject.parse(value));
            });
            callback(subjects);
            return;
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

    newAccount(id, name, password, inviteKey, callback){
        var data = {
            "id": id,
            "name": name,
            "password": password,
            "invite_key": inviteKey
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

    static makeAddEventButton(){
        var accesser = new ServerAccesser();
        accesser.getSubjectList((data)=>{
            Timetable.subjectList = data;
            console.log(data);
        });
        $("#addEventButton")
            .addClass("btn btn-primary btn-block")
            .text("日付と教科を指定して課題を追加")
            .css({ "margin-bottom": "20px" })
            .on("click", ()=>{
                var modal = new AddEventModal(Timetable.subjectList);
                modal.make($("#modals"));
                modal.show();
            });
    }

    makeTimetable(tableObject){
        var weeks = ["月", "火", "水", "木", "金"];
        tableObject.append("<thead id=\"table{0}thead\" />".format(this.uniqueId));
        $("#table{0}thead".format(this.uniqueId))
            .append("<tr id=\"table{0}headShowDaytr\" />".format(this.uniqueId))
            .append("<tr id=\"table{0}headtr\" />".format(this.uniqueId));
        // $("#table{0}headtr".format(this.uniqueId))
        //     .append("<th id=\"table{0}topleft\" />".format(this.uniqueId));
        for(var i = 0; i < 5; i++){
            $("#table{0}headtr".format(this.uniqueId))
                .append("<th id=\"table{0}week{1}\">{2}</th>"
                    .format(this.uniqueId, i, weeks[i]));
        }
        // $("#table{0}headShowDaytr".format(this.uniqueId))
        //     .append("<td id=\"table{0}showDaytopleft\" />".format(this.uniqueId));
        var nowMonth = null;
        for(var i = 0; i < 5; i++){
            var day = this.startDate.clone();
            day.add(i, "day");
            var text = "";
            if(nowMonth == null || nowMonth != day.format("M")){
                text = day.format("M/D");
                nowMonth = day.format("M");
            }else{
                text = day.format("D");
            }
            $("#table{0}headShowDaytr".format(this.uniqueId))
                .append("<td id=\"table{0}showDay{1}\">{2}</td>"
                    .format(this.uniqueId, i, text));
        }
        tableObject.append("<tbody id=\"table{0}tbody\" />".format(this.uniqueId));
        for(var period = 0; period <= 2; period++){
            $("#table{0}tbody".format(this.uniqueId))
                .append("<tr id=\"table{0}tr{1}\" />".format(this.uniqueId, period));
            for(var week = 0; week <= 5; week++){
                if(week == 0){
                    // $("#table{0}tr{1}".format(this.uniqueId, period))
                    //     .append("<th id=\"table{0}numhead{1}\">{1}</th>"
                    //         .format(this.uniqueId, period + 1));
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
        var settingjson = Cookies.get("settings");
        var shortName = false;
        if(settingjson != undefined){
            var settings = JSON.parse(settingjson);
            var shortName = settings.useShortSubjectName;
        }
        for(var week = 0; week < 5; week++){
            var day = this.days[week];
            for(var period = 0; period < 3; period++){
                if(day == undefined){
                    console.log(this.days);
                }
                if(!shortName){
                    $("#table{0}w{1}p{2}".format(this.uniqueId, week, period))
                        .text(day.periods[period].subject.name);
                }else{
                    $("#table{0}w{1}p{2}".format(this.uniqueId, week, period))
                        .text(day.periods[period].subject.shortName);
                }
            }
        }
    }

    setEvents(){
        for(var week = 0; week < 5; week++){
            var day = this.days[week];
            for(var period = 0; period < 3; period++){
                if(day.periods[period].events[0] != undefined){
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
                newPeriod.addEvents(events);
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
        var i = 0;
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
        var DoW = ["日", "月", "火", "水", "木", "金", "土"];
        this.datestr = this.date.format("M/D({0}) ".format(DoW[this.date.format("d")]));
        this.title = this.datestr + this.period.subject.name;
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
        eventlistTable.addClass("table table-bordered")
            .append("<thead id=\"{0}eventlistThead\" />".format(this.idName))
            .append("<tbody id=\"{0}eventlistTbody\" />".format(this.idName));
        var eventlistTbody = $("#{0}eventlistTbody".format(this.idName));
        $("#{0}eventlistThead".format(this.idName))
            .append("<tr><th>種類</th><th>詳細</th></tr>");
        var i = 0;
        while(this.period.events[i] != undefined){
            eventlistTbody
                .append("<tr><td>{0}</td><td>{1}</td></tr>"
                    .format(this.period.events[i].eventTypeForShow, this.period.events[i].text));
            i++;
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
                this.deligateAddEventForm();
                if(this.addEventFunc != undefined){
                    this.addEventFunc(
                        this.date,
                        this.period.subject,
                        this.eventTypeRadioGroup.checked,
                        this.eventTextBox.value
                    );
                    this.hide();
                }
            });
    }

    deligateAddEventForm(){
        if(this.eventTypeRadioGroup.checked == null){
            this.eventTypeRadioGroup.setValidationColor("error");
        }else{
            this.eventTypeRadioGroup.clearValidationColor();
        }
    }

    makeAddEventFormBody(jqueryObj){
        this.eventTypeRadioGroup 
            = new RadioButtonGroup("課題の種類", ["レポート", "放送視聴", "その他"]);
        this.eventTextBox
            = new TextBoxForm("追加情報", false, "追加の情報があれば記入してください。");
        jqueryObj.empty();
        this.eventTypeRadioGroup.make(jqueryObj);
        this.eventTextBox.make(jqueryObj);
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
        this.idTextBox = new TextBoxForm("ID", false, "IDを入力してください。");
        this.passwordTextBox = new TextBoxForm("パスワード", true, "パスワードを入力してください。");
        this.keepLoginCheckbox = new CheckBox("ログイン状態を保存");
        jqueryObj
            .empty()
            .addClass("modal-body");
        this.idTextBox.make(jqueryObj);
        this.passwordTextBox.make(jqueryObj);
        this.keepLoginCheckbox.make(jqueryObj);
    }

    makeFooter(jqueryObj){
        jqueryObj
            .empty()
            .addClass("modal-footer")
            .append("<button id=\"loginModalNewAccountButton\" />")
            .append("<button id=\"loginModalLoginButton\" />");
        $("#loginModalNewAccountButton")
            .addClass("btn btn-default pull-left")
            .append("新規アカウント作成")
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
                    id: this.idTextBox.value,
                    password: this.passwordTextBox.value,
                    enableAutoLogin: this.keepLoginCheckbox.isChecked
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
        $("#loginModalBody").append("<div id=\"loginModalAlert\" />");
        $("#loginModalAlert")
            .addClass("alert alert-danger")
            .attr({ "role": "alert" })
            .text(text);
        this.idTextBox.clearValidationColor();
        this.passwordTextBox.clearValidationColor();
        if(errorInputs.indexOf("id") >= 0){
            this.idTextBox.setValidationColor("error");
        }
        if(errorInputs.indexOf("password") >= 0){
            this.passwordTextBox.setValidationColor("error");
        }
    }

    showErrorNewAccount(text, errorInputs = []){
        if(text.indexOf("招待コード") >= 0){
            errorInputs.push("inviteKey");
        }
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
        this.naIdTextBox.clearValidationColor();
        this.naNameTextBox.clearValidationColor();
        this.naPasswordTextBox.clearValidationColor();
        this.naRePasswordTextBox.clearValidationColor();
        this.naInviteKeyTextBox.clearValidationColor();
        if(errorInputs.indexOf("id") >= 0){
            this.naIdTextBox.setValidationColor("error");
        }
        if(errorInputs.indexOf("name") >= 0){
            this.naNameTextBox.setValidationColor("error");
        }
        if(errorInputs.indexOf("password") >= 0){
            this.naPasswordTextBox.setValidationColor("error");
        }
        if(errorInputs.indexOf("rePassword") >= 0){
            this.naRePasswordTextBox.setValidationColor("error");
        }
        if(errorInputs.indexOf("inviteKey") >= 0){
            this.naInviteKeyTextBox.setValidationColor("error");
        }
    }

    resetInputErrorNewAccount(){
        $("#loginModalIdFormGroup").removeClass("has-error");
        $("#loginModalNameFormGroup").removeClass("has-error");
        $("#loginModalPasswordFormGroup").removeClass("has-error");
        $("#loginModalRePasswordFormGroup").removeClass("has-error");
    }

    makeNewAccountBody(jqueryObj){
        this.naInviteKeyTextBox =
            new TextBoxForm("招待コード", false, "招待コードを入力してください。");
        this.naIdTextBox =
            new TextBoxForm("ID", false, "IDを入力してください。");
        this.naNameTextBox =
            new TextBoxForm("表示名", false, "表示名を入力してください。");
        this.naPasswordTextBox =
            new TextBoxForm("パスワード", true, "パスワードを入力してください。");
        this.naRePasswordTextBox =
            new TextBoxForm("パスワードの確認", true, 
                "確認のためもう一度パスワードを入力してください。");
        jqueryObj.empty().addClass("modal-body");
        this.naInviteKeyTextBox.make(jqueryObj);
        this.naIdTextBox.make(jqueryObj);
        this.naNameTextBox.make(jqueryObj);
        this.naPasswordTextBox.make(jqueryObj);
        this.naRePasswordTextBox.make(jqueryObj);
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
                    id: this.naIdTextBox.value,
                    name: this.naNameTextBox.value,
                    password: this.naPasswordTextBox.value,
                    rePassword: this.naRePasswordTextBox.value,
                    inviteKey: this.naInviteKeyTextBox.value
                };
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
        this.events = [];
    }

    addEvent(event){
        if(event == undefined){
            this.events = null;
        }
        else{
            this.events = event;
        }
    }
    
    addEvents(events){
        if(events == null){
            return;
        }
        events.forEach((value)=>{
            this.events.push(value);
        });
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

    static getEventTypeForTypeName(eventTypeName){
        var etn = eventTypeName;
        return etn == "放送視聴" ? "watch" : etn == "レポート" ? "report" : "other";
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
        this.userId = null;
        this.userName = null;
    }

    make(){
        this.navbarObject.append("<div id=\"navbarContainer\" />");
        $("#navbarContainer")
            .addClass("container-fluid")
            .append("<div id=\"navbarHeader\" />")
            .append("<div id=\"navbarCollapse\" />");
        $("#navbarHeader")
            .addClass("navbar-header")
            .append("<button id=\"navbarButton\" />")
            .append("<span id=\"navbarTitle\" />");
        $("#navbarTitle").addClass("navbar-brand");
        $("#navbarButton")
            .attr({
                "type": "button",
                "data-toggle": "collapse",
                "data-target": "#navbarCollapse"
            })
            .addClass("navbar-toggle collapsed");
        for(var i = 0; i < 3; i++){
            $("#navbarButton").append("<span class=\"icon-bar\" />");
        }
        $("#navbarCollapse")
            .addClass("collapse navbar-collapse")
            .append("<button id=\"navbarSettingButton\" />")
            .append("<button id=\"navbarLogoutButton\" />")
            .append("<p id=\"navbarLoginInfo\" />");
        $("#navbarLogoutButton")
            .addClass("btn btn-default navbar-btn navbar-right")
            .text("ログアウト");
        $("#navbarLoginInfo").addClass("navbar-right navbar-text");
        $("#navbarSettingButton")
            .addClass("btn btn-default navbar-btn navbar-right")
            .text("設定")
            .on("click", (e)=>{
                var settingModal = new SettingModal();
                settingModal.make($("#modals"));
                settingModal.show();
            });
    }

    title(title){
        $("#navbarTitle").text(title);
    }
    
    logoutButtonFunction(func){
        $("#navbarLogoutButton").off("click").on("click", func);
    }

    addLoginInfo(id, name){
        this.userId = id;
        this.userName = name;
        var text = "{0}({1})でログインしています。".format(this.userId, this.userName);
        $("#navbarLoginInfo").text(text);
    }
}

class TextBoxForm{
    constructor(label = "", isPassword = false, placeholder = ""){
        this._uniqueId = TextBoxForm.getUniqueId();
        this._label = label;
        this._type = isPassword ? "password" : "text";
        this._placeholder = placeholder;
        this._isMade = false;
        TextBoxForm._validationColors = ["success", "warning", "error"];
    }

    get label(){
        return this._label;
    }
    set label(value){
        this._label = value;
        if(this._isMade){
            this._labelObj.text(this._label);
        }
    }

    get isPassword(){
        return this._type == "password";
    }
    set isPassword(value){
        this._type = value ? "password" : "text";
        if(this._isMade){
            this._inputObj.attr({ "type": this._type });
        }
    }

    get placeholder(){
        return this._placeholder;
    }
    set placeholder(value){
        this._placeholder = value;
        if(this._isMade){
            this._inputObj.attr({ "placeholder": this._placeholder });
        }
    }

    get isMade(){
        return this._isMade;
    }

    get value(){
        if(!this._isMade){
            return null;
        }
        return this._inputObj.val();
    }

    get jqueryObj(){
        return this._inputObj;
    }

    make(ParentJqueryObj){
        ParentJqueryObj
            .append("<div id=\"textboxFormGroup{0}\" />".format(this._uniqueId));
        this._formGroupObj = $("#textboxFormGroup{0}".format(this._uniqueId));
        this._formGroupObj
            .append("<label id=\"textboxLabel{0}\" />".format(this._uniqueId))
            .append("<input id=\"textboxInput{0}\" />".format(this._uniqueId));
        this._labelObj = $("#textboxLabel{0}".format(this._uniqueId));
        this._inputObj = $("#textboxInput{0}".format(this._uniqueId));
        this._formGroupObj.addClass("form-group");
        this._labelObj
            .text(this._label)
            .attr({ "for": "textboxInput{0}".format(this._uniqueId) });
        this._inputObj
            .addClass("form-control")
            .attr({
                "type": this._type,
                "placeholder": this._placeholder
            });
        this._isMade = true;
    }

    setValidationColor(name){
        if(!TextBoxForm._isCorrectValidationColor(name)){
            return;
        }
        if(!this._isMade){
            return;
        }
        this._formGroupObj.addClass("has-{0}".format(name));
    }

    clearValidationColor(){
        if(!this._isMade){
            return;
        }
        TextBoxForm._validationColors.forEach((value)=>{
            this._formGroupObj.removeClass("has-{0}".format(value));
        });
    }

    static _isCorrectValidationColor(name){
        return TextBoxForm._validationColors.indexOf(name) >= 0;
    }

    static getUniqueId(){
        if(TextBoxForm.usedUniqueId == undefined){
            TextBoxForm.usedUniqueId = 0;
        }
        var ret = TextBoxForm.usedUniqueId;
        TextBoxForm.usedUniqueId++;
        return ret;
    }
}

class RadioButton{
    constructor(label = "", name = ""){
        this._uniqueId = RadioButton.getUniqueId();
        this._label = label;
        this._name = name;
        this._value = "radio" + this._uniqueId;
        this._isMade = false;
    }

    get label(){
        return this._label;
    }
    set label(value){
        this._label = value;
        if(!this._isMade){
            return;
        }
        this._labelSpanObj.text(this._label);
    }

    get isChecked(){
        if(!this._isMade){
            return undefined;
        }
        return $("input[name={0}]:checked".format(this._name)).val() === this._value;
    }

    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }

    get value(){
        return this._value;
    }
    set value(value){
        this._value = value;
    }

    get isMade(){
        return this._isMade;
    }

    make(ParentJqueryObj){
        ParentJqueryObj
            .append("<div id=\"radiobutton{0}\" />".format(this._uniqueId));
        $("#radiobutton{0}".format(this._uniqueId))
            .append("<label id=\"radiobuttonLabel{0}\" />".format(this._uniqueId));
        $("#radiobuttonLabel{0}".format(this._uniqueId))
            .append("<input id=\"radiobuttonInput{0}\">".format(this._uniqueId))
            .append("<span id=\"radiobuttonLabelSpan{0}\" />".format(this._uniqueId));
        this._divObj = $("#radiobutton{0}".format(this._uniqueId));
        this._inputObj = $("#radiobuttonInput{0}".format(this._uniqueId));
        this._labelSpanObj = $("#radiobuttonLabelSpan{0}".format(this._uniqueId));
        this._divObj.addClass("radio");
        this._inputObj.attr({
            "type": "radio",
            "name": this._name,
            "value": this._value
        });
        this._labelSpanObj.text(this._label);
        this._isMade = true;
    }

    select(){
        $("input[name={0}]".format(this._name)).val([this._value]);
    }

    static getUniqueId(){
        if(RadioButton.usedUniqueId == undefined){
            RadioButton.usedUniqueId = 0;
        }
        var ret = RadioButton.usedUniqueId;
        RadioButton.usedUniqueId++;
        return ret;
    }
}

class RadioButtonGroup{
    constructor(label = "", radioLabels = []){
        this._uniqueId = RadioButtonGroup.getUniqueId();
        this._radios = [];
        this._label = label;
        this._isMade = false;
        RadioButtonGroup._validationColors = ["success", "warning", "error"];
        radioLabels.forEach((value)=>{
            this._radios[value] 
                = new RadioButton(value, "radiogroup{0}".format(this._uniqueId));
        });
    }

    get label(){
        return this._label;
    }
    set label(value){
        this._label = value;
        if(!this._isMade){
            return;
        }
        this._labelObj.text(this._label);
    }

    get radios(){
        return this._radios;
    }

    get checked(){
        if(!this._isMade){
            return undefined;
        }
        var ret = null;
        Object.keys(this._radios).forEach((index)=>{
            if(this._radios[index].isChecked){
                ret = index;
            }
        });
        return ret;
    }

    get selected(){
        return this.checked;
    }

    make(ParentJqueryObj){
        ParentJqueryObj
            .append("<div id=\"radiogroup{0}\" />".format(this._uniqueId));
        this._radiogroupObj = $("#radiogroup{0}".format(this._uniqueId));
        this._radiogroupObj
            .append("<label id=\"radiogroupLabel{0}\" />".format(this._uniqueId));
        this._labelObj = $("#radiogroupLabel{0}".format(this._uniqueId));
        this._labelObj.text(this._label);
        Object.keys(this._radios).forEach((index)=>{
            this._radios[index].make(this._radiogroupObj);
        });
        this._isMade = true;
    }

    setValidationColor(name){
        if(!RadioButtonGroup._isCorrectValidationColor(name)){
            return;
        }
        if(!this._isMade){
            return;
        }
        this._radiogroupObj.addClass("has-{0}".format(name));
    }

    clearValidationColor(){
        if(!this._isMade){
            return;
        }
        RadioButtonGroup._validationColors.forEach((value)=>{
            this._radiogroupObj.removeClass("has-{0}".format(value));
        });
    }

    static _isCorrectValidationColor(name){
        return RadioButtonGroup._validationColors.indexOf(name) >= 0;
    }

    static getUniqueId(){
        if(RadioButtonGroup.usedUniqueId == undefined){
            RadioButtonGroup.usedUniqueId = 0;
        }
        var ret = RadioButtonGroup.usedUniqueId;
        RadioButtonGroup.usedUniqueId++;
        return ret;
    }
}

class CheckBox{
    constructor(label = ""){
        this._uniqueId = CheckBox.getUniqueId();
        this._label = label;
        this._value = "checkbox" + this._uniqueId;
        this._isMade = false;
    }

    get label(){
        return this._label;
    }
    set label(value){
        this._label = value;
        if(!this._isMade){
            return;
        }
        this._labelSpanObj.text(this._label);
    }

    get isChecked(){
        if(!this._isMade){
            return undefined;
        }
        return this._inputObj.prop("checked");
    }

    get value(){
        return this._value;
    }
    set value(value){
        this._value = value;
    }

    get isMade(){
        return this._isMade;
    }

    make(ParentJqueryObj){
        ParentJqueryObj
            .append("<div id=\"checkbox{0}\" />".format(this._uniqueId));
        $("#checkbox{0}".format(this._uniqueId))
            .append("<label id=\"checkboxLabel{0}\" />".format(this._uniqueId));
        $("#checkboxLabel{0}".format(this._uniqueId))
            .append("<input id=\"checkboxInput{0}\">".format(this._uniqueId))
            .append("<span id=\"checkboxLabelSpan{0}\" />".format(this._uniqueId));
        this._divObj = $("#checkbox{0}".format(this._uniqueId));
        this._inputObj = $("#checkboxInput{0}".format(this._uniqueId));
        this._labelSpanObj = $("#checkboxLabelSpan{0}".format(this._uniqueId));
        this._divObj.addClass("checkbox");
        this._inputObj.attr({
            "type": "checkbox",
            "value": this._value
        });
        this._labelSpanObj.text(this._label);
        this._isMade = true;
    }

    check(){
        this._inputObj.prop("checked", true);
    }

    uncheck(){
        this._inputObj.prop("checked", false);
    }

    static getUniqueId(){
        if(CheckBox.usedUniqueId == undefined){
            CheckBox.usedUniqueId = 0;
        }
        var ret = CheckBox.usedUniqueId;
        CheckBox.usedUniqueId++;
        return ret;
    }
}

class Selectbox{
    // items = [{value: xxx, text: xxx}, ...]
    constructor(label, items = []){
        this._uniqueId = Selectbox.getUniqueId();
        this._items = items;
        this._label = label;
    }

    get selected(){
        return this._inputObj.val();
    }

    make(ParentJqueryObj){
        ParentJqueryObj
            .append("<div id=\"selectbox{0}\" />".format(this._uniqueId));
        this._formGroupObj = $("#selectbox{0}".format(this._uniqueId));
        this._formGroupObj
            .append("<label id=\"selectboxLabel{0}\" />".format(this._uniqueId))
            .append("<select id=\"selectboxInput{0}\" />".format(this._uniqueId));
        this._labelObj = $("#selectboxLabel{0}".format(this._uniqueId));
        this._inputObj = $("#selectboxInput{0}".format(this._uniqueId));
        this._items.forEach((value)=>{
            this._inputObj
                .addClass("form-control")
                .append("<option value=\"{0}\">{1}</option>"
                    .format(value.value, value.text));
        });
        this._labelObj.text(this._label);
    }

    static getUniqueId(){
        if(Selectbox.usedUniqueId == undefined){
            Selectbox.usedUniqueId = 0;
        }
        var ret = Selectbox.usedUniqueId;
        Selectbox.usedUniqueId++;
        return ret;
    }
}

class Modal{
    constructor(){
        this._uniqueId = Modal.getUniqueId();
        this._title = "";
    }

    get title(){
        return this._title;
    }
    set title(value){
        this._title = value;
    }

    make(modalsJqueryObj){
        modalsJqueryObj
            .append("<div id=\"modal{0}\" />".format(this._uniqueId));
        $("#modal{0}".format(this._uniqueId))
            .addClass("modal fade")
            .attr({ "tabindex": "-1" })
            .append("<div id=\"modalDialog{0}\" />".format(this._uniqueId));
        $("#modalDialog{0}".format(this._uniqueId))
            .addClass("modal-dialog")
            .append("<div id=\"modalContent{0}\" />".format(this._uniqueId));
        $("#modalContent{0}".format(this._uniqueId))
            .addClass("modal-content")
            .append("<div id=\"modalHeader{0}\" />".format(this._uniqueId))
            .append("<div id=\"modalBody{0}\" />".format(this._uniqueId))
            .append("<div id=\"modalFooter{0}\" />".format(this._uniqueId));
        this._headerObj = $("#modalHeader{0}".format(this._uniqueId));
        this._bodyObj = $("#modalBody{0}".format(this._uniqueId));
        this._footerObj = $("#modalFooter{0}".format(this._uniqueId));
        this._headerObj.addClass("modal-header");
        this._bodyObj.addClass("modal-body");
        this._footerObj.addClass("modal-footer");
        this._makeHeader();
        this._makeBody();
        this._makeFooter();
    }

    _makeHeader(){
        this._headerObj
            .append("<button id=\"modalCloseButton{0}\" />".format(this._uniqueId));
        $("#modalCloseButton{0}".format(this._uniqueId))
            .addClass("close")
            .attr({
                "type": "button",
                "data-dismiss": "modal"
            })
            .text("×");
        this._headerObj
            .append("<h4 class=\"modal-title\">{0}</h4>".format(this._title));
    }

    _makeBody(){}

    _makeFooter(){}

    show(){
        $("#modal{0}".format(this._uniqueId)).modal("show");
    }

    hide(){
        $("#modal{0}".format(this._uniqueId)).modal("hide");
    }

    static getUniqueId(){
        if(Modal.usedUniqueId == undefined){
            Modal.usedUniqueId = 0;
        }
        var ret = Modal.usedUniqueId;
        Modal.usedUniqueId++;
        return ret;
    }
}

class SettingModal extends Modal{
    constructor(){
        super();
        this._title = "設定";
        var settingsjson = Cookies.get("settings");
        if(settingsjson != undefined){
            this._settings = JSON.parse(settingsjson);
        }
    }

    _makeBody(){
        this._useShortNameCheckbox = 
            new CheckBox("短い教科名で表示する");
        this._useShortNameCheckbox.make(this._bodyObj);
        if(this._settings != undefined 
            && this._settings.useShortSubjectName){
            this._useShortNameCheckbox.check();
        }
    }

    _makeFooter(){
        this._footerObj
            .append("<button id=\"settingModalEnterButton{0}\" />"
                .format(this._uniqueId));
        $("#settingModalEnterButton{0}".format(this._uniqueId))
            .addClass("btn btn-primary")
            .append("設定を保存")
            .on("click", (e)=>{
                this._saveSettings();
                this.hide();
                location.reload();
            });
    }

    _saveSettings(){
        var settings = {
            useShortSubjectName: this._useShortNameCheckbox.isChecked
        };
        Cookies.set("settings", JSON.stringify(settings));
    }
}

class AddEventModal extends Modal{
    constructor(subjectList = []){
        super();
        this._title = "課題を追加";
        this._subjectList = subjectList;
    }

    get subjectList(){
        return this._subjectList;
    }
    set subjectList(value){
        this._subjectList = value;
    }

    _makeBody(){
        this._dateTextBox = new TextBoxForm("日付", false, "日付を指定してください。");
        this._selectList = [];
        this._subjectList.forEach((value)=>{
            this._selectList.push({value: value.id, text: value.name});
        });
        this._subjectSelectBox = new Selectbox("教科", this._selectList);
        this._eventTypeRadios = new RadioButtonGroup("課題の種類", [
            "レポート", "放送視聴", "その他"
        ]);
        this._eventTextBox = 
            new TextBoxForm("追加情報", false, "追加の情報があれば記入してください。");
        this._dateTextBox.make(this._bodyObj);
        this._dateTextBox.jqueryObj.flatpickr({disableMobile: "true"});
        this._subjectSelectBox.make(this._bodyObj);
        this._eventTypeRadios.make(this._bodyObj);
        this._eventTextBox.make(this._bodyObj);
    }

    _makeFooter(){
        this._footerObj
            .append("<button id=\"addEventSubmitButton{0}\" />"
                .format(this._uniqueId));
        $("#addEventSubmitButton{0}".format(this._uniqueId))
            .addClass("btn btn-primary")
            .append("課題を追加")
            .on("click", (e)=>{
                var subjectId = this._subjectSelectBox.selected;
                var subject = new Subject(subjectId, null, null);
                var date = moment(this._dateTextBox.value);
                var eventType = 
                    Event.getEventTypeForTypeName(this._eventTypeRadios.selected);
                var text = this._eventTextBox.value;
                var event = new Event(null, date, eventType, subject, text);
                var accesser = new ServerAccesser();
                accesser.submitNewEvent(event, ()=>{
                    App.showTimetable();
                    this.hide();
                });
            });
    }
}

App.main();