import { useState } from 'react';
import { Plus, X, Edit2, Trash2, Palette } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SUBJECT_COLORS, Subject } from '../types';

export default function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, darkMode } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', color: SUBJECT_COLORS[0], professor: '' });

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const openAddModal = () => {
    setEditingSubject(null);
    setForm({ name: '', color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length], professor: '' });
    setShowModal(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({ name: subject.name, color: subject.color, professor: subject.professor });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, form);
    } else {
      addSubject(form.name, form.color, form.professor);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">Asignaturas</h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Gestiona tus asignaturas y sus colores
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nueva Asignatura</span>
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className={`${cardClass} border rounded-2xl p-12 text-center`}>
          <Palette className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay asignaturas registradas
          </p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Agrega tus asignaturas para comenzar
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`${cardClass} border rounded-2xl p-5 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{subject.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      👤 {subject.professor || 'Sin profesor'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(subject)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar esta asignatura? Se eliminarán también sus clases y exámenes.')) {
                        deleteSubject(subject.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {subject.color}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingSubject ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Matemáticas"
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-green-500 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profesor</label>
                <input
                  type="text"
                  value={form.professor}
                  onChange={(e) => setForm({ ...form, professor: e.target.value })}
                  placeholder="Ej: Dr. García"
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-green-500 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        form.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {editingSubject && (
                  <button
                    type="button"
                    onClick={() => { deleteSubject(editingSubject.id); setShowModal(false); }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25"
                >
                  {editingSubject ? 'Guardar Cambios' : 'Crear Asignatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
