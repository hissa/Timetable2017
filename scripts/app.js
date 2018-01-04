class App{

    static main(){
        App.login(()=>{
            App.makeNavbar();
            App.showingWeek = 0;
            App.hourOfNextDay = 15;
            App.today = App.getToday();
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
        var start = date.clone().add(App.showingWeek, "weeks").day("Monday");
        var end = start.clone().day("Friday");
        App.timetable = new Timetable(start, end, ()=>{
            App.removeShowing();
            App.timetable.setAddEventEvent((date, subject, eventType, text)=>{
                text = text == undefined ?  null : text;
                var event = new Event(null, date, eventType, subject, text);
                var accesser = new ServerAccesser();
                accesser.submitNewEvent(event, ()=>{
                    App.showTimetable();
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

App.main();