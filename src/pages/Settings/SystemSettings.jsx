import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosClient';
import Button from '../../components/ui/Button';

export default function SystemSettings(){
  const [settings, setSettings] = useState({ commissionPerLead: 1000 });

  useEffect(()=> {
    // load settings from api if available
    axios.get('/settings').then(r=>setSettings(r.data)).catch(()=>{});
  }, []);

  const save = async () => {
    try {
      await axios.put('/settings', settings);
      alert('Saved');
    } catch (err) { alert('Save failed'); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">System Settings</h1>
      <div className="bg-white p-4 rounded shadow max-w-md">
        <label className="block mb-2">Commission per closed lead (₹)</label>
        <input type="number" value={settings.commissionPerLead} onChange={e=>setSettings({...settings, commissionPerLead: Number(e.target.value)})} className="w-full p-2 border rounded mb-4" />
        <Button onClick={save}>Save Settings</Button>
      </div>
    </div>
  );
}
