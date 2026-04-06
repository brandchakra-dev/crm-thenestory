import React, { useState } from 'react';
import Button from '../ui/Button';

export default function LeadForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    source: initial.source || ''
  });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-2 border rounded" placeholder="Name" />
      <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="w-full p-2 border rounded" placeholder="Phone" />
      <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" placeholder="Email" />
      <input value={form.source} onChange={e=>setForm({...form, source:e.target.value})} className="w-full p-2 border rounded" placeholder="Source" />
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  );
}
