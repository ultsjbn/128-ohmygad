import { useState } from "react";
import { MapPin, Clock4 } from "lucide-react";
import { Typography } from "./typography";

// const STATUS_STYLES = {
//   Going: {
//     bg: "bg-emerald-50",
//     text: "text-emerald-700",
//     dot: "bg-emerald-500",
//     border: "border-emerald-200",
//   },
//   Interested: {
//     bg: "bg-amber-50",
//     text: "text-amber-700",
//     dot: "bg-amber-500",
//     border: "border-amber-200",
//   },
//   "Not Going": {
//     bg: "bg-red-50",
//     text: "text-red-600",
//     dot: "bg-red-400",
//     border: "border-red-200",
//   },
//   Pending: {
//     bg: "bg-gray-50",
//     text: "text-gray-500",
//     dot: "bg-gray-400",
//     border: "border-gray-200",
//   },
// };

// function StatusBadge({ status }) {
//   const style = STATUS_STYLES[status] || STATUS_STYLES["Pending"];
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
//       style={{ fontSize: "11px", letterSpacing: "0.01em" }}
//     >
//       <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
//       {status}
//     </span>
//   );
// }

export default function EventCard({ event }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative flex items-stretch gap-0 rounded-2xl overflow-hidden"
      style={{
        background: "#EEEAF8",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        maxWidth: 600,
        minHeight: 112,
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Left: content */}
      <div
        className="flex flex-col justify-between p-4"
        style={{ flex: 1, minWidth: 0 }}
      >
        {/* Title */}
        <Typography variant="heading-4">{event.title}</Typography>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div
            className="flex items-center gap-1.5 text-gray-500"
            style={{ fontSize: "12.5px" }}
          >
            <MapPin size={18} className="text-fractal-icon-dark"/>
            <Typography variant="body-2">{event.location}</Typography>
          </div>
          <div
            className="flex items-center gap-1.5 text-gray-500"
            style={{ fontSize: "12.5px" }}
          >
            <Clock4 size={18} className="text-fractal-icon-dark"/>
            <span>
              {event.startTime} – {event.endTime}
            </span>
          </div>
        </div>

        {/* Status badge */}
        {/* <StatusBadge status={event.status} /> */}
      </div>

      {/* Right pic */}
      <div
        className="flex-shrink-0 m-3 rounded-xl overflow-hidden"
        style={{ width: 100, height: "auto", minHeight: 100 }}
      >
        {!imgError ? (
          <img
            src={event.image}
            alt={event.title}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.6)",
              color: "#bbb",
              fontSize: 11,
            }}
          >
            No image
          </div>
        )}
      </div>
    </div>
  );
}