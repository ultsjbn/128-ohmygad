import { MapPin, Calendar, Clock4 } from "lucide-react";

interface Event {
  id: string;
  date: string;
  title: string;
  location: string;
  time: string;
  status: string;
}

const eventsData: Event[] = [
  {
    id: "1",
    date: "February 27, 2026",
    title: "Event Title",
    location: "Location, UPB",
    time: "9:00 AM - 12:00 PM",
    status: "Status",
  },
  {
    id: "2",
    date: "March 6, 2026",
    title: "Event Title",
    location: "Location, UPB",
    time: "9:00 AM - 12:00 PM",
    status: "Status",
  },
  {
    id: "3",
    date: "March 15, 2026",
    title: "Event Title",
    location: "UPB Main Hall",
    time: "1:00 PM - 4:00 PM",
    status: "Status",
  },
];

export const EventPanel = (): JSX.Element => {
  return (

    <div className="flex flex-col gap-6 h-full font-clash">
      
      {/* HEADER*/}
      <div className="flex justify-between items-center shrink-0 pt-2">
        <h1 className="text-4xl font-black tracking-tight text-black">Events</h1>
        
        <div className="flex gap-2">
          <button className="h-10 px-6 bg-[#FF90E8] text-black border-2 border-black rounded-full font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105 active:translate-y-0.5">
            Upcoming
          </button>
          <button className="h-10 px-6 bg-black text-white rounded-full font-bold text-sm transition-transform hover:scale-105">
            Past
          </button>
        </div>
      </div>

      {/* SCROLLABLE LIST*/}
      <div className="flex flex-col gap-8 overflow-y-auto pr-4 pb-24 pt-4 custom-scrollbar ">
        {eventsData.map((event) => (
          <div key={event.id} className="flex flex-col xl:flex-row items-start gap-4">
            
            {/* DATE LABEL*/}
            <div className="flex items-center gap-2 pt-2 min-w-[160px] shrink-0">
              <Calendar size={18} strokeWidth={2.5} className="text-black" />
              <span className="text-sm font-bold">{event.date}</span>
            </div>

            {/* EVENT CARD*/}
            <div className="flex-1 w-full flex flex-col md:flex-row justify-between gap-6 p-5 rounded-[24px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] bg-fractal-decorative-purple-90">
              
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-black leading-tight">{event.title}</h2>

                <div className="flex flex-col gap-2 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} strokeWidth={2.5} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock4 size={16} strokeWidth={2.5} />
                    <span>{event.time}</span>
                  </div>
                </div>

                <button className="w-fit h-9 px-6 bg-white border-2 border-black rounded-full font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-y-0.5 transition-all">
                  {event.status}
                </button>
              </div>
              
              <div className="w-full md:w-48 h-48 bg-gray-50 border-2 border-black rounded-xl shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};