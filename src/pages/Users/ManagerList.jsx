import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../api/userService';
import Table from '../../components/ui/Table';
import UserForm from '../../components/forms/UserForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function ManagerList(){
  const [managers, setManagers] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => fetchUsers().then(r => setManagers(r.filter(u=>u.role === 'manager'))).catch(()=>{});

  useEffect(()=> {
    load()
  },[]);

  const onCreate = async (payload) => {
    await createUser(payload);
    setOpen(false);
    load();
  };

  const columns = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    { key: 'email', title: 'Email', dataIndex: 'email' },
    { key: 'role', title: 'Role', dataIndex: 'role' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Managers</h1>
        <Button onClick={()=>setOpen(true)}>New Manager</Button>
      </div>

      <Table columns={columns} data={managers} renderRowActions={(row)=>(
        <div className="flex gap-2">
          <button onClick={async ()=>{ const name = prompt('New name', row.name); if(name) { await updateUser(row._id, { name }); load(); } }} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
          <button onClick={async ()=>{ if(confirm('Delete?')) { await deleteUser(row._id); load(); } }} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
        </div>
      )} />

      <Modal open={open} onClose={()=>setOpen(false)} title="Create Manager">
        <UserForm onSubmit={onCreate} onCancel={()=>setOpen(false)} />
      </Modal>
    </div>
  );
}
