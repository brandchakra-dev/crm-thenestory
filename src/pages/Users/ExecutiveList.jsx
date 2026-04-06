import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser } from '../../api/userService';
import Table from '../../components/ui/Table';
import UserForm from '../../components/forms/UserForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function ExecutiveList(){
  const [execs, setExecs] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => fetchUsers().then(r => setExecs(r.filter(u=>u.role === 'executive'))).catch(()=>{});

  useEffect(()=> {
    load()
  }, []);

  const onCreate = async (payload) => {
    await createUser(payload);
    setOpen(false);
    load();
  };

  const columns = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    { key: 'email', title: 'Email', dataIndex: 'email' },
    { key: 'manager', title: 'Manager', render: r=> r.manager || '-' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Executives</h1>
        <Button onClick={()=>setOpen(true)}>New Executive</Button>
      </div>

      <Table columns={columns} data={execs} renderRowActions={(row)=>(
        <div className="flex gap-2">
          <button onClick={()=>alert('Edit flow here')} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
        </div>
      )} />

      <Modal open={open} onClose={()=>setOpen(false)} title="Create Executive">
        <UserForm onSubmit={onCreate} onCancel={()=>setOpen(false)} />
      </Modal>
    </div>
  );
}
