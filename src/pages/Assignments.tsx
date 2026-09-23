import { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Circle, Trash2, Edit2, X, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Assignment, ASSIGNMENT_TYPES, PRIORITY_CONFIG } from '../types';
import { format, differenceInDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Assignments() {
  const { subjects, assignments, addAssignment, updateAssignment, deleteAssignment, toggleAssignment, toggleAssignmentStep, addAssignmentStep, deleteAssignmentStep, darkMode } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newStep, setNewStep] = useState('');
  const [form, setForm] = useState({
    subjectId: '',
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    dueTime: '23:59',
    type: 'homework' as keyof typeof ASSIGNMENT_TYPES,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
  });

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = `w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`;

  const openAddModal = () => {
    setEditingAssignment(null);
    setForm({
      subjectId: subjects[0]?.id || '',
      title: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      dueTime: '23:59',
      type: 'homework',
      priority: 'medium',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setForm({
      subjectId: assignment.subjectId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime,
      type: assignment.type,
      priority: assignment.priority,
      notes: assignment.notes,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.title) return;

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, { ...form, steps: editingAssignment.steps });
    } else {
      addAssignment({ ...form, steps: [], completed: false });
    }
    setShowModal(false);
  };

  const handleAddStep = (assignmentId: string) => {
    if (!newStep.trim()) return;
    addAssignmentStep(assignmentId, newStep.trim());
    setNewStep('');
  };

  // Ordenar trabajos: pendientes primero, por fecha de entrega
  const sortedAssignments = [...assignments]
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .map((a) => ({
      ...a,
      subject: subjects.find((s) => s.id === a.subjectId),
      daysLeft: differenceInDays(parseISO(a.dueDate), new Date()),
    }))
    .filter((a) => a.subject);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">Trabajos</h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Tareas y trabajos a entregar
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/25"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo Trabajo</span>
        </button>
      </div>

      {/* Stats TDAH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Calendar size={20} className="text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pendientes</p>
              <p className="text-2xl font-bold">{sortedAssignments.filter(a => !a.completed).length}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <CheckCircle2 size={20} className="text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completados</p>
              <p className="text-2xl font-bold">{sortedAssignments.filter(a => a.completed).length}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Clock size={20} className="text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Urgentes</p>
              <p className="text-2xl font-bold">{sortedAssignments.filter(a => !a.completed && a.daysLeft <= 2).length}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} border rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vencidos</p>
              <p className="text-2xl font-bold">{sortedAssignments.filter(a => !a.completed && a.daysLeft < 0).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de trabajos */}
      {sortedAssignments.length === 0 ? (
        <div className={`${cardClass} border rounded-2xl p-12 text-center`}>
          <Calendar className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay trabajos pendientes
          </p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Haz clic en "Nuevo Trabajo" para comenzar
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedAssignments.map((assignment) => {
            const subject = assignment.subject!;
            const typeInfo = ASSIGNMENT_TYPES[assignment.type];
            const progress = assignment.steps.length > 0
              ? Math.round((assignment.steps.filter(s => s.completed).length / assignment.steps.length) * 100)
              : 0;

            return (
              <div
                key={assignment.id}
                className={`${cardClass} border rounded-2xl p-5 hover:shadow-lg transition-shadow ${
                  assignment.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleAssignment(assignment.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      {assignment.completed ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} className={darkMode ? 'text-gray-500' : 'text-gray-300'} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{typeInfo.emoji}</span>
                        <p className={`font-bold truncate ${assignment.completed ? 'line-through' : ''}`}>
                          {assignment.title}
                        </p>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {subject.name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${PRIORITY_CONFIG[assignment.priority].color} flex-shrink-0`}>
                    {PRIORITY_CONFIG[assignment.priority].label}
                  </span>
                </div>

                {assignment.description && (
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {assignment.description}
                  </p>
                )}

                {/* Fecha de entrega */}
                <div className={`mb-3 p-3 rounded-xl ${
                  assignment.completed ? 'bg-green-500/10 border border-green-500/30' :
                  assignment.daysLeft < 0 ? 'bg-red-500/10 border border-red-500/30' :
                  assignment.daysLeft <= 2 ? 'bg-orange-500/10 border border-orange-500/30' :
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={
                      assignment.completed ? 'text-green-500' :
                      assignment.daysLeft < 0 ? 'text-red-500' :
                      assignment.daysLeft <= 2 ? 'text-orange-500' :
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } />
                    <span className={`text-sm font-bold ${
                      assignment.completed ? 'text-green-500' :
                      assignment.daysLeft < 0 ? 'text-red-500' :
                      assignment.daysLeft <= 2 ? 'text-orange-500' :
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {assignment.completed ? '✓ Completado' :
                       assignment.daysLeft < 0 ? `Vencido hace ${Math.abs(assignment.daysLeft)} días` :
                       isToday(parseISO(assignment.dueDate)) ? '¡Entregar hoy!' :
                       isTomorrow(parseISO(assignment.dueDate)) ? 'Entregar mañana' :
                       `Entregar en ${assignment.daysLeft} días`}
                    </span>
                    <span className={`text-xs ml-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {format(parseISO(assignment.dueDate), "d MMM", { locale: es })} {assignment.dueTime}
                    </span>
                  </div>
                </div>

                {/* Progreso de pasos */}
                {assignment.steps.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progreso</span>
                      <span className="text-xs font-bold">{progress}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      {assignment.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAssignmentStep(assignment.id, step.id)}
                            className="flex-shrink-0"
                          >
                            {step.completed ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <Circle size={16} className={darkMode ? 'text-gray-500' : 'text-gray-300'} />
                            )}
                          </button>
                          <span className={`text-sm flex-1 ${step.completed ? 'line-through opacity-50' : ''}`}>
                            {step.name}
                          </span>
                          <button
                            onClick={() => deleteAssignmentStep(assignment.id, step.id)}
                            className="p-1 text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStep(assignment.id)}
                        placeholder="Agregar paso..."
                        className={`flex-1 p-2 text-sm rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-purple-500 outline-none`}
                      />
                      <button
                        onClick={() => handleAddStep(assignment.id)}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => openEditModal(assignment)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(assignment.id)}
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 animate-fadeIn`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">¿Eliminar trabajo?</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteAssignment(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-500/25"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingAssignment ? 'Editar Trabajo' : 'Nuevo Trabajo'}</h3>
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
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Ensayo sobre La Celestina"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalles del trabajo..."
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora límite</label>
                  <input
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de trabajo</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ASSIGNMENT_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key as keyof typeof ASSIGNMENT_TYPES })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        form.type === key
                          ? `${value.color} text-white ring-2 ring-offset-2 ring-purple-500`
                          : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-lg">{value.emoji}</span>
                      <div className="mt-1">{value.label}</div>
                    </button>
                  ))}
                </div>
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
                        form.priority === p ? 'ring-2 ring-offset-2 ring-purple-500 scale-105' : 'opacity-50'
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
                  placeholder="Notas adicionales..."
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div className="flex gap-3 pt-2">
                {editingAssignment && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setShowDeleteConfirm(editingAssignment.id);
                    }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/25"
                >
                  {editingAssignment ? 'Guardar Cambios' : 'Crear Trabajo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
