import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Link, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useState } from 'react'
import Modal from '@/components/Modal'
import ProductForm from '@/components/ProductForm'

interface Product {
  id: string
  name: string
  price: string | number
  tags: string[]
  categoryId?: string | null
  createdAt: string
}

interface ProductsResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
}

interface Category { id: string; name: string }

const intOr = (v: string | null, d: number) => {
  const n = v ? parseInt(v, 10) : NaN
  return Number.isFinite(n) && n > 0 ? n : d
}

export default function ProductsList() {
  const [sp, setSp] = useSearchParams()

  // Defaults
  const page = intOr(sp.get('page'), 1)
  const pageSize = intOr(sp.get('pageSize'), 20)
  const search = sp.get('search') || ''
  const categoryId = sp.get('categoryId') || ''
  const minPrice = sp.get('minPrice') || ''
  const maxPrice = sp.get('maxPrice') || ''
  const sortBy = sp.get('sortBy') || 'price'
  const sortOrder = sp.get('sortOrder') || 'desc'
  const view = sp.get('view') || 'table' // 'table' | 'grid'

  const queryParams = useMemo(() => ({
    page,
    pageSize,
    search: search || undefined,
    categoryId: categoryId || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy,
    sortOrder,
  }), [page, pageSize, search, categoryId, minPrice, maxPrice, sortBy, sortOrder])

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const res = await api.get<ProductsResponse>('/products', { params: queryParams })
      return res.data
    },
    placeholderData: keepPreviousData,
  })

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/categories')
      return res.data
    },
  })

  const categoriesMap = useMemo(() => {
    const m = new Map<string, string>()
    categories?.forEach((c) => m.set(c.id, c.name))
    return m
  }, [categories])

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp)
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    })
    if ('search' in updates || 'categoryId' in updates || 'minPrice' in updates || 'maxPrice' in updates || 'sortBy' in updates || 'sortOrder' in updates) {
      next.set('page', '1')
    }
    setSp(next, { replace: false })
  }

  const tagColor = (t: string) => {
    // Deterministic pastel colors based on tag hash
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-red-100 text-red-800',
      'bg-slate-200 text-slate-800',
    ] as const
    let h = 0
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
    return colors[h % colors.length]
  }

  const fmtPrice = (price: string | number) => {
    const n = typeof price === 'string' ? parseFloat(price) : price
    if (!Number.isFinite(n)) return '€ —'
    return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
  }

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; id?: string } | null>(null)
  const qc = useQueryClient()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">Error loading products</div>

  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => updateParams({ view: view === 'grid' ? 'table' : 'grid' })}
            type="button"
            title="Toggle view"
          >{view === 'grid' ? 'Table' : 'Cards'}</button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => setSp(new URLSearchParams(), { replace: false })}
            type="button"
            title="Reset filters"
          >Reset</button>
          <button onClick={() => setModal({ mode: 'create' })} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md">New</button>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4" onSubmit={(e)=>e.preventDefault()}>
        <input
          className="md:col-span-2 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search name..."
          value={search}
          onChange={(e)=>updateParams({ search: e.target.value })}
        />
        <select
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={categoryId}
          onChange={(e)=>updateParams({ categoryId: e.target.value })}
        >
          <option value="">All categories</option>
          {categories?.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          type="number"
          min={0}
          placeholder="Min price"
          value={minPrice}
          onChange={(e)=>updateParams({ minPrice: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          type="number"
          min={0}
          placeholder="Max price"
          value={maxPrice}
          onChange={(e)=>updateParams({ maxPrice: e.target.value })}
        />
        <div className="md:col-span-2 grid grid-cols-2 gap-2 min-w-0">
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e)=>updateParams({ sortBy: e.target.value })}
          >
            <option value="created_at">Created</option>
            <option value="price">Price</option>
          </select>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortOrder}
            onChange={(e)=>updateParams({ sortOrder: e.target.value })}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </form>

      {view === 'table' ? (
        <table className="w-full text-left border border-gray-200 rounded-md overflow-hidden">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-2 border border-gray-200">Name</th>
              <th className="p-2 border border-gray-200">Price</th>
              <th className="p-2 border border-gray-200">Tags</th>
              <th className="p-2 border border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.data.length ? data.data.map((p: Product) => (
              <tr key={p.id} className="even:bg-gray-50">
                <td className="p-2 border border-gray-200 text-gray-900">{p.name}</td>
                <td className="p-2 border border-gray-200 text-gray-900">{fmtPrice(p.price)}</td>
                <td className="p-2 border border-gray-200 text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {p.tags?.map((t) => (
                      <span key={t} className={`px-2 py-0.5 text-xs rounded-full ${tagColor(t)}`}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="p-2 border border-gray-200">
                  <button onClick={() => setModal({ mode: 'edit', id: p.id })} className="text-blue-600">Edit</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={4}>No products found. Try adjusting filters or add a new one.</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <div>
          {data?.data.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((p: Product) => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900">{p.name}</h3>
                    <span className="text-sm font-semibold text-gray-900">{fmtPrice(p.price)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{categoriesMap.get(p.categoryId || '') || '—'}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags?.length ? p.tags.map((t) => (
                      <span key={t} className={`px-2 py-0.5 text-xs rounded-full ${tagColor(t)}`}>{t}</span>
                    )) : <span className="text-xs text-gray-400">no tags</span>}
                  </div>
                  <div className="mt-3">
                    <button onClick={() => setModal({ mode: 'edit', id: p.id })} className="text-blue-600 text-sm">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No products found. Try adjusting filters or add a new one.</div>
          )}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit product' : 'New product'}
        widthClass="max-w-2xl"
      >
        <ProductForm
          productId={modal?.mode === 'edit' ? modal.id : undefined}
          onSaved={async () => {
            await qc.invalidateQueries({ queryKey: ['products'] })
            setModal(null)
          }}
        />
        <div className="mt-4 flex justify-end">
          <button className="px-3 py-2 border border-gray-300 rounded-md" onClick={() => setModal(null)}>Close</button>
        </div>
      </Modal>

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
            onClick={()=>updateParams({ page: String(Math.max(1, page - 1)) })}
            disabled={page <= 1}
          >Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button
            className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
            onClick={()=>updateParams({ page: String(Math.min(totalPages, page + 1)) })}
            disabled={page >= totalPages}
          >Next</button>
          <select
            className="ml-2 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
            value={String(pageSize)}
            onChange={(e)=>updateParams({ pageSize: e.target.value, page: '1' })}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  )
}
