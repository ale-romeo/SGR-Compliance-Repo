import { useNavigate, useParams } from 'react-router-dom'
import ProductFormComponent from '@/components/ProductForm'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">{id ? 'Edit product' : 'New product'}</h2>
      <ProductFormComponent productId={id} onSaved={() => navigate('/')} />
      <div className="mt-4 flex justify-end">
        <button className="px-3 py-2 border border-gray-300 rounded-md" onClick={() => navigate(-1)}>Close</button>
      </div>
    </div>
  )
}
