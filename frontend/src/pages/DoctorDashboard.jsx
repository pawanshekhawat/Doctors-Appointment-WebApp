import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/axios'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const DoctorDashboard = () => {
  const { currencySymbol } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ doctor: {}, appointmentsCount: 0, latestAppointments: [], earnings: 0 })
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [cancelling, setCancelling] = useState(null)
  const [completing, setCompleting] = useState(null)

  const token = localStorage.getItem('authToken')
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get('/api/doctor/dashboard', authHeader)
      if (res.success) setData(res.data)
    } catch { toast.error('Failed to load dashboard') }
  }

  const fetchAppointments = async () => {
    try {
      const { data: res } = await api.get('/api/appointment/doctor-appointments', authHeader)
      if (res.success) setAppointments(res.data.appointments)
    } catch { toast.error('Failed to load appointments') }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchDashboard()
      setLoading(false)
    }
    init()
    fetchAppointments()
  }, [])

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(appointmentId)
    try {
      const { data: res } = await api.put(`/api/appointment/cancel-by-doctor/${appointmentId}`, {}, authHeader)
      if (res.success) {
        toast.success('Appointment cancelled')
        setAppointments(appointments.map(a => a._id === appointmentId ? { ...a, cancelled: true } : a))
        fetchDashboard()
      } else toast.error(res.message)
    } catch { toast.error('Cancel failed') }
    finally { setCancelling(null) }
  }

  const handleComplete = async (appointmentId) => {
    setCompleting(appointmentId)
    try {
      const { data: res } = await api.put(`/api/appointment/complete/${appointmentId}`, {}, authHeader)
      if (res.success) {
        toast.success('Appointment marked complete')
        setAppointments(appointments.map(a => a._id === appointmentId ? { ...a, completed: true } : a))
        fetchDashboard()
      } else toast.error(res.message)
    } catch { toast.error('Action failed') }
    finally { setCompleting(null) }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (loading) return <div className='flex justify-center items-center h-64'><p>Loading...</p></div>

  const paidCount = appointments.filter(a => !a.cancelled && a.payment).length
  const activeCount = appointments.filter(a => !a.cancelled && !a.completed).length

  return (
    <div className='m-5'>
      <div className='flex gap-4 mb-6'>
        {['dashboard', 'appointments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-primary text-white' : 'bg-white border text-zinc-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
            <div className='border rounded-xl p-6 flex items-center gap-4 bg-white'>
              <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600'>{data.appointmentsCount}</div>
              <div><p className='text-gray-500 text-sm'>Total Appointments</p><p className='text-xl font-semibold'>{data.appointmentsCount}</p></div>
            </div>
            <div className='border rounded-xl p-6 flex items-center gap-4 bg-white'>
              <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-600'>{paidCount}</div>
              <div><p className='text-gray-500 text-sm'>Earnings</p><p className='text-xl font-semibold'>{currencySymbol}{data.earnings}</p></div>
            </div>
            <div className='border rounded-xl p-6 flex items-center gap-4 bg-white'>
              <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600'>{activeCount}</div>
              <div><p className='text-gray-500 text-sm'>Active Appointments</p><p className='text-xl font-semibold'>{activeCount}</p></div>
            </div>
          </div>

          <div className='bg-white border rounded-xl p-6 mb-6'>
            <div className='flex items-start gap-4'>
              <img className='w-20 h-20 rounded-lg object-cover' src={data.doctor.image} alt={data.doctor.name} />
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-xl font-semibold'>{data.doctor.name}</h2>
                  <img className='w-4' src={assets.verified_icon} alt='' />
                </div>
                <p className='text-gray-500 text-sm'>{data.doctor.degree} - {data.doctor.speciality}</p>
                <p className='text-gray-400 text-xs mt-1'>{data.doctor.experience} years experience</p>
                <p className='text-gray-600 text-sm mt-2'>{data.doctor.about}</p>
                <p className='text-primary font-medium mt-2'>Fees: {currencySymbol}{data.doctor.fees}</p>
              </div>
            </div>
          </div>

          <div className='bg-white border rounded-xl p-6'>
            <p className='text-lg font-medium mb-4'>Latest Appointments</p>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-500 border-b'>
                    <th className='pb-3 pr-4'>Patient</th><th className='pb-3 pr-4'>Date</th><th className='pb-3 pr-4'>Time</th>
                    <th className='pb-3 pr-4'>Fee</th><th className='pb-3 pr-4'>Payment</th><th className='pb-3 pr-4'>Status</th><th className='pb-3'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.latestAppointments?.map((apt, i) => (
                    <tr key={i} className='border-b last:border-0'>
                      <td className='py-3 pr-4'>{apt.userId?.name || 'N/A'}</td>
                      <td className='py-3 pr-4'>{formatDate(apt.slotDate)}</td>
                      <td className='py-3 pr-4'>{apt.slotTime}</td>
                      <td className='py-3 pr-4'>{currencySymbol}{apt.amount}</td>
                      <td className='py-3 pr-4'>
                        {apt.payment
                          ? <span className='text-green-500'>Paid</span>
                          : <span className='text-orange-500'>COD</span>}
                      </td>
                      <td className='py-3 pr-4'>
                        {apt.cancelled ? <span className='text-red-500'>Cancelled</span>
                          : apt.completed ? <span className='text-blue-500'>Completed</span>
                          : <span className='text-green-500'>Active</span>}
                      </td>
                      <td className='py-3 flex gap-2'>
                        {!apt.cancelled && !apt.completed && (
                          <>
                            <button onClick={() => handleComplete(apt._id)} disabled={completing === apt._id}
                              className='text-blue-500 hover:underline text-xs'>{completing === apt._id ? '...' : 'Complete'}</button>
                            <button onClick={() => handleCancel(apt._id)} disabled={cancelling === apt._id}
                              className='text-red-500 hover:underline text-xs'>{cancelling === apt._id ? '...' : 'Cancel'}</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!data.latestAppointments || data.latestAppointments.length === 0) && (
                    <tr><td colSpan='7' className='py-6 text-center text-gray-400'>No appointments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className='bg-white border rounded-xl p-6'>
          <p className='text-lg font-medium mb-4'>All Appointments ({appointments.length})</p>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='pb-3 pr-4'>#</th><th className='pb-3 pr-4'>Patient</th><th className='pb-3 pr-4'>Email</th>
                  <th className='pb-3 pr-4'>Phone</th><th className='pb-3 pr-4'>Date</th><th className='pb-3 pr-4'>Time</th>
                  <th className='pb-3 pr-4'>Fee</th><th className='pb-3 pr-4'>Payment</th><th className='pb-3 pr-4'>Status</th><th className='pb-3'>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, i) => (
                  <tr key={i} className='border-b last:border-0'>
                    <td className='py-3 pr-4'>{i + 1}</td>
                    <td className='py-3 pr-4'>{apt.userId?.name || 'N/A'}</td>
                    <td className='py-3 pr-4'>{apt.userId?.email || 'N/A'}</td>
                    <td className='py-3 pr-4'>{apt.userId?.phone || 'N/A'}</td>
                    <td className='py-3 pr-4'>{formatDate(apt.slotDate)}</td>
                    <td className='py-3 pr-4'>{apt.slotTime}</td>
                    <td className='py-3 pr-4'>{currencySymbol}{apt.amount}</td>
                    <td className='py-3 pr-4'>
                      {apt.payment
                        ? <span className='text-green-500'>Online</span>
                        : <span className='text-orange-500'>COD</span>}
                    </td>
                    <td className='py-3 pr-4'>
                      {apt.cancelled ? <span className='text-red-500'>Cancelled</span>
                        : apt.completed ? <span className='text-blue-500'>Completed</span>
                        : <span className='text-green-500'>Active</span>}
                    </td>
                    <td className='py-3 flex gap-2'>
                      {!apt.cancelled && !apt.completed && (
                        <>
                          <button onClick={() => handleComplete(apt._id)} disabled={completing === apt._id}
                            className='text-blue-500 hover:underline text-xs'>{completing === apt._id ? '...' : 'Complete'}</button>
                          <button onClick={() => handleCancel(apt._id)} disabled={cancelling === apt._id}
                            className='text-red-500 hover:underline text-xs'>{cancelling === apt._id ? '...' : 'Cancel'}</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan='10' className='py-6 text-center text-gray-400'>No appointments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
