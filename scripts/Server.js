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