import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import api from "../../../api/AxiosInterceptor";
import ENDPOINTS from "../../../Utils/Endpoints";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const start = useMemo(() => currentMonth.clone().startOf("month").startOf("week"), [currentMonth]);
  const end = useMemo(() => currentMonth.clone().endOf("month").endOf("week"), [currentMonth]);

  const days = useMemo(() => {
    const dayList = [];
    const day = start.clone();
    while (day.isBefore(end) || day.isSame(end, "day")) {
      dayList.push(day.clone());
      day.add(1, "day");
    }
    return dayList;
  }, [start, end]);

  const postsByDate = useMemo(() => {
    const map = {};
    for (const p of posts) {
      const d = moment(p.date).format("YYYY-MM-DD");
      if (!map[d]) map[d] = [];
      map[d].push(p);
    }
    return map;
  }, [posts]);

  const selectedPosts = postsByDate[selectedDate] || [];

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await api.get({ url: ENDPOINTS.OTHER.GET_POSTS });
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const gotoPrev = () => setCurrentMonth((m) => m.clone().subtract(1, "month"));
  const gotoNext = () => setCurrentMonth((m) => m.clone().add(1, "month"));
  const gotoToday = () => {
  const today = moment();
    setCurrentMonth(today.clone());
    setSelectedDate(today.format("YYYY-MM-DD"));
  };

  const onScheduleNew = () => {
    try {
      localStorage.setItem("draft_schedule_date", selectedDate);
      // Default time 09:00; user can change in Content Library
      localStorage.setItem("draft_schedule_time", "09:00");
    } catch (_) {}
    navigate("/content-library");
  };

  const renderDayCell = (day) => {
    const key = day.format("YYYY-MM-DD");
    const isCurrentMonth = day.isSame(currentMonth, "month");
    const isToday = day.isSame(moment(), "day");
    const isSelected = key === selectedDate;
    const count = postsByDate[key]?.length || 0;

    return (
      <button
        key={key}
        onClick={() => setSelectedDate(key)}
        className={`p-3 rounded-md text-left border transition-colors ${
          isSelected ? "border-primaryColor" : "border-gray"
        } ${
          isCurrentMonth ? "bg-white dark:bg-backgroundDark" : "bg-InputFieldColor opacity-70"
        } ${isToday ? "ring-2 ring-primaryColor" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isCurrentMonth ? "text-black dark:text-white" : "text-gray-500"}`}>
            {day.format("D")}
          </span>
          {count > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primaryColor text-white">{count}</span>
          )}
        </div>
        <div className="mt-2 space-y-1">
          {(postsByDate[key] || []).slice(0, 2).map((p) => (
            <div key={p._id} className="truncate text-[11px] text-gray-600 dark:text-gray-300">
              {moment(p.date).format("HH:mm")} · {p.platform}
            </div>
          ))}
          {count > 2 && (
            <div className="text-[10px] text-gray-500">+{count - 2} more</div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={gotoPrev} className="px-2 py-1 rounded border">‹</button>
          <h2 className="mx-2 font-semibold text-black dark:text-white">{currentMonth.format("MMMM YYYY")}</h2>
          <button onClick={gotoNext} className="px-2 py-1 rounded border">›</button>
          <button onClick={gotoToday} className="ml-3 px-2 py-1 rounded border">Today</button>
        </div>
        <button onClick={onScheduleNew} className="px-3 py-2 rounded-md text-white bg-primaryColor">Schedule New</button>
      </div>

      {error ? (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      ) : null}

      <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
        <div className="md:col-span-2">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => renderDayCell(d))}
        </div>
      </div>

        <div className="bg-white dark:bg-backgroundDark rounded-md p-4 shadow-custom">
          <h3 className="text-black dark:text-white font-semibold mb-2">
            {moment(selectedDate).format("dddd, MMM D")}
          </h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : selectedPosts.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">No posts scheduled.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-auto custom-scrollbar">
              {selectedPosts
                .slice()
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((p) => (
                  <div key={p._id} className="p-3 rounded border border-gray bg-InputFieldColor">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-black dark:text-white">{p.platform}</span>
                      <span className="text-gray-600">{moment(p.date).format("HH:mm")}</span>
                    </div>
                    {p.image ? (
                      <div className="mt-2 h-32 overflow-hidden rounded">
                        <img src={p.image} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    {p.description ? (
                      <p className="mt-2 text-xs text-gray-700 line-clamp-2">{p.description}</p>
                    ) : null}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
