import { useState, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DAYS, DAYS_SHORT, TIME_SLOTS, ClassSession } from '../types';

export default function Schedule() {
  const { subjects, classes, addClass, updateClass, deleteClass, darkMode } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [mobileDay, setMobileDay] = useState(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? 0 : day - 1;
  });
  const [form, setForm] = useState({
    subjectId: '',
    dayOfWeek: 0,
    startTime: '08:00',
    endTime: '09:00',
    room: '',
  });

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = `w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`;

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  // Desktop grid view
  const scheduleGrid = useMemo(() => {
    const grid: Record<string, ClassSession[]> = {};
    for (let day = 0; day < 5; day++) {
      for (const time of TIME_SLOTS) {
        const key = `${day}-${time}`;
        grid[key] = classes.filter((c) => {
          if (c.dayOfWeek !== day) return false;
          return c.startTime <= time && c.endTime > time;
        });
      }
    }
    return grid;
  }, [classes]);

  // Mobile day view
  const mobileDayClasses = useMemo(() => {
    return classes
      .filter((c) => c.dayOfWeek === mobileDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((c) => ({ ...c, subject: getSubject(c.subjectId) }))
      .filter((c) => c.subject);
  }, [classes, mobileDay, subjects]);

  const openAddModal = (day: number, time: string) => {
    setEditingClass(null);
    setForm({
      subjectId: subjects[0]?.id || '',
      dayOfWeek: day,
      startTime: time,
      endTime: TIME_SLOTS[Math.min(TIME_SLOTS.indexOf(time) + 1, TIME_SLOTS.length - 1)] || '09:00',
      room: '',
    });
    setShowModal(true);
  };

  const openEditModal = (cls: ClassSession) => {
    setEditingClass(cls);
    setForm({
      subjectId: cls.subjectId,
      dayOfWeek: cls.dayOfWeek,
      startTime: cls.startTime,
      endTime: cls.endTime,
      room: cls.room,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.room) return;

    if (editingClass) {
      updateClass(editingClass.id, form);
    } else {
      addClass(form);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">Horario Semanal</h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Gestiona tus clases de lunes a viernes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClass(null);
            setForm({
              subjectId: subjects[0]?.id || '',
              dayOfWeek: mobileDay,
              startTime: '08:00',
              endTime: '09:00',
              room: '',
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Agregar Clase</span>
        </button>
      </div>

      {/* Desktop Grid View */}
      <div className={`hidden lg:block ${cardClass} border rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <th className="p-3 text-left text-sm font-semibold w-20">Hora</th>
                {DAYS.map((day, i) => (
                  <th key={i} className="p-3 text-center text-sm font-semibold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time} className={`border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                  <td className={`p-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {time}
                  </td>
                  {Array.from({ length: 5 }, (_, dayIdx) => {
                    const key = `${dayIdx}-${time}`;
                    const sessions = scheduleGrid[key] || [];
                    const isStart = sessions.some((s) => s.startTime === time);
                    const isMiddle = sessions.some((s) => s.startTime < time && s.endTime > time);

                    return (
                      <td key={dayIdx} className="p-1 h-14 relative align-top">
                        {isStart && sessions.map((session) => {
                          const subject = getSubject(session.subjectId);
                          if (!subject) return null;
                          const startIdx = TIME_SLOTS.indexOf(session.startTime);
                          const endIdx = TIME_SLOTS.indexOf(session.endTime);
                          const duration = Math.max(1, endIdx - startIdx);

                          return (
                            <div
                              key={session.id}
                              className="absolute inset-x-1 rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group z-10"
                              style={{
                                backgroundColor: subject.color + '20',
                                borderLeft: `3px solid ${subject.color}`,
                                height: `calc(${duration * 100}% + ${duration - 1}px)`,
                                top: 0,
                              }}
                              onClick={() => openEditModal(session)}
                            >
                              <p className="text-xs font-bold truncate" style={{ color: subject.color }}>
                                {subject.name}
                              </p>
                              <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                📍 {session.room}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                👤 {subject.professor}
                              </p>
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditModal(session); }}
                                  className={`p-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow`}
                                >
                                  <Edit2 size={10} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteClass(session.id); }}
                                  className="p-1 bg-red-500 text-white rounded shadow"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {!isStart && !isMiddle && (
                          <button
                            onClick={() => openAddModal(dayIdx, time)}
                            className={`w-full h-full rounded-lg opacity-0 hover:opacity-100 transition-opacity ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50'} flex items-center justify-center`}
                          >
                            <Plus size={14} className="text-blue-400" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Day View */}
      <div className="lg:hidden">
        {/* Day Selector */}
        <div className={`${cardClass} border rounded-2xl p-3 mb-4`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileDay(Math.max(0, mobileDay - 1))}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              disabled={mobileDay === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setMobileDay(i)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    mobileDay === i
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : darkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {DAYS_SHORT[i]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMobileDay(Math.min(4, mobileDay + 1))}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              disabled={mobileDay === 4}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day Classes */}
        <div className="space-y-3">
          {mobileDayClasses.length === 0 ? (
            <div className={`${cardClass} border rounded-2xl p-8 text-center`}>
              <p className="text-4xl mb-3">📭</p>
              <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay clases el {DAYS[mobileDay]}
              </p>
              <button
                onClick={() => openAddModal(mobileDay, '08:00')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600"
              >
                Agregar clase
              </button>
            </div>
          ) : (
            mobileDayClasses.map((cls) => {
              const subject = cls.subject!;
              return (
                <div
                  key={cls.id}
                  className={`${cardClass} border rounded-2xl p-4 border-l-4 cursor-pointer hover:shadow-md transition-shadow`}
                  style={{ borderLeftColor: subject.color }}
                  onClick={() => openEditModal(cls)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{subject.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          👤 {subject.professor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{cls.startTime} - {cls.endTime}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📍 {cls.room}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 animate-fadeIn`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingClass ? 'Editar Clase' : 'Nueva Clase'}</h3>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asignatura</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className={inputClass}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Día</label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
                  className={inputClass}
                >
                  {DAYS.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aula</label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="Ej: Aula 301"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-3 pt-2">
                {editingClass && (
                  <button
                    type="button"
                    onClick={() => { deleteClass(editingClass.id); setShowModal(false); }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
                >
                  {editingClass ? 'Guardar Cambios' : 'Agregar Clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
