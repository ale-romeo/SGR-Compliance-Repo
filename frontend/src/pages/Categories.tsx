import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'

type Category = { id: string; name: string }

export default function Categories() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  })

  const [name, setName] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = { name: name.trim() }
      return (await api.post('/categories', payload)).data
    },
    onSuccess: async () => {
      setName('')
      setErrMsg('')
      await qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || 'Failed to create category'
      setErrMsg(Array.isArray(msg) ? msg.join(', ') : String(msg))
    },
  })

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setErrMsg('Name is required')
      return
    }
    if (trimmed.length > 50) {
      setErrMsg('Name must be at most 50 characters')
      return
    }
    createMutation.mutate(trimmed)
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Categories</h2>

      <form onSubmit={onCreate} className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          disabled={createMutation.isPending}
        >Add</button>
      </form>
      {errMsg && (
        <div className="mb-3 text-sm text-red-600">{errMsg}</div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error loading categories</div>
      ) : (
        <table className="w-full text-left border border-gray-200 rounded-md overflow-hidden">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-2 border border-gray-200">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data && data.length ? (
              data.map((c) => (
                <tr key={c.id} className="even:bg-gray-50">
                  <td className="p-2 border border-gray-200 text-gray-900">{c.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500">No categories yet. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
