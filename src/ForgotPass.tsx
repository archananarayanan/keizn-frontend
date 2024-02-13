import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


type UserProfile = {
    username: string,
    password: string
}

async function registerUser(credentials: UserProfile) {
    console.log(JSON.stringify(credentials));
    return fetch('https://web-production-3b2a.up.railway.app/api/reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => {return data.json()})
   }

export default function ForgotPassword() {
  
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const response = await registerUser({
      username,
      password
    });
    console.log(response)
    if (response) {
        toast.success("Updated Access!");
        window.location.href = "/";
    } else {
        toast.error(response.error);
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <span className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src="https://app.kaizntree.com/img/Kaizntree_Palm_Trees.147c8cb5.png" alt="Kaizntree" />
      </span>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit} >
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username</label>
            <div className="mt-2">
              <input id="username" name="username" type="text" required onChange={e => setUserName(e.target.value)} className="block w-full p-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">New Password</label>
            </div>
            <div className="mt-2">
              <input id="password" name="password" type="password" required onChange={e => setPassword(e.target.value)} className="block w-full p-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex flex-col">
            <div className="text-sm">
                <a href="/" className="font-semibold text-indigo-600 hover:text-indigo-500">Back to login</a>
            </div>
            <button type="submit" className="flex-1 w-48 justify-center rounded-md bg-neutral-300 px-2 py-1 text-sm font-semibold leading-2 text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Reset Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}