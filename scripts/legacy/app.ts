/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
/// <reference path="../node_modules/moment/moment.d.ts" /> 
/// <reference path="ServerAccesser.ts" />
// import * as moment from 'moment';
import moment from "moment";

    class App {
        public static Main(): void {
            var accesser = new ServerAccesser();
            var schedule = accesser.GetSchedules((data: any) => {
                console.log(data);
            });
            var timetable = new Timetable(moment());
            alert();
        }

        public static MakeTimetable(firstDay: moment.Moment): void {

        }
    }

    class Timetable {
        private ScheduleData:Subject[][];
        private EventsData:Event[];
        public Days:Day[];
        private FirstDate:moment.Moment;
        public StartDate:moment.Moment;
        public EndDate:moment.Moment;
        
        constructor(firstDate:moment.Moment){
            this.StartDate = firstDate;
            this.EndDate = firstDate.add(4, "days");
            console.log(this);
        }
    }

    class Day {
        public Date:moment.Moment;
        public Periods:Period[];
        
        constructor(date:moment.Moment, periods:Period[]){
            this.Date = date;
            this.Periods = periods;
        }
    }

    class Period{
        public Subject:Subject;
        public Event:Event;

        constructor(subject:Subject, event:Event){
            this.Subject = subject;
            this.Event = event;
        }
    }

    enum EventTypes{Report, Watch, Other, None}
    class Event {
        public EventType:EventTypes;
        public Text:string;

        constructor(eventType:EventTypes, text:string){
            this.EventType = eventType;
            this.Text = text;
        }
    }

    class Subject {
        public Id: number;
        public Name: string;
        public ShortName: string;

        constructor(id: number, name: string, shortName: string) {
            this.Id = id;
            this.Name = name;
            this.ShortName = shortName;
        }
    }


App.Main();
alert();