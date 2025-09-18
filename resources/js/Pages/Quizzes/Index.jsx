import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';

export default function QuizzesPage({ quizData }) {
    // Safely handle undefined quizData
    const datasList = quizData?.data ?? [];
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({})
    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, errors, clearErrors } =
        useForm({
            id: '',
            name: ''
        });

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({})
        clearErrors();
        reset();
    };

    const headWeb = 'Quiz List'
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">
                                    Quiz Management
                                </h3>
                                <div className="card-tools">
                                    <div className="input-group input-group-sm" style={{ width: '150px' }}>
                                        <input type="text" name="table_search" className="form-control float-right" placeholder="Search" />
                                        <div className="input-group-append">
                                            <button type="submit" className="btn btn-default">
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Show table or empty state */}
                            <div className="card-body table-responsive p-0">
                                {datasList.length > 0 ? (
                                    <table className="table table-hover text-nowrap">
                                        <thead>
                                            <tr>
                                                <th>#ID</th>
                                                <th>Name</th>
                                                <th>View Order</th>
                                                <th>Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datasList.map((item, k) => (
                                                <tr key={k}>
                                                    <td>{item?.id}</td>
                                                    <td>{item?.name}</td>
                                                    <td>{item?.view_order}</td>
                                                    <td>{moment(item?.created_at).format("DD/MM/YYYY")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No quizzes found.
                                    </div>
                                )}
                            </div>
                            <div className="card-footer clearfix">
                                <Pagination links={quizData?.links ?? []} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
