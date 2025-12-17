'use client'

import { useState, useEffect } from 'react'

interface Barber {
  id: string
  name: string
  specialty: string
  description: string
  imageUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchBarbers()
  }, [])

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/admin/barbers')
      const data = await response.json()
      if (data.success) {
        setBarbers(data.data)
      }
    } catch (error) {
      console.error('Error fetching barbers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingBarber ? 'PUT' : 'POST'
      const url = editingBarber ? `/api/admin/barbers/${editingBarber.id}` : '/api/admin/barbers'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        setEditingBarber(null)
        setFormData({
          name: '',
          specialty: '',
          description: '',
          isActive: true
        })
        fetchBarbers()
      }
    } catch (error) {
      console.error('Error saving barber:', error)
    }
  }

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber)
    setFormData({
      name: barber.name,
      specialty: barber.specialty,
      description: barber.description,
      isActive: barber.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus barber ini?')) return

    try {
      const response = await fetch(`/api/admin/barbers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBarbers()
      }
    } catch (error) {
      console.error('Error deleting barber:', error)
    }
  }

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/barbers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchBarbers()
      }
    } catch (error) {
      console.error('Error updating barber status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">Loading barbers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Manajemen Barber</h1>
          <p className="text-black">Kelola data barber yang tersedia</p>
        </div>
        <button
          onClick={() => {
            setEditingBarber(null)
            setFormData({
              name: '',
              specialty: '',
              description: '',
              isActive: true
            })
            setIsModalOpen(true)
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 touch-manipulation"
        >
          Tambah Barber
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Spesialisasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {barbers.map((barber) => (
                <tr key={barber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {barber.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-black">{barber.name}</div>
                        <div className="text-sm text-gray-500">
                          {barber.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">{barber.specialty}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-black max-w-xs truncate">{barber.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(barber)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(barber.id, barber.isActive)}
                        className={`${
                          barber.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {barber.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        onClick={() => handleDelete(barber.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        
        {barbers.length === 0 && (
          <div className="p-6 text-center text-black">
            Belum ada data barber
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-black text-center">
                {editingBarber ? 'Edit Barber' : 'Tambah Barber'}
              </h3>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black">Nama</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Spesialisasi</label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Deskripsi</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    rows={3}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-black">
                    Status Aktif
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingBarber ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}