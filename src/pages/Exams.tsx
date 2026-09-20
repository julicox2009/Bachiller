import { useState, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, CheckCircle2, Circle, BookOpen, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Exam, PRIORITY_CONFIG } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Exams() {
  const { subjects, exams, addExam, updateExam, deleteExam, toggleTopic, addTopic, deleteTopic, darkMode } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [form, setForm] = useState({
    subjectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    room: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
  });

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const sortedExams = useMemo(() => {
    return [...exams]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        ...e,
        subject: subjects.find((s) => s.id === e.subjectId),
        daysLeft: differenceInDays(parseISO(e.date), new Date()),
      }))
      .filter((e) => e.subject);
  }, [exams, subjects]);

  const openAddModal = () => {
    setEditingExam(null);
    setForm({
      subjectId: subjects[0]?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      room: '',
      priority: 'medium',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setForm({
      subjectId: exam.subjectId,
      date: exam.date,
      time: exam.time,
      room: exam.room,
      priority: exam.priority,
      notes: exam.notes,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) return;

    if (editingExam) {
      updateExam(editingExam.id, form);
    } else {
      addExam({ ...form, topics: [] });
    }
    setShowModal(false);
  };

  const handleAddTopic = (examId: string) => {
    if (!newTopic.trim()) return;
    addTopic(examId, newTopic.trim());
    setNewTopic('');
  };

  const studyExam = sortedExams.find((e) => e.id === showStudyMode);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">Exámenes</h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Programa y gestiona tus exámenes
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/25"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo Examen</span>
        </button>
      </div>

      {/* Study Mode Modal */}
      {showStudyMode && studyExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStudyMode(null)} />
          <div className={`relative w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-purple-500" />
                Modo Estudio
              </h3>
              <button onClick={() => setShowStudyMode(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-4 rounded-xl border-l-4" style={{ borderLeftColor: studyExam.subject!.color }}>
              <p className="font-bold text-lg">{studyExam.subject!.name}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {format(parseISO(studyExam.date), "d 'de' MMMM", { locale: es })} a las {studyExam.time}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className={`flex-1 h-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${studyExam.topics.length > 0 ? (studyExam.topics.filter(t => t.completed).length / studyExam.topics.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold">
                  {studyExam.topics.filter(t => t.completed).length}/{studyExam.topics.length}
                </span>
              </div>
            </div>

            {/* Topics List */}
            <div className="space-y-2 mb-4">
              {studyExam.topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <button
                    onClick={() => toggleTopic(studyExam.id, topic.id)}
                    className="flex-shrink-0"
                  >
                    {topic.completed ? (
                      <CheckCircle2 size={22} className="text-green-500" />
                    ) : (
                      <Circle size={22} className={darkMode ? 'text-gray-500' : 'text-gray-300'} />
                    )}
                  </button>
                  <span className={`flex-1 ${topic.completed ? 'line-through opacity-50' : ''}`}>
                    {topic.name}
                  </span>
                  <button
                    onClick={() => deleteTopic(studyExam.id, topic.id)}
                    className="p-1 text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Topic */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(studyExam.id)}
                placeholder="Agregar tema a estudiar..."
                className={`flex-1 p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`}
              />
              <button
                onClick={() => handleAddTopic(studyExam.id)}
                className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exams List */}
      {sortedExams.length === 0 ? (
        <div className={`${cardClass} border rounded-2xl p-12 text-center`}>
          <CalendarIcon className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay exámenes programados
          </p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Haz clic en "Nuevo Examen" para comenzar
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedExams.map((exam) => {
            const progress = exam.topics.length > 0
              ? Math.round((exam.topics.filter(t => t.completed).length / exam.topics.length) * 100)
              : 0;

            return (
              <div
                key={exam.id}
                className={`${cardClass} border rounded-2xl p-5 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: exam.subject!.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-bold truncate">{exam.subject!.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format(parseISO(exam.date), "d MMM yyyy", { locale: es })} • {exam.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${PRIORITY_CONFIG[exam.priority].color} flex-shrink-0`}>
                    {PRIORITY_CONFIG[exam.priority].label}
                  </span>
                </div>

                {/* Countdown */}
                <div className={`mb-3 p-3 rounded-xl ${
                  exam.daysLeft === 0 ? 'bg-red-500/10 border border-red-500/30' :
                  exam.daysLeft <= 2 ? 'bg-orange-500/10 border border-orange-500/30' :
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {exam.daysLeft === 0 ? (
                      <AlertTriangle size={16} className="text-red-500" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        exam.daysLeft <= 2 ? 'border-orange-500' : darkMode ? 'border-gray-500' : 'border-gray-300'
                      } flex items-center justify-center`}>
                        <span className="text-[8px] font-bold">{exam.daysLeft}</span>
                      </div>
                    )}
                    <span className={`text-sm font-bold ${
                      exam.daysLeft === 0 ? 'text-red-500' :
                      exam.daysLeft <= 2 ? 'text-orange-500' :
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {exam.daysLeft === 0 ? '¡Examen hoy!' :
                       exam.daysLeft === 1 ? 'Mañana' :
                       `Faltan ${exam.daysLeft} días`}
                    </span>
                  </div>
                </div>

                {exam.room && (
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📍 {exam.room}
                  </p>
                )}

                {/* Progress */}
                {exam.topics.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progreso estudio</span>
                      <span className="text-xs font-bold">{progress}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowStudyMode(exam.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-500 rounded-xl hover:bg-purple-500/20 transition-colors text-sm font-medium"
                  >
                    <BookOpen size={14} />
                    Estudiar
                  </button>
                  <button
                    onClick={() => openEditModal(exam)}
                    className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingExam ? 'Editar Examen' : 'Nuevo Examen'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asignatura</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aula</label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="Ej: Aula 205"
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prioridad</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`p-2 rounded-xl text-xs font-bold text-white transition-all ${PRIORITY_CONFIG[p].color} ${
                        form.priority === p ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'opacity-50'
                      }`}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Temas a evaluar, apuntes..."
                  rows={3}
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none resize-none`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                {editingExam && (
                  <button
                    type="button"
                    onClick={() => { deleteExam(editingExam.id); setShowModal(false); }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/25"
                >
                  {editingExam ? 'Guardar Cambios' : 'Crear Examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


