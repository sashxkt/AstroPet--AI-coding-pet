import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const COLORS = {
  green: "#43cea2",
  yellow: "#ffe066", 
  red: "#ff6b6b"
};

const MOOD_LABELS = {
  green: "Good",
  yellow: "Okay", 
  red: "Bad"
};

function getTodayKey(date: Date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function isSameDay(date1: Date, date2: Date) {
  return getTodayKey(date1) === getTodayKey(date2);
}

export default function Journal() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [logData, setLogData] = useState<{ [date: string]: { mood: string; note?: string } }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");
  const [viewMode, setViewMode] = useState<'log' | 'view'>('log');
  
  const today = new Date();
  const todayKey = getTodayKey(today);
  const selectedDateKey = getTodayKey(selectedDate);

  // Set selected color and note when date changes
  useEffect(() => {
    const dayData = logData[selectedDateKey];
    setSelectedColor(dayData?.mood || null);
    setNote(dayData?.note || "");
  }, [logData, selectedDateKey]);

  const handleColorSelect = (color: string) => {
    setLogData({
      ...logData,
      [selectedDateKey]: {
        mood: color,
        note: logData[selectedDateKey]?.note || ""
      }
    });
    setSelectedColor(color);
  };

  const handleNoteSave = () => {
    if (selectedColor) {
      setLogData({
        ...logData,
        [selectedDateKey]: {
          mood: selectedColor,
          note: note.trim()
        }
      });
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    // Auto-save note if mood is already selected
    if (selectedColor) {
      setLogData({
        ...logData,
        [selectedDateKey]: {
          mood: selectedColor,
          note: e.target.value
        }
      });
    }
  };

  // Get color for any date
  const getColorForDate = (date: Date) => {
    const key = getTodayKey(date);
    return logData[key]?.mood || null;
  };

  // Custom tileClassName for react-calendar
  const calendarTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const color = getColorForDate(date);
      if (color) {
        return `mood-${color}`;
      }
      if (isSameDay(date, selectedDate)) {
        return 'selected-date';
      }
    }
    return '';
  };

  const handleDateChange = (value: Date) => {
    setSelectedDate(value);
    setViewMode('view');
  };

  const isToday = isSameDay(selectedDate, today);
  const canEdit = isToday || selectedDate > today; // Can edit today or future dates
  const hasEntry = logData[selectedDateKey];

  // Get mood statistics
  const moodStats = Object.values(logData).reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const totalEntries = Object.keys(logData).length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#181e2a] rounded-2xl shadow-lg border border-[#232536]/60 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#7fd7ff] tracking-widest" style={{fontFamily: 'Orbitron, sans-serif'}}>
          Daily Mood Journal
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedDate(today); setViewMode('log'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'log' && isToday 
                ? 'bg-[#43cea2] text-[#181e2a]' 
                : 'bg-[#232536] text-[#7fd7ff] hover:bg-[#43cea2] hover:text-[#181e2a]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('view')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'view' 
                ? 'bg-[#43cea2] text-[#181e2a]' 
                : 'bg-[#232536] text-[#7fd7ff] hover:bg-[#43cea2] hover:text-[#181e2a]'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left side - Mood logging */}
        <div className="space-y-6">
          <div className="bg-[#232536]/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-[#7fd7ff] mb-4">
              {isToday ? "How are you feeling today?" : `Mood for ${selectedDate.toLocaleDateString()}`}
            </h3>
            
            {/* Date selector for non-today entries */}
            {!isToday && (
              <div className="mb-4 text-sm text-[#b6eaff]/70">
                Selected: {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}

            {/* Mood buttons */}
            <div className="flex gap-4 justify-center mb-4">
              {Object.entries(COLORS).map(([mood, color]) => (
                <button
                  key={mood}
                  className={`w-16 h-16 rounded-full border-4 ${
                    selectedColor === mood ? `border-[${color}]` : 'border-[#232536]'
                  } bg-[#232536] flex flex-col items-center justify-center shadow-md transition-all hover:scale-105 ${
                    !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ 
                    color: color,
                    borderColor: selectedColor === mood ? color : '#232536'
                  }}
                  onClick={() => canEdit && handleColorSelect(mood)}
                  disabled={!canEdit}
                >
                  <span className="text-3xl">
                    {mood === 'green' ? '😊' : mood === 'yellow' ? '😐' : '😔'}
                  </span>
                  <span className="text-xs mt-1">{MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}</span>
                </button>
              ))}
            </div>

            {/* Current mood display */}
            <div className="text-center text-[#b6eaff] text-sm">
              {selectedColor ? (
                <span>
                  Mood: <span style={{ color: COLORS[selectedColor as keyof typeof COLORS] }}>
                    {MOOD_LABELS[selectedColor as keyof typeof MOOD_LABELS]}
                  </span>
                  {!canEdit && " (Read-only)"}
                </span>
              ) : (
                <span>{canEdit ? "Select your mood above" : "No mood logged for this date"}</span>
              )}
            </div>
          </div>

          {/* Notes section */}
          <div className="bg-[#232536]/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-[#7fd7ff] mb-3">Notes</h3>
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder={canEdit ? "What happened today? How are you feeling?" : "No notes for this date"}
              className="w-full h-32 bg-[#181e2a] border border-[#232536]/60 rounded-lg p-3 text-[#b6eaff] placeholder-[#b6eaff]/50 resize-none focus:outline-none focus:border-[#43cea2] transition-colors"
              disabled={!canEdit}
            />
            {canEdit && selectedColor && (
              <button
                onClick={handleNoteSave}
                className="mt-2 px-4 py-2 bg-[#43cea2] text-[#181e2a] rounded-lg text-sm font-medium hover:bg-[#43cea2]/90 transition-colors"
              >
                Save Note
              </button>
            )}
          </div>

          {/* Stats */}
          {totalEntries > 0 && (
            <div className="bg-[#232536]/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#7fd7ff] mb-3">Your Mood Summary</h3>
              <div className="space-y-2">
                <div className="text-sm text-[#b6eaff]">Total entries: {totalEntries}</div>
                {Object.entries(moodStats).map(([mood, count]) => (
                  <div key={mood} className="flex items-center gap-2">
                    <span style={{ color: COLORS[mood as keyof typeof COLORS] }}>
                      {mood === 'green' ? '😊' : mood === 'yellow' ? '😐' : '😔'}
                    </span>
                    <span className="text-sm text-[#b6eaff]">
                      {MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}: {count} days 
                      ({Math.round((count / totalEntries) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Calendar */}
        <div className="space-y-4">
          <div className="bg-[#232536]/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-[#7fd7ff] mb-3">Calendar View</h3>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="w-full bg-transparent text-[#7fd7ff]"
              tileClassName={calendarTileClassName}
              navigationLabel={({ date }) => 
                `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              }
            />
            <div className="mt-3 text-xs text-[#b6eaff]/70 text-center">
              Click a date to view or edit that day's entry
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[#232536]/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#7fd7ff] mb-2">Legend</h3>
            <div className="space-y-1">
              {Object.entries(COLORS).map(([mood, color]) => (
                <div key={mood} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-[#b6eaff]">{MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .react-calendar {
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        
        .react-calendar__tile {
          background: #232536 !important;
          color: #7fd7ff !important;
          border: 1px solid #232536 !important;
          border-radius: 6px !important;
          margin: 2px !important;
          transition: all 0.2s ease !important;
        }
        
        .react-calendar__tile:hover {
          background: #43cea2 !important;
          color: #181e2a !important;
        }
        
        .react-calendar__tile--active,
        .react-calendar__tile--hasActive {
          background: #43cea2 !important;
          color: #181e2a !important;
        }
        
        .selected-date {
          background: #43cea2 !important;
          color: #181e2a !important;
        }
        
        .mood-green {
          background: #43cea2 !important;
          color: #181e2a !important;
          font-weight: bold !important;
        }
        
        .mood-yellow {
          background: #ffe066 !important;
          color: #181e2a !important;
          font-weight: bold !important;
        }
        
        .mood-red {
          background: #ff6b6b !important;
          color: #181e2a !important;
          font-weight: bold !important;
        }
        
        .react-calendar__navigation button {
          background: #232536 !important;
          color: #7fd7ff !important;
          border: none !important;
          border-radius: 6px !important;
          margin: 2px !important;
        }
        
        .react-calendar__navigation button:hover {
          background: #43cea2 !important;
          color: #181e2a !important;
        }
        
        .react-calendar__month-view__weekdays {
          color: #7fd7ff !important;
          font-weight: bold !important;
        }
        
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
}