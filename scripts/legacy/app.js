"use strict";
exports.__esModule = true;
/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/moment/moment.d.ts" /> 
/// <reference path="ServerAccesser.ts" />
// import * as moment from 'moment';
var moment_1 = require("moment");
var App = (function () {
    function App() {
    }
    App.Main = function () {
        var accesser = new ServerAccesser();
        var schedule = accesser.GetSchedules(function (data) {
            console.log(data);
        });
        var timetable = new Timetable(moment_1["default"]());
        alert();
    };
    App.MakeTimetable = function (firstDay) {
    };
    return App;
}());
var Timetable = (function () {
    function Timetable(firstDate) {
        this.StartDate = firstDate;
        this.EndDate = firstDate.add(4, "days");
        console.log(this);
    }
    return Timetable;
}());
var Day = (function () {
    function Day(date, periods) {
        this.Date = date;
        this.Periods = periods;
    }
    return Day;
}());
var Period = (function () {
    function Period(subject, event) {
        this.Subject = subject;
        this.Event = event;
    }
    return Period;
}());
var EventTypes;
(function (EventTypes) {
    EventTypes[EventTypes["Report"] = 0] = "Report";
    EventTypes[EventTypes["Watch"] = 1] = "Watch";
    EventTypes[EventTypes["Other"] = 2] = "Other";
    EventTypes[EventTypes["None"] = 3] = "None";
})(EventTypes || (EventTypes = {}));
var Event = (function () {
    function Event(eventType, text) {
        this.EventType = eventType;
        this.Text = text;
    }
    return Event;
}());
var Subject = (function () {
    function Subject(id, name, shortName) {
        this.Id = id;
        this.Name = name;
        this.ShortName = shortName;
    }
    return Subject;
}());
App.Main();
alert();
