import Breadcrumb from '@/Components/Breadcrumb';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers, Calendar } from 'lucide-react';

export default function CategoriesPage({ categoryData }) {
    const datasList = categoryData.data;
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({})
    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, errors, clearErrors } =
        useForm({
            id: '',
            name: ''
        });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData('id', data.id)
        setDeleteData('name', data.name)
        setConfirmingDataDeletion(true);
    };
    
    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({})
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        destroy(route('categories.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };
    
    const headWeb = 'Category List'
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            
            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-blue-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-800 text-base font-semibold">Total Categories</p>
                                <div className="text-blue-500">
                                    <Layers className="w-7 h-7" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{categoryData.total || datasList.length}</h2>
                                <p className="text-xs text-gray-500 mt-1">All categories in the system</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Table Card */}
                    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            <h3 className="text-xl font-semibold">Category Management</h3>
                            <div className="flex items-center gap-3 ml-auto">
                                {/* Add Category Button */}
                                <Link
                                    href={route('categories.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Category
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold">#ID</th>
                                        <th className="py-4 px-6 font-semibold">Name</th>
                                        <th className="py-4 px-6 font-semibold">View Order</th>
                                        <th className="py-4 px-6 font-semibold">Created At</th>
                                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 bg-white divide-y divide-gray-200">
                                    {datasList.length > 0 ? (
                                        datasList.map((item, k) => (
                                            <tr key={k} className="hover:bg-blue-50 transition-all duration-200">
                                                <td className="py-4 px-6 font-semibold text-gray-900">{item?.id}</td>
                                                <td className="py-4 px-6">
                                                    <p className="font-medium text-gray-900">{item?.name}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {item?.view_order}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {moment(item?.created_at).format("DD/MM/YYYY")}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Edit Button */}
                                                        <div className="relative group">
                                                            <Link
                                                                href={route('categories.edit', item.id)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Link>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-xl shadow-sm border">
                                                                Edit Category
                                                            </div>
                                                        </div>

                                                        {/* Delete Button */}
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => confirmDataDeletion(item)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-xl shadow-sm border">
                                                                Delete Category
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                No categories found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer with Pagination */}
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <Pagination links={categoryData.links} />
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    <Modal show={confirmingDataDeletion} onClose={closeModal}>
                        <form onSubmit={deleteDataRow} className="p-6">
                            <h2 className="text-lg font-medium text-gray-900">
                                Confirm Deletion
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Are you sure you want to delete <span className='text-lg font-medium text-red-600'>{deleteData.name}</span>?
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                This action cannot be undone.
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 border-2 hover:bg-gray-50 hover:border-gray-300 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-200 disabled:opacity-50"
                                >
                                    {processing ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
        </AdminLayout>
    );
}
