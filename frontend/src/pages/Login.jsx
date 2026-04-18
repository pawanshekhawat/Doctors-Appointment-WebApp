import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [role, setRole] = useState('user'); // 'user' | 'doctor' | 'admin'
  const [state, setState] = useState('Login'); // 'Login' | 'Sign Up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (role === 'user') {
        if (state === 'Sign Up') {
          const { data } = await authService.register({ name, email, password });
          if (data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userName', name);
            window.dispatchEvent(new Event('authchange'));
            toast.success('Account created successfully!');
            navigate('/');
          } else {
            toast.error(data.message);
          }
        } else {
          const { data } = await authService.login({ email, password });
          if (data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userName', data.data.user.name);
            window.dispatchEvent(new Event('authchange'));
            toast.success('Login successful!');
            navigate('/');
          } else {
            toast.error(data.message);
          }
        }
      } else if (role === 'doctor') {
        const { data } = await authService.doctorLogin({ email, password });
        if (data.success) {
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userRole', 'doctor');
          localStorage.setItem('userName', data.data.doctor.name);
          localStorage.setItem('doctorId', data.data.doctor.id);
          window.dispatchEvent(new Event('authchange'));
          toast.success('Doctor login successful!');
          navigate('/doctor-dashboard');
        } else {
          toast.error(data.message);
        }
      } else if (role === 'admin') {
        const { data } = await authService.adminLogin({ email, password });
        if (data.success) {
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userName', 'Admin');
          window.dispatchEvent(new Event('authchange'));
          toast.success('Admin login successful!');
          navigate('/admin-dashboard');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>

        {/* Role selector */}
        <div className='w-full flex border rounded-lg overflow-hidden mb-2'>
          {['user', 'doctor', 'admin'].map((r) => (
            <button
              key={r}
              type='button'
              onClick={() => { setRole(r); setState('Login'); setEmail(''); setPassword(''); setName(''); }}
              className={`flex-1 py-2 text-sm capitalize font-medium transition-colors ${
                role === r ? 'bg-primary text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className='text-2xl font-semibold'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} as {role}</p>

        {role === 'user' && state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type='text'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-50'
        >
          {loading ? 'Please wait...' : state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {role === 'user' && (
          state === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>
                Login here
              </span>
            </p>
          ) : (
            <p>
              Create a new account?{' '}
              <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>
                click here
              </span>
            </p>
          )
        )}

        {role === 'doctor' && (
          <p className='text-xs text-zinc-500'>
            Contact admin to create your doctor account.
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
