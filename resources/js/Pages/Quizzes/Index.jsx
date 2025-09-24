import React, { useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import NavLink from "@/Components/NavLink";
import Pagination from "@/Components/Pagination";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import SecondaryButtonLink from "@/Components/SecondaryButtonLink";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function QuizPage({
    quizzes = {
        data: [
            {
                id: 1,
                title: "Math Basics Quiz",
                subject: "Math",
                status: "Published",
                groups: ["Group A", "Group B"],
            },
            {
                id: 2,
                title: "Science Fundamentals",
                subject: "Science",
                status: "Draft",
                groups: ["Group C"],
            },
            {
                id: 3,
                title: "History of Cambodia",
                subject: "History",
                status: "Published",
                groups: ["Group A"],
            },
        ],
        links: [],
    },
}) {
    const datasList = quizzes.data;
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        id: "",
        title: "",
    });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData("id", data.id);
        setDeleteData("title", data.title);
        setConfirmingDataDeletion(true);
    };
    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        // destroy(route('quizzes.destroy', dataEdit.id), {
        //     preserveScroll: true,
        //     onSuccess: () => closeModal(),
        //     onFinish: () => reset(),
        // });
        closeModal(); // Demo only
    };
    const headWeb = "Quiz List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h3 className="card-title">Quiz Management</h3>
                                <Link
                                    href={route("quizzes.create")}
                                    className="btn btn-primary btn-sm"
                                >
                                    + Create Quiz
                                </Link>
                            </div>
                            <div className="card-body table-responsive p-0">
                                <table className="table table-hover text-nowrap">
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Title</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Groups</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datasList.length > 0 ? (
                                            datasList.map((item, k) => (
                                                <tr key={k}>
                                                    <td>{item?.id}</td>
                                                    <td>{item?.title}</td>
                                                    <td>{item?.subject}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                item.status ===
                                                                "Published"
                                                                    ? "badge-success"
                                                                    : "badge-secondary"
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td>{item.groups.join(", ")}</td>
                                                    <td width={"170px"}>
                                                        <Link
                                                            href={route(
                                                                "quizzes.create",
                                                                { id: item.id }
                                                            )}
                                                            className="btn btn-info btn-xs mr-2"
                                                        >
                                                            <i className="fas fa-edit"></i>{" "}
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                confirmDataDeletion(
                                                                    item
                                                                )
                                                            }
                                                            type="button"
                                                            className="btn btn-danger btn-xs"
                                                        >
                                                            <i className="fas fa-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6}>There are no record!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <Modal
                                    show={confirmingDataDeletion}
                                    onClose={closeModal}
                                >
                                    <form
                                        onSubmit={deleteDataRow}
                                        className="p-6"
                                    >
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Confirmation!
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Are you sure you want to delete{" "}
                                            <span className="text-lg font-medium">
                                                {deleteData.title}
                                            </span>
                                            ?
                                        </p>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeModal}>
                                                No
                                            </SecondaryButton>
                                            <DangerButton
                                                className="ms-3"
                                                disabled={processing}
                                            >
                                                Yes
                                            </DangerButton>
                                        </div>
                                    </form>
                                </Modal>
                            </div>
                            <div className="card-footer clearfix">
                                <Pagination links={quizzes.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
