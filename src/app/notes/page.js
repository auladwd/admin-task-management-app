'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import { confirmDelete } from '@/utils/confirm';
import { toast } from 'react-toastify';

/* ─── Icons (inline SVG to avoid any import issues) ─── */
const IconPlus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const IconSearch = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
    />
  </svg>
);
const IconX = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const IconTrash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const IconEdit = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const IconPin = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);
const IconCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
const IconNote = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const IconList = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

/* ─── Color palette ─── */
const COLORS = [
  {
    id: 'default',
    bg: 'bg-base-100',
    border: 'border-base-300',
    dot: 'bg-base-300',
    label: 'Default',
  },
  {
    id: 'yellow',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    dot: 'bg-yellow-300',
    label: 'Yellow',
  },
  {
    id: 'green',
    bg: 'bg-green-50',
    border: 'border-green-300',
    dot: 'bg-green-300',
    label: 'Green',
  },
  {
    id: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    dot: 'bg-blue-300',
    label: 'Blue',
  },
  {
    id: 'pink',
    bg: 'bg-pink-50',
    border: 'border-pink-300',
    dot: 'bg-pink-300',
    label: 'Pink',
  },
  {
    id: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    dot: 'bg-purple-300',
    label: 'Purple',
  },
];
const colorOf = id => COLORS.find(c => c.id === id) || COLORS[0];
const emptyNote = () => ({
  title: '',
  content: '',
  color: 'default',
  items: [],
  pinned: false,
});

/* ─── CheckItem ─── */
function CheckItem({ item, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 group">
      <input
        type="checkbox"
        className="checkbox checkbox-sm checkbox-primary flex-shrink-0"
        checked={item.checked}
        onChange={e => onChange({ ...item, checked: e.target.checked })}
      />
      <input
        type="text"
        className={`flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-base-300 ${item.checked ? 'line-through text-base-content/40' : ''}`}
        value={item.text}
        onChange={e => onChange({ ...item, text: e.target.value })}
        placeholder="List item…"
      />
      <button
        type="button"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle text-error"
      >
        <IconX />
      </button>
    </div>
  );
}

/* ─── NoteModal ─── */
function NoteModal({ note, onClose, onSave }) {
  const [form, setForm] = useState(note ? { ...note } : emptyNote());
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addItem = () =>
    setField('items', [...form.items, { text: '', checked: false }]);
  const updateItem = (i, val) =>
    setField(
      'items',
      form.items.map((it, idx) => (idx === i ? val : it)),
    );
  const deleteItem = i =>
    setField(
      'items',
      form.items.filter((_, idx) => idx !== i),
    );

  const handleSave = async () => {
    if (!form.title.trim() && !form.content.trim() && form.items.length === 0) {
      toast.error('Note cannot be empty');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const col = colorOf(form.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl border-2 ${col.bg} ${col.border} flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <input
            type="text"
            className="flex-1 bg-transparent font-bold text-lg outline-none placeholder:text-base-content/30"
            placeholder="Title…"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
          <textarea
            className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-base-content/30 min-h-[80px]"
            placeholder="Write your note here…"
            value={form.content}
            onChange={e => setField('content', e.target.value)}
            rows={4}
          />

          {form.items.length > 0 && (
            <div className="space-y-2 border-t border-base-300 pt-2">
              {form.items.map((item, i) => (
                <CheckItem
                  key={i}
                  item={item}
                  onChange={val => updateItem(i, val)}
                  onDelete={() => deleteItem(i)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-xs text-base-content/50 hover:text-primary transition-colors"
          >
            <IconList />
            Add checklist item
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-base-300/50">
          {/* Color picker */}
          <div className="flex items-center gap-1.5">
            {COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setField('color', c.id)}
                title={c.label}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${c.dot} ${form.color === c.id ? 'border-primary scale-125' : 'border-base-300 hover:scale-110'}`}
              />
            ))}
          </div>

          {/* Pin + Save */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setField('pinned', !form.pinned)}
              className={`btn btn-ghost btn-sm btn-circle ${form.pinned ? 'text-warning' : 'text-base-content/40'}`}
              title={form.pinned ? 'Unpin' : 'Pin note'}
            >
              <IconPin />
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm gap-1"
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <IconCheck />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── NoteCard ─── */
function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleItem }) {
  const col = colorOf(note.color);
  const done = note.items.filter(i => i.checked).length;
  const total = note.items.length;

  return (
    <div
      className={`rounded-xl border-2 ${col.bg} ${col.border} shadow-sm hover:shadow-md transition-shadow flex flex-col`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between px-3 pt-3 pb-1 gap-2">
        <div className="flex-1 min-w-0">
          {note.pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] text-warning font-semibold mb-1">
              <IconPin /> Pinned
            </span>
          )}
          {note.title && (
            <h3 className="font-semibold text-sm truncate">{note.title}</h3>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onTogglePin(note)}
            className={`btn btn-ghost btn-xs btn-circle ${note.pinned ? 'text-warning' : 'text-base-content/30 hover:text-warning'}`}
            title="Pin"
          >
            <IconPin />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-primary"
            title="Edit"
          >
            <IconEdit />
          </button>
          <button
            onClick={() => onDelete(note)}
            className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-error"
            title="Delete"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 flex-1 space-y-2">
        {note.content && (
          <p className="text-xs text-base-content/70 whitespace-pre-wrap line-clamp-5">
            {note.content}
          </p>
        )}

        {note.items.length > 0 && (
          <div className="space-y-1.5 border-t border-base-300/50 pt-2">
            {note.items.slice(0, 6).map((item, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs checkbox-primary"
                  checked={item.checked}
                  onChange={() => onToggleItem(note, i)}
                />
                <span
                  className={`text-xs flex-1 ${item.checked ? 'line-through text-base-content/40' : ''}`}
                >
                  {item.text || (
                    <span className="italic text-base-content/30">empty</span>
                  )}
                </span>
              </label>
            ))}
            {note.items.length > 6 && (
              <p className="text-[10px] text-base-content/40">
                +{note.items.length - 6} more…
              </p>
            )}
            <p className="text-[10px] text-base-content/40 pt-0.5">
              {done}/{total} done
            </p>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-2">
        <p className="text-[10px] text-base-content/30">
          {new Date(note.updatedAt).toLocaleDateString()}{' '}
          {new Date(note.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

/* ─── NotesContent ─── */
function NotesContent() {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalNote, setModalNote] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?userId=${userProfile.uid}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async form => {
    try {
      if (isNew) {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, userId: userProfile.uid }),
        });
        toast.success('Note created');
      } else {
        await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            _id: modalNote._id,
            userId: userProfile.uid,
          }),
        });
        toast.success('Note updated');
      }
      setModalNote(null);
      fetchNotes();
    } catch {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async note => {
    const ok = await confirmDelete({
      title: 'Delete Note?',
      text: `"${note.title || 'This note'}" will be permanently deleted.`,
    });
    if (!ok) return;
    await fetch(`/api/notes?id=${note._id}&userId=${userProfile.uid}`, {
      method: 'DELETE',
    });
    toast.success('Note deleted');
    fetchNotes();
  };

  const handleTogglePin = async note => {
    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: note._id,
        userId: userProfile.uid,
        pinned: !note.pinned,
      }),
    });
    fetchNotes();
  };

  const handleToggleItem = async (note, itemIndex) => {
    const items = note.items.map((it, i) =>
      i === itemIndex ? { ...it, checked: !it.checked } : it,
    );
    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: note._id, userId: userProfile.uid, items }),
    });
    setNotes(prev => prev.map(n => (n._id === note._id ? { ...n, items } : n)));
  };

  const filtered = notes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.items?.some(i => i.text?.toLowerCase().includes(q))
    );
  });

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  const openNew = () => {
    setIsNew(true);
    setModalNote(emptyNote());
  };
  const openEdit = note => {
    setIsNew(false);
    setModalNote(note);
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <IconNote /> My Notes
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Personal notes — only visible to you
          </p>
        </div>
        <button
          onClick={openNew}
          className="btn btn-primary btn-sm sm:btn-md gap-2"
        >
          <IconPlus /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
          <IconSearch />
        </span>
        <input
          type="text"
          placeholder="   Search notes…"
          className="input input-bordered input-sm sm:input-md w-full pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
          >
            <IconX />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-14 h-14 text-base-content/20 mb-4 flex items-center justify-center">
            <IconNote />
          </div>
          <p className="text-base-content/50 font-medium">
            {search ? 'No notes match your search' : 'No notes yet'}
          </p>
          {!search && (
            <button
              onClick={openNew}
              className="btn btn-primary btn-sm mt-4 gap-2"
            >
              <IconPlus /> Create your first note
            </button>
          )}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3 flex items-center gap-1">
                <IconPin /> Pinned
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinned.map(n => (
                  <NoteCard
                    key={n._id}
                    note={n}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onToggleItem={handleToggleItem}
                  />
                ))}
              </div>
            </section>
          )}

          {unpinned.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
                  Others
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unpinned.map(n => (
                  <NoteCard
                    key={n._id}
                    note={n}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onToggleItem={handleToggleItem}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {notes.length > 0 && (
        <p className="text-xs text-base-content/30 text-right">
          {notes.length} note{notes.length !== 1 ? 's' : ''} total
          {search && ` · ${filtered.length} matching`}
        </p>
      )}

      {modalNote !== null && (
        <NoteModal
          note={modalNote}
          onClose={() => setModalNote(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function NotesPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <NotesContent />
      </MainLayout>
    </AuthGuard>
  );
}
