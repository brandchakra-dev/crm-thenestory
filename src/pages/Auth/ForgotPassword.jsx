import React, { useState } from 'react';
import axios from '../../api/axiosClient';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/forgot', { email });
      alert('If account exists, reset email sent.');
    } catch (err) {
      alert('Error sending reset');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl mb-4">Reset Password</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border mb-3" />
        <button className="w-full bg-primary text-white p-2 rounded">Send Reset Link</button>
      </form>
    </div>
  );
}
