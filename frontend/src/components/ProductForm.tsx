import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { z } from 'zod'

type Product = {
  id: string
  name: string
  price: string | number
  tags: string[]
  categoryId?: string | null
}

type Category = { id: string; name: string }

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.string().min(1).refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Invalid price'),
  categoryId: z.string().optional().nullable(),
  tags: z.string().optional(),
})

export default function ProductForm({ productId, onSaved }: { productId?: string; onSaved?: () => void }) {
  const isEdit = Boolean(productId)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  })

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', productId],
    enabled: isEdit,
    queryFn: async () => (await api.get<Product>(`/products/${productId}`)).data,
  })

  const [form, setForm] = useState({
    name: '',
    price: '',
    categoryId: '',
    tags: '',
  })

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: String(product.price ?? ''),
        categoryId: product.categoryId || '',
        tags: (product.tags || []).join(', '),
      })
    }
  }, [product])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit) return (await api.put(`/products/${productId}`, payload)).data
      return (await api.post('/products', payload)).data
    },
    onSuccess: () => onSaved?.(),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      alert(parsed.error.errors.map((er) => er.message).join('\n'))
      return
    }
    const v = parsed.data
    const payload = {
      name: v.name.trim(),
      price: String(Number(v.price).toFixed(2)),
      categoryId: v.categoryId || undefined,
      tags: (v.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    mutation.mutate(payload)
  }

  const title = isEdit ? 'Edit product' : 'New product'
  const saving = mutation.isPending

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 2 && !Number.isNaN(Number(form.price))
  }, [form.name, form.price])

  if (isEdit && loadingProduct) return <div>Loading...</div>

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Product name"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Price</label>
        <input
          name="price"
          value={form.price}
          onChange={onChange}
          type="number"
          step="0.01"
          min="0"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">(optional)</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Tags (comma separated)</label>
        <input
          name="tags"
          value={form.tags}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="gadget, premium"
        />
      </div>

      <div className="md:col-span-2 flex gap-2 justify-end mt-2">
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
        >{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}
