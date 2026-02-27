import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Plus, Trash2, Search, Package, Clock, CheckCircle2, XCircle, User, Calendar } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils';

export function Orders() {
    const { orders, recipes, addOrder, updateOrder, deleteOrder } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<Order, 'id'>>({
        customerName: '',
        deliveryDate: '',
        status: 'pending',
        items: [],
        totalPrice: 0,
        depositPaid: 0,
        notes: '',
    });

    const [currentItem, setCurrentItem] = useState({
        recipeId: '',
        quantity: 1,
        notes: '',
    });

    const filteredOrders = orders.filter((o) =>
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddItem = () => {
        if (!currentItem.recipeId || currentItem.quantity <= 0) return;
        setFormData({
            ...formData,
            items: [...formData.items, currentItem],
        });
        setCurrentItem({ recipeId: '', quantity: 1, notes: '' });
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateOrder(editingId, formData);
        } else {
            addOrder(formData);
        }
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({
            customerName: '',
            deliveryDate: '',
            status: 'pending',
            items: [],
            totalPrice: 0,
            depositPaid: 0,
            notes: '',
        });
    };

    const handleEdit = (order: Order) => {
        setFormData({ ...order });
        setEditingId(order.id);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-serif font-bold text-[var(--color-pastry-brown)]">Pedidos</h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-[var(--color-pastry-accent)] hover:bg-[var(--color-pastry-accent-hover)] text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    <span className="font-medium">Nuevo Pedido</span>
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-pastry-cream)]">
                    <h3 className="text-2xl font-serif font-bold text-[var(--color-pastry-brown)] mb-6">
                        {editingId ? 'Editar Pedido' : 'Nuevo Pedido'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Cliente</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] outline-none"
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Fecha de Entrega</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.deliveryDate}
                                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Precio Total</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.totalPrice || ''}
                                    onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
                                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Seña Pagada</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.depositPaid || ''}
                                    onChange={(e) => setFormData({ ...formData, depositPaid: parseFloat(e.target.value) })}
                                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-pastry-text)] mb-2">Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl focus:ring-2 focus:ring-[var(--color-pastry-accent)] outline-none"
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-[var(--color-pastry-cream)] pt-6">
                            <h4 className="text-xl font-serif font-bold text-[var(--color-pastry-brown)] mb-4">Productos del Pedido</h4>
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <select
                                    value={currentItem.recipeId}
                                    onChange={(e) => setCurrentItem({ ...currentItem, recipeId: e.target.value })}
                                    className="flex-1 p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl"
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                                    className="w-24 p-3 bg-[var(--color-pastry-bg)] border border-[var(--color-pastry-cream)] rounded-xl"
                                    placeholder="Cant."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="bg-[var(--color-pastry-brown)] text-white px-6 py-2 rounded-xl"
                                >
                                    Agregar
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.items.map((item, idx) => {
                                    const recipe = recipes.find(r => r.id === item.recipeId);
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-[var(--color-pastry-bg)] rounded-xl">
                                            <span>{item.quantity}x {recipe?.name}</span>
                                            <button type="button" onClick={() => removeItem(idx)} className="text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 text-gray-500">Cancelar</button>
                            <button type="submit" className="bg-[var(--color-pastry-brown)] text-white px-8 py-2 rounded-xl">Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-pastry-cream)] hover:premium-shadow transition-all relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-[var(--color-pastry-brown)] flex items-center gap-2">
                                    <User size={18} className="text-[var(--color-pastry-accent)]" /> {order.customerName}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <Calendar size={14} /> Entrega: {new Date(order.deliveryDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {order.status === 'pending' ? 'Pendiente' : order.status === 'completed' ? 'Listo' : 'Cancelado'}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            {order.items.map((item, idx) => {
                                const recipe = recipes.find(r => r.id === item.recipeId);
                                return (
                                    <p key={idx} className="text-sm text-stone-600 flex items-center gap-2">
                                        <Package size={14} /> {item.quantity}x {recipe?.name}
                                    </p>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-end pt-4 border-t border-[var(--color-pastry-cream)]">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total</p>
                                <p className="text-xl font-bold text-[var(--color-pastry-brown)]">{formatCurrency(order.totalPrice)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(order)} className="p-2 text-gray-400 hover:text-[var(--color-pastry-accent)]"><Clock size={18} /></button>
                                <button onClick={() => deleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
