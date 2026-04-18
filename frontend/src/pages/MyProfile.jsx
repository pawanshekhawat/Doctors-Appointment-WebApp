import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { assets } from '../assets/assets'

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: ''
  })
  const [originalData, setOriginalData] = useState({})
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('authToken')
  const userRole = localStorage.getItem('userRole')

  // Fetch profile on mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res
        if (userRole === 'doctor') {
          res = await authService.getDoctorProfile()
        } else {
          res = await authService.getProfile()
        }
        const data = res.data
        if (data.success) {
          const u = data.data.doctor || data.data.user
          const profile = {
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address?.line1 ? `${u.address.line1}, ${u.address.line2 || ''}` : (u.address || ''),
            gender: u.gender || '',
            dob: u.dob || ''
          }
          setUserData(profile)
          setOriginalData(profile)
        }
      } catch {
        // Silently fail — keep empty form
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userRole])

  const handleSave = async () => {
    setSaving(true)
    try {
      let res
      if (userRole === 'doctor') {
        res = await authService.updateDoctorProfile(userData)
      } else {
        res = await authService.updateProfile(userData)
      }
      const data = res.data
      if (data.success) {
        toast.success('Profile updated!')
        setOriginalData(userData)
        localStorage.setItem('userName', userData.name)
        setIsEdit(false)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setUserData(originalData)
    setIsEdit(false)
  }

  if (loading) return <div className='flex justify-center items-center h-64'><p>Loading...</p></div>

  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      {/* Profile Picture */}
      <img className='w-36 rounded' src={assets.profile_pic} alt="" />

      {/* Name */}
      <div className='flex flex-col gap-1'>
        <span className='text-gray-500 text-xs uppercase tracking-wide'>Name</span>
        {isEdit ? (
          <input
            className='border border-zinc-300 rounded px-2 py-1'
            value={userData.name}
            onChange={e => setUserData({ ...userData, name: e.target.value })}
          />
        ) : (
          <p className='text-zinc-900 font-medium'>{userData.name}</p>
        )}
      </div>

      {/* Email */}
      <div className='flex flex-col gap-1'>
        <span className='text-gray-500 text-xs uppercase tracking-wide'>Email</span>
        <p className='text-zinc-700'>{userData.email}</p>
      </div>

      {/* Phone */}
      <div className='flex flex-col gap-1'>
        <span className='text-gray-500 text-xs uppercase tracking-wide'>Phone</span>
        {isEdit ? (
          <input
            className='border border-zinc-300 rounded px-2 py-1'
            value={userData.phone}
            onChange={e => setUserData({ ...userData, phone: e.target.value })}
          />
        ) : (
          <p className='text-zinc-700'>{userData.phone || 'Not set'}</p>
        )}
      </div>

      {/* Address */}
      <div className='flex flex-col gap-1'>
        <span className='text-gray-500 text-xs uppercase tracking-wide'>Address</span>
        {isEdit ? (
          <input
            className='border border-zinc-300 rounded px-2 py-1'
            value={userData.address}
            onChange={e => setUserData({ ...userData, address: e.target.value })}
          />
        ) : (
          <p className='text-zinc-700'>{userData.address || 'Not set'}</p>
        )}
      </div>

      {/* Gender */}
      {userRole !== 'doctor' && (
        <div className='flex flex-col gap-1'>
          <span className='text-gray-500 text-xs uppercase tracking-wide'>Gender</span>
          {isEdit ? (
            <select
              className='border border-zinc-300 rounded px-2 py-1'
              value={userData.gender}
              onChange={e => setUserData({ ...userData, gender: e.target.value })}
            >
              <option value=''>Select</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
            </select>
          ) : (
            <p className='text-zinc-700'>{userData.gender || 'Not set'}</p>
          )}
        </div>
      )}

      {/* DOB */}
      {userRole !== 'doctor' && (
        <div className='flex flex-col gap-1'>
          <span className='text-gray-500 text-xs uppercase tracking-wide'>Date of Birth</span>
          {isEdit ? (
            <input
              className='border border-zinc-300 rounded px-2 py-1'
              type='date'
              value={userData.dob}
              onChange={e => setUserData({ ...userData, dob: e.target.value })}
            />
          ) : (
            <p className='text-zinc-700'>{userData.dob || 'Not set'}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className='flex gap-3 mt-4'>
        {isEdit ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className='bg-primary text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50'
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className='border border-zinc-300 text-zinc-600 px-6 py-2 rounded-lg text-sm'
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className='bg-primary text-white px-6 py-2 rounded-lg text-sm'
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  )
}

export default MyProfile
