import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { appointmentService } from '../services/appointmentService'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const MyAppointment = () => {
  const { currencySymbol } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [paying, setPaying] = useState(null)

  const token = localStorage.getItem('authToken')

  const fetchAppointments = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await appointmentService.getUserAppointments()
      if (data.success) {
        setAppointments(data.data.appointments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handlePay = async (appointmentId) => {
    setPaying(appointmentId)
    try {
      // 1. Create Razorpay order
      const { data: orderData } = await appointmentService.createOrder(appointmentId)
      if (!orderData.success) {
        toast.error(orderData.message)
        setPaying(null)
        return
      }

      const { orderId, amount, key } = orderData.data

      // 2. Open Razorpay checkout
      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Prescripto',
        description: 'Appointment Payment',
        order_id: orderId,
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            const { data: verifyData } = await appointmentService.verifyPayment({
              appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyData.success) {
              toast.success('Payment successful!')
              setAppointments(appointments.map(a =>
                a._id === appointmentId ? { ...a, payment: true } : a
              ))
            } else {
              toast.error(verifyData.message)
            }
          } catch {
            toast.error('Payment verification failed')
          }
          setPaying(null)
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setPaying(null)
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
        },
        theme: {
          color: '#4F46E5',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.')
        setPaying(null)
      })
      rzp.open()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed')
      setPaying(null)
    }
  }

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(appointmentId)
    try {
      const { data } = await appointmentService.cancelAppointment(appointmentId)
      if (data.success) {
        toast.success('Appointment cancelled')
        setAppointments(appointments.map(a =>
          a._id === appointmentId ? { ...a, cancelled: true } : a
        ))
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Cancel failed')
    } finally {
      setCancelling(null)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  if (loading) return <div className='flex justify-center items-center h-64'><p>Loading...</p></div>

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>

      {appointments.length === 0 ? (
        <p className='text-center text-gray-400 mt-8'>No appointments found.</p>
      ) : (
        appointments.map((item, index) => (
          <div
            className='grid grid-cols-[1fr_2fr] sm:flex sm:gap-6 py-4 border-b'
            key={index}
          >
            {/* Doctor Image */}
            <div className='flex items-center'>
              <img
                className='w-32 bg-indigo-50 rounded-lg'
                src={item.docId?.image || 'https://via.placeholder.com/150?text=Doctor'}
                alt=''
              />
            </div>

            {/* Details */}
            <div className='flex-1 text-sm'>
              <p className='font-semibold text-zinc-800 text-base'>{item.docId?.name || 'Doctor'}</p>
              <p className='text-zinc-500 text-xs mt-1'>
                {item.docId?.speciality || 'General'} — {item.docId?.degree || ''}
              </p>

              <div className='mt-3 space-y-1'>
                <p className='text-zinc-700'>
                  <span className='font-medium text-zinc-800'>Date:</span> {formatDate(item.slotDate)}
                </p>
                <p className='text-zinc-700'>
                  <span className='font-medium text-zinc-800'>Time:</span> {item.slotTime}
                </p>
                <p className='text-zinc-700'>
                  <span className='font-medium text-zinc-800'>Fee:</span> {currencySymbol}{item.amount}
                </p>
                {item.payment ? (
                  <p className='text-green-600 text-xs font-medium'>Payment: Paid Online</p>
                ) : (
                  <p className='text-orange-500 text-xs font-medium'>Payment: Cash on Visit</p>
                )}
              </div>

              {/* Status + Action */}
              <div className='flex items-center gap-3 mt-4'>
                {item.cancelled ? (
                  <span className='px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-medium'>
                    Cancelled
                  </span>
                ) : item.completed ? (
                  <span className='px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium'>
                    Completed
                  </span>
                ) : (
                  <>
                    <span className='px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-xs font-medium'>
                      Active
                    </span>
                    {!item.payment && (
                      <button
                        onClick={() => handlePay(item._id)}
                        disabled={paying === item._id}
                        className='px-3 py-1.5 rounded-full bg-primary text-white text-xs hover:opacity-80 transition-colors disabled:opacity-50'
                      >
                        {paying === item._id ? 'Opening...' : 'Pay Online'}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(item._id)}
                      disabled={cancelling === item._id}
                      className='px-3 py-1.5 rounded-full border border-red-300 text-red-500 text-xs hover:bg-red-50 transition-colors disabled:opacity-50'
                    >
                      {cancelling === item._id ? 'Cancelling...' : 'Cancel Appointment'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default MyAppointment