import Breadcrumb from '@/Components/Breadcrumb';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CategoriesCreateEdit({ datas }) {
    const headWeb = 'Quiz Create'
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
                                    Register Data Management
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}