# 📦 PARTE 6: Páginas (Archivos 12-16)

---

## 📄 ARCHIVO 12: `src/pages/Dashboard.tsx`

```tsx
import { useMemo } from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DAYS, PRIORITY_CONFIG } from '../types';
import { format, differenceInDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { subjects, classes, exams, darkMode } = useStore();

  const todayDayOfWeek = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? -1 : day - 1;
  }, []);

  const todayClasses = useMemo(() => {
    return classes
      .filter((c) => c.dayOfWeek === todayDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((c) => ({
        ...c,
        subject: subjects.find((s) => s.id === c.subjectId),
      }))
      .filter((c) => c.subject);
  }, [classes, todayDayOfWeek, subjects]);

  const upcomingExams = useMemo(() => {
    const now = new Date();
    return exams
      .filter((e) => {
        const examDate = parseISO(e.date);
        const diff = differenceInDays(examDate, now);
        return diff >= 0 && diff <= 14;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        ...e,
        subject: subjects.find((s) => s.id === e.subjectId),
        daysLeft: differenceInDays(parseISO(e.date), now),
      }))
      .filter((e) => e.subject);
  }, [exams, subjects]);

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold">Dashboard</h2>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <BookOpen size={20} className="text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Asignaturas</p>
              <p className="text-2xl font-bold">{subjects.length}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Clock size={20} className="text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clases hoy</p>
              <p className="text-2xl font-bold">{todayClasses.length}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Calendar size={20} className="text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exámenes</p>
              <p className="text-2xl font-bold">{upcomingExams.length}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <AlertTriangle size={20} className="text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Urgentes</p>
              <p className="text-2xl font-bold">{upcomingExams.filter((e) => e.priority === 'urgent').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className={`${cardClass} border rounded-2xl p-6`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Clock size={20} className="text-blue-500" />
            Clases de Hoy
            {todayDayOfWeek === -1 && <span className="text-sm font-normal text-orange-500">(Fin de semana)</span>}
          </h3>
          {todayDayOfWeek === -1 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
              🎉 ¡Es fin de semana! Descansa.
            </p>
          ) : todayClasses.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
              No hay clases programadas para hoy
            </p>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-l-4`}
                  style={{ borderLeftColor: cls.subject!.color }}
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-bold">{cls.startTime}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cls.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{cls.subject!.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📍 {cls.room} • 👤 {cls.subject!.professor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className={`${cardClass} border rounded-2xl p-6`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-purple-500" />
            Próximos Exámenes
          </h3>
          {upcomingExams.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
              No hay exámenes en los próximos 14 días
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-l-4`}
                  style={{ borderLeftColor: exam.subject!.color }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{exam.subject!.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format(parseISO(exam.date), "d MMM", { locale: es })} a las {exam.time}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${PRIORITY_CONFIG[exam.priority].color}`}>
                        {PRIORITY_CONFIG[exam.priority].label}
                      </span>
                      <span className={`text-xs font-bold ${exam.daysLeft === 0 ? 'text-red-500' : exam.daysLeft <= 2 ? 'text-orange-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {exam.daysLeft === 0 ? '¡Hoy!' : isTomorrow(parseISO(exam.date)) ? 'Mañana' : `Faltan ${exam.daysLeft} días`}
                      </span>
                    </div>
                  </div>
                  {exam.topics.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${(exam.topics.filter(t => t.completed).length / exam.topics.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {exam.topics.filter(t => t.completed).length}/{exam.topics.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

**Continúa en PARTE 7 con Schedule.tsx...**
