import React from 'react';
import { Head } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import AdminLayout from '@/Layouts/AdminLayout';


const Dashboard = () => {
    const headWeb = 'Dashboard'
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];
    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="app-content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-3 col-6">
                                        <div className="small-box bg-info">
                                            <div className="inner">
                                                <h3>120</h3>
                                                <p>Total Homophones</p>
                                            </div>
                                            <div className="icon">
                                                <i className="fas fa-volume-up"></i>
                                            </div>
                                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-6">
                                        <div className="small-box bg-success">
                                            <div className="inner">
                                                <h3>15</h3>
                                                <p>Quizzes Created</p>
                                            </div>
                                            <div className="icon">
                                                <i className="fas fa-question-circle"></i>
                                            </div>
                                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-6">
                                        <div className="small-box bg-warning">
                                            <div className="inner">
                                                <h3>44</h3>
                                                <p>Students Registered</p>
                                            </div>
                                            <div className="icon">
                                                <i className="fas fa-user-graduate"></i>
                                            </div>
                                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-6">
                                        <div className="small-box bg-danger">
                                            <div className="inner">
                                                <h3>87</h3>
                                                <p>Practice Sessions</p>
                                            </div>
                                            <div className="icon">
                                                <i className="fas fa-chalkboard-teacher"></i>
                                            </div>
                                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                                        </div>
                                    </div>
                                </div>
                                {/* Graph/Chart Placeholder */}
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h5 className="card-title mb-0">Homophone Activity Overview (Graph Placeholder)</h5>
                                            </div>
                                            <div className="card-body" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                                                <span style={{ color: '#aaa', fontSize: '1.2rem' }}>
                                                    [Graph will be displayed here]
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
};

export default Dashboard;