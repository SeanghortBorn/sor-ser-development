import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import NavLink from '@/Components/NavLink';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function UsersCreateEdit({ user, roles }) {
    // Provide default user object if not passed
    user = user || { id: null, name: '', email: '', roles: [], created_at: null };
    const { data, setData, post, patch, errors, reset, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? '',
            email: user.email ?? '',
            roles: Array.isArray(user.roles) && user.roles.length > 0
                ? user.roles.map(role => role.id)
                : [],
            password: '', // Always a string
        });

    const submit = (e) => {
        e.preventDefault();
        if (!user.id) {
            post(route('users.store'), {
                preserveState: true,
                onFinish: () => reset(),
            });
        } else {
            patch(route('users.update', user.id), {
                preserveState: true,
                onFinish: () => reset(),
            });
        }
    };

    const headWeb = user.id ? 'User Edit' : 'User Create';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];
    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">{user.id ? 'Edit User' : 'Register Data Management'}</h3>
                            </div>
                            <form onSubmit={submit}>
                                <div className="card-body">
                                    {/* #ID Field (readonly, only for edit) */}
                                    {/* {user.id && (
                                        <div className="form-group">
                                            <label className="text-uppercase" htmlFor="id">#ID</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={user.id}
                                                readOnly
                                            />
                                        </div>
                                    )} */}

                                    {/* Name Field */}
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="name">
                                            <span className="text-danger">*</span> Name
                                        </label>
                                        <input
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            type="text"
                                            name="name"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            id="name"
                                        />
                                        <InputError className="mt-2" message={errors.name} />
                                    </div>

                                    {/* Email Field */}
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="email">
                                            <span className="text-danger">*</span> Email
                                        </label>
                                        <input
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            type="email"
                                            name="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="email"
                                            readOnly={!!user.id}
                                        />
                                        <InputError className="mt-2" message={errors.email} />
                                    </div>

                                    {/* Password Field (only for create) */}
                                    {!user.id && (
                                        <div className="form-group">
                                            <label className="text-uppercase" htmlFor="password">
                                                <span className="text-danger">*</span> Password
                                            </label>
                                            <input
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                type="password"
                                                name="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="password"
                                                autoComplete="new-password"
                                            />
                                            <InputError className="mt-2" message={errors.password} />
                                        </div>
                                    )}

                                    {/* Role Selection */}
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="roles">
                                            <span className="text-danger">*</span> Role
                                        </label>
                                        <select
                                            name="roles"
                                            value={data.roles[0] ?? ''}
                                            onChange={e => setData('roles', e.target.value ? [parseInt(e.target.value)] : [])}
                                            className="form-control"
                                        >
                                            <option value="">Select a Role (optional)</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={errors.roles} />
                                    </div>

                                    {/* Created At Field (readonly, only for edit) */}
                                    {user.id && user.created_at && (
                                        <div className="form-group">
                                            <label className="text-uppercase" htmlFor="created_at">Created At</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : ''}
                                                readOnly
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer clearfix">
                                    <button
                                        disabled={processing}
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {processing
                                            ? user?.id
                                                ? 'Updating...'
                                                : 'Saving...'
                                            : user?.id
                                                ? 'Update'
                                                : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}