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