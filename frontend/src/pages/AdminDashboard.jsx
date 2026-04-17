import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/axios'
import { assets } from '../assets/assets'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({ doctors: 0, patients: 0, appointments: 0, latestAppointments: [] })
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [addingDoctor, setAddingDoctor] = useState(false)

  const [doctorForm, setDoctorForm] = useState({
    name: '', email: '', password: '', speciality: '', degree: '',
    experience: '', about: '', fees: '', address: ''
  })

  const SPECIALITIES = [
    'General physician', 'Dermatologist', 'Neurologist', 'Pediatricians',
    'Gynecologist', 'Gastroenterologist'
  ]

  const token = localStorage.getItem('authToken')
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/api/admin/dashboard', authHeader)
      if (data.success) setDashboardData(data.data)
    } catch { toast.error('Failed to load dashboard') }
  }

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/api/admin/doctors', authHeader)
      if (data.success) setDoctors(data.data.doctors)
    } catch { toast.error('Failed to load doctors') }
  }

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/api/admin/appointments', authHeader)
      if (data.success) setAppointments(data.data.appointments)
    } catch { toast.error('Failed to load appointments') }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchDashboard()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (activeTab === 'doctors') fetchDoctors()
    if (activeTab === 'appointments') fetchAppointments()
  }, [activeTab])

  const handleAddDoctor = async (e) => {
    e.preventDefault()
    setAddingDoctor(true)
    try {
      const formData = new FormData()
      Object.entries(doctorForm).forEach(([key, value]) => formData.append(key, value))

      const { data } = await api.post('/api/admin/add-doctor', formData, {
        headers: { ...authHeader.headers, 'Content-Type': 'multipart/form-data' }
      })
      if (data.success) {
        toast.success('Doctor added successfully!')
        setDoctorForm({ name: '', email: '', password: '', speciality: '', degree: '', experience: '', about: '', fees: '', address: '' })
        fetchDoctors()
        fetchDashboard()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add doctor')
    } finally {
      setAddingDoctor(false)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Delete this doctor?')) return
    try {
      const { data } = await api.delete(`/api/admin/doctor/${doctorId}`, authHeader)
      if (data.success) {
        toast.success('Doctor deleted')
        setDoctors(doctors.filter(d => d._id !== doctorId))
        fetchDashboard()
      } else toast.error(data.message)
    } catch { toast.error('Delete failed') }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const { data } = await api.put(`/api/admin/appointment/${appointmentId}`, {}, authHeader)
      if (data.success) {
        toast.success('Appointment cancelled')
        setAppointments(appointments.map(a => a._id === appointmentId ? { ...a, cancelled: true } : a))
        fetchDashboard()
      } else toast.error(data.message)
    } catch { toast.error('Cancel failed') }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (loading) return <div className='flex justify-center items-center h-64'><p>Loading...</p></div>

  return (
    <div className='m-5'>
      <div className='flex gap-4 mb-6'>
        {['dashboard', 'doctors', 'appointments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-primary text-white' : 'bg-white border text-zinc-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
            <div className='border rounded-xl p-6 flex items-center gap-4 bg-white'>
              <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600'>{dashboardData.doctors}</div>
              <div><p className='text-gray-500 text-sm'>Total Doctors</p><p className='text-xl font-semibold'>{dashboardData.doctors}</p></div>
            </div>
            <div className='border rounded-xl p-6 flex items-center gap-4 bg-white'>
              <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-600'>{dashboardData.patients}</div>
              <div><p className='text-gray-500 text-sm'>Total Patients</p><p className='text-xl font-semibold'>{dashboardData.patients}</p></div>
            </div>
            <div className='border rounded-xl p-6 flex items-center gap-4 bg-white'>
              <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600'>{dashboardData.appointments}</div>
              <div><p className='text-gray-500 text-sm'>Total Appointments</p><p className='text-xl font-semibold'>{dashboardData.appointments}</p></div>
            </div>
          </div>

          <div className='bg-white border rounded-xl p-6'>
            <p className='text-lg font-medium mb-4'>Latest Appointments</p>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-500 border-b'>
                    <th className='pb-3 pr-4'>Patient</th><th className='pb-3 pr-4'>Doctor</th><th className='pb-3 pr-4'>Date</th>
                    <th className='pb-3 pr-4'>Time</th><th className='pb-3 pr-4'>Fee</th><th className='pb-3 pr-4'>Status</th><th className='pb-3'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.latestAppointments?.map((apt, i) => (
                    <tr key={i} className='border-b last:border-0'>
                      <td className='py-3 pr-4'>{apt.userId?.name || 'N/A'}</td>
                      <td className='py-3 pr-4'>{apt.docId?.name || 'N/A'}</td>
                      <td className='py-3 pr-4'>{formatDate(apt.slotDate)}</td>
                      <td className='py-3 pr-4'>{apt.slotTime}</td>
                      <td className='py-3 pr-4'>${apt.amount}</td>
                      <td className='py-3 pr-4'>
                        {apt.cancelled ? <span className='text-red-500'>Cancelled</span>
                          : apt.payment ? <span className='text-green-500'>Paid</span>
                          : <span className='text-orange-500'>COD</span>}
                      </td>
                      <td className='py-3'>
                        {!apt.cancelled && (
                          <button onClick={() => handleCancelAppointment(apt._id)} className='text-red-500 hover:underline text-xs'>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!dashboardData.latestAppointments || dashboardData.latestAppointments.length === 0) && (
                    <tr><td colSpan='7' className='py-6 text-center text-gray-400'>No appointments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DOCTORS TAB */}
      {activeTab === 'doctors' && (
        <div className='bg-white border rounded-xl p-6'>
          <div className='mb-8'>
            <p className='text-lg font-medium mb-4'>Add New Doctor</p>
            <form onSubmit={handleAddDoctor} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
              <input className='border rounded px-3 py-2 text-sm' placeholder='Doctor Name' value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} required />
              <input className='border rounded px-3 py-2 text-sm' placeholder='Email' type='email' value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} required />
              <input className='border rounded px-3 py-2 text-sm' placeholder='Password (min 8 chars)' type='password' value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} required />
              <select className='border rounded px-3 py-2 text-sm' value={doctorForm.speciality} onChange={e => setDoctorForm({ ...doctorForm, speciality: e.target.value })} required>
                <option value=''>Select Speciality</option>
                {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className='border rounded px-3 py-2 text-sm' placeholder='Degree (e.g. MBBS)' value={doctorForm.degree} onChange={e => setDoctorForm({ ...doctorForm, degree: e.target.value })} required />
              <input className='border rounded px-3 py-2 text-sm' placeholder='Experience (years)' type='number' value={doctorForm.experience} onChange={e => setDoctorForm({ ...doctorForm, experience: e.target.value })} required />
              <input className='border rounded px-3 py-2 text-sm' placeholder='Fees ($)' type='number' value={doctorForm.fees} onChange={e => setDoctorForm({ ...doctorForm, fees: e.target.value })} required />
              <input className='border rounded px-3 py-2 text-sm' placeholder='Address' value={doctorForm.address} onChange={e => setDoctorForm({ ...doctorForm, address: e.target.value })} required />
              <textarea className='border rounded px-3 py-2 text-sm' placeholder='About doctor' rows='2' value={doctorForm.about} onChange={e => setDoctorForm({ ...doctorForm, about: e.target.value })} required />
              <button type='submit' disabled={addingDoctor} className='bg-primary text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50'>
                {addingDoctor ? 'Adding...' : 'Add Doctor'}
              </button>
            </form>
          </div>

          <p className='text-lg font-medium mb-4'>All Doctors ({doctors.length})</p>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='pb-3 pr-4'>Image</th><th className='pb-3 pr-4'>Name</th><th className='pb-3 pr-4'>Speciality</th>
                  <th className='pb-3 pr-4'>Degree</th><th className='pb-3 pr-4'>Experience</th><th className='pb-3 pr-4'>Fees</th><th className='pb-3'>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc, i) => (
                  <tr key={i} className='border-b last:border-0'>
                    <td className='py-3 pr-4'><img className='w-10 h-10 rounded-full object-cover' src={doc.image} alt={doc.name} /></td>
                    <td className='py-3 pr-4'>{doc.name}</td><td className='py-3 pr-4'>{doc.speciality}</td>
                    <td className='py-3 pr-4'>{doc.degree}</td><td className='py-3 pr-4'>{doc.experience}y</td>
                    <td className='py-3 pr-4'>${doc.fees}</td>
                    <td className='py-3'><button onClick={() => handleDeleteDoctor(doc._id)} className='text-red-500 hover:underline text-xs'>Delete</button></td>
                  </tr>
                ))}
                {doctors.length === 0 && <tr><td colSpan='7' className='py-6 text-center text-gray-400'>No doctors found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className='bg-white border rounded-xl p-6'>
          <p className='text-lg font-medium mb-4'>All Appointments ({appointments.length})</p>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='pb-3 pr-4'>Patient</th><th className='pb-3 pr-4'>Email</th><th className='pb-3 pr-4'>Doctor</th>
                  <th className='pb-3 pr-4'>Date</th><th className='pb-3 pr-4'>Time</th><th className='pb-3 pr-4'>Fee</th>
                  <th className='pb-3 pr-4'>Payment</th><th className='pb-3 pr-4'>Status</th><th className='pb-3'>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, i) => (
                  <tr key={i} className='border-b last:border-0'>
                    <td className='py-3 pr-4'>{apt.userId?.name || 'N/A'}</td>
                    <td className='py-3 pr-4'>{apt.userId?.email || 'N/A'}</td>
                    <td className='py-3 pr-4'>{apt.docId?.name || 'N/A'}</td>
                    <td className='py-3 pr-4'>{formatDate(apt.slotDate)}</td>
                    <td className='py-3 pr-4'>{apt.slotTime}</td>
                    <td className='py-3 pr-4'>${apt.amount}</td>
                    <td className='py-3 pr-4'>
                      {apt.payment ? <span className='text-green-500'>Online</span> : <span className='text-orange-500'>COD</span>}
                    </td>
                    <td className='py-3 pr-4'>
                      {apt.cancelled ? <span className='text-red-500'>Cancelled</span> : <span className='text-green-500'>Active</span>}
                    </td>
                    <td className='py-3'>
                      {!apt.cancelled && (
                        <button onClick={() => handleCancelAppointment(apt._id)} className='text-red-500 hover:underline text-xs'>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan='9' className='py-6 text-center text-gray-400'>No appointments found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
