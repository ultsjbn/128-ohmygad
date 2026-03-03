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
    time: "9:00 AM - 12:OO PM",
    status: "Status",
  },
  {
    id: "2",
    date: "March 6, 2026",
    title: "Event Title",
    location: "Location, UPB",
    time: "9:00 AM - 12:OO PM",
    status: "Status",
  },
];

export const EventPanel = (): JSX.Element => {
  return (
    <div className="flex flex-col w-[913px] h-[632px] items-start gap-[var(--primitives-size-spacing-4)] pt-[var(--primitives-size-spacing-3)] pr-[var(--primitives-size-spacing-2)] pb-[var(--primitives-size-spacing-3)] pl-[var(--primitives-size-spacing-2)] relative bg-primitives-color-brand-body-light rounded-[var(--primitives-size-radius-m)] border border-solid border-primitives-color-brand-secondary shadow-brutal-shadow-1">
      <div className="flex items-center gap-5 pr-[var(--primitives-size-spacing-2)] pl-[var(--primitives-size-spacing-2)] py-0 relative self-stretch w-full flex-[0_0_auto]">

        <button className="all-[unset] box-border inline-flex h-12 items-center justify-center gap-[var(--primitives-size-spacing-2)] pt-[var(--primitives-size-spacing-1)] pr-[var(--primitives-size-spacing-3)] pb-[var(--primitives-size-spacing-1)] pl-[var(--primitives-size-spacing-3)] relative flex-[0_0_auto] bg-primitives-color-brand-primary rounded-[var(--primitives-size-radius-rounded)]">
          <span className="relative w-fit font-body-body-1-median font-[number:var(--body-body-1-median-font-weight)] text-primitives-color-brand-secondary text-[length:var(--body-body-1-median-font-size)] text-center tracking-[var(--body-body-1-median-letter-spacing)] leading-[var(--body-body-1-median-line-height)] whitespace-nowrap [font-style:var(--body-body-1-median-font-style)]">
            Upcoming
          </span>
        </button>

        <button className="all-[unset] box-border inline-flex h-12 items-center justify-center gap-[var(--primitives-size-spacing-2)] pt-[var(--primitives-size-spacing-1)] pr-[var(--primitives-size-spacing-3)] pb-[var(--primitives-size-spacing-1)] pl-[var(--primitives-size-spacing-3)] relative flex-[0_0_auto] bg-primitives-color-brand-secondary rounded-[var(--primitives-size-radius-rounded)]">
          <span className="relative w-fit font-body-body-1-median font-[number:var(--body-body-1-median-font-weight)] text-white text-[length:var(--body-body-1-median-font-size)] text-center tracking-[var(--body-body-1-median-letter-spacing)] leading-[var(--body-body-1-median-line-height)] whitespace-nowrap [font-style:var(--body-body-1-median-font-style)]">
            Past
          </span>
        </button>
      </div>

      {eventsData.map((event) => (
        <article
          key={event.id}
          className="items-start gap-[var(--primitives-size-spacing-4)] self-stretch w-full flex-[0_0_auto] flex relative"
        >
          <div className="w-[235px] flex items-center gap-[15px] px-[5px] py-0 relative">
            <Calendar className="!relative !w-6 !h-6" />
            <time className="relative flex items-center w-fit font-body-body-1-regular font-[number:var(--body-body-1-regular-font-weight)] text-black text-[length:var(--body-body-1-regular-font-size)] tracking-[var(--body-body-1-regular-letter-spacing)] leading-[var(--body-body-1-regular-line-height)] whitespace-nowrap [font-style:var(--body-body-1-regular-font-style)]">
              {event.date}
            </time>
          </div>

          <div className="flex-col w-[600px] h-[226px] items-center justify-center gap-4 pt-[var(--primitives-size-spacing-2)] pr-[var(--primitives-size-spacing-3)] pb-[var(--primitives-size-spacing-2)] pl-[var(--primitives-size-spacing-3)] bg-primitives-color-decorative-purple-90 rounded-[var(--primitives-size-radius-m)] border border-solid border-primitives-color-brand-secondary flex relative">
            <div className="flex h-[188px] items-center relative self-stretch w-full">
              <div className="relative w-[313px] h-[184px]">
                <div className="flex w-[313px] items-start gap-10 absolute top-0 left-0">
                  <h2 className="items-center flex-1 h-12 mt-[-1.00px] font-heading-h4 font-[number:var(--heading-h4-font-weight)] text-black text-[length:var(--heading-h4-font-size)] tracking-[var(--heading-h4-letter-spacing)] leading-[var(--heading-h4-line-height)] flex relative [font-style:var(--heading-h4-font-style)]">
                    {event.title}
                  </h2>
                </div>

                <div className="flex flex-col w-[313px] h-[120px] items-start justify-center gap-[15px] absolute top-16 left-0">
                  <div className="self-stretch w-full flex-[0_0_auto] mt-[-3.00px] flex items-center gap-[15px] px-[5px] py-0 relative">
                    <MapPin className="!relative !w-6 !h-6" />
                    <address className="relative flex items-center w-fit font-body-body-1-regular font-[number:var(--body-body-1-regular-font-weight)] text-black text-[length:var(--body-body-1-regular-font-size)] tracking-[var(--body-body-1-regular-letter-spacing)] leading-[var(--body-body-1-regular-line-height)] whitespace-nowrap [font-style:var(--body-body-1-regular-font-style)] not-italic">
                      {event.location}
                    </address>
                  </div>

                  <div className="w-[257px] flex-[0_0_auto] flex items-center gap-[15px] px-[5px] py-0 relative">
                    <Clock4 className="!relative !w-6 !h-6" />
                    <time className="relative flex items-center w-fit font-body-body-1-regular font-[number:var(--body-body-1-regular-font-weight)] text-black text-[length:var(--body-body-1-regular-font-size)] tracking-[var(--body-body-1-regular-letter-spacing)] leading-[var(--body-body-1-regular-line-height)] whitespace-nowrap [font-style:var(--body-body-1-regular-font-style)]">
                      {event.time}
                    </time>
                  </div>

                  <button className="all-[unset] box-border inline-flex h-12 items-center justify-center gap-[var(--primitives-size-spacing-2)] pt-[var(--primitives-size-spacing-1)] pr-[var(--primitives-size-spacing-3)] pb-[var(--primitives-size-spacing-1)] pl-[var(--primitives-size-spacing-3)] relative mb-[-3.00px] bg-primitives-color-base-white rounded-[var(--primitives-size-radius-rounded)] border border-solid border-black">
                    <span className="relative w-fit font-body-body-1-median font-[number:var(--body-body-1-median-font-weight)] text-primitives-color-brand-secondary text-[length:var(--body-body-1-median-font-size)] text-center tracking-[var(--body-body-1-median-letter-spacing)] leading-[var(--body-body-1-median-line-height)] whitespace-nowrap [font-style:var(--body-body-1-median-font-style)]">
                      {event.status}
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative w-[239px] h-[184px] bg-white border border-solid border-black" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
