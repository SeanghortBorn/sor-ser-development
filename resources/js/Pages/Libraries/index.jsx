import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, usePage } from "@inertiajs/react";
import { useRef, useState, useEffect } from "react";
import { Plus, FileText, Pencil, Trash2, Tags } from "lucide-react";
import Footer from "@/Components/Footer/Footer";
import TagsSection from "@/Components/Tags/TagsSection";
import AnalyticsSection from "@/Components/Analytics/AnalyticsSection";
import axios from "axios";

export default function Library() {
    const [documentsData, setDocumentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingDoc, setDeletingDoc] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRefs = useRef({});
    const [showEditNameModal, setShowEditNameModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [editingDocTitle, setEditingDocTitle] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const editNameInputRef = useRef(null);
    const [showEditTagsModal, setShowEditTagsModal] = useState(false);
    const [editingTagsDoc, setEditingTagsDoc] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [savingTags, setSavingTags] = useState(false);
    const [filteredTagId, setFilteredTagId] = useState(null);
    // Add a separate loading state for tags
    const [tagsLoading, setTagsLoading] = useState(true);

    // Fetch all tags once on mount or when user changes
    const fetchAllTags = () => {
        if (!currentUserId) {
            setAllTags([]);
            setTagsLoading(false);
            return;
        }
        setTagsLoading(true);
        axios
            .get("/tags", { headers: { Accept: "application/json" } })
            .then((res) => {
                const all = res.data.data || [];
                setAllTags(all.filter((tag) => tag.user_id === currentUserId));
            })
            .catch(() => setAllTags([]))
            .finally(() => setTagsLoading(false));
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get("/grammar-checkers", {
                headers: { Accept: "application/json" },
            })
            .then((res) => {
                const docs = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || [];
                // Only show documents for the current user
                setDocumentsData(
                    currentUserId
                        ? docs.filter((doc) => doc.user_id === currentUserId)
                        : []
                );
            })
            .catch(() => setDocumentsData([]))
            .finally(() => setLoading(false));
    }, [currentUserId]);

    useEffect(() => {
        fetchAllTags();
    }, [currentUserId]);

    // Open delete confirmation modal
    const openDeleteModal = (doc) => {
        setDeletingDoc(doc);
        setShowDeleteModal(true);
        setOpenDropdownId(null); // <-- close dropdown when opening modal
    };

    // Delete document
    const handleDeleteDoc = async (e) => {
        e.preventDefault();
        if (!deletingDoc) return;
        await axios.delete(`/grammar-checkers/${deletingDoc.id}`);
        setShowDeleteModal(false);
        setDeletingDoc(null);
        setDocumentsData((prev) =>
            prev.filter((doc) => doc.id !== deletingDoc.id)
        );
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                openDropdownId !== null &&
                dropdownRefs.current[openDropdownId] &&
                !dropdownRefs.current[openDropdownId].contains(event.target)
            ) {
                setOpenDropdownId(null);
            }
        }
        if (openDropdownId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdownId]);

    // Open modal for edit
    const openEditNameModal = (doc = null) => {
        if (doc) {
            setEditingDoc(doc);
            setEditingDocTitle(doc.title || "");
        } else {
            setEditingDoc(null);
            setEditingDocTitle("");
        }
        setShowEditNameModal(true);
        setOpenDropdownId(null);
    };

    const closeEditNameModal = () => {
        setShowEditNameModal(false);
        setEditingDoc(null);
        setEditingDocTitle("");
    };

    // Save the new title to backend
    const handleSaveEdit = async (e) => {
        if (e) e.preventDefault();
        if (!editingDocTitle.trim() || !editingDoc) return;
        setSavingEdit(true);
        try {
            await axios.patch(`/grammar-checkers/${editingDoc.id}`, {
                title: editingDocTitle,
                word_count: 0,
                incorrect_word_count: 0,
                reading_time: 0,
            });
            setDocumentsData((prev) =>
                prev.map((doc) =>
                    doc.id === editingDoc.id
                        ? { ...doc, title: editingDocTitle }
                        : doc
                )
            );
            closeEditNameModal();
        } finally {
            setSavingEdit(false);
        }
    };

    // Open Edit Tags modal
    const openEditTagsModal = (doc) => {
        setEditingTagsDoc(doc);
        setShowEditTagsModal(true);
        setOpenDropdownId(null);
        // Allow no tag: if no tags, empty array
        setSelectedTagIds(
            doc.tags && doc.tags.length > 0 ? [doc.tags[0].id] : []
        );
    };

    // Close Edit Tags modal
    const closeEditTagsModal = () => {
        setShowEditTagsModal(false);
        setEditingTagsDoc(null);
        setSelectedTagIds([]);
    };

    // Save tags for document (can be empty)
    const handleSaveTags = async (e) => {
        e.preventDefault();
        if (!editingTagsDoc) return;
        setSavingTags(true);
        try {
            await axios.post(`/grammar-checkers/${editingTagsDoc.id}/tags`, {
                tag_ids: selectedTagIds, // can be []
            });
            setDocumentsData((prev) =>
                prev.map((doc) =>
                    doc.id === editingTagsDoc.id
                        ? {
                              ...doc,
                              tags: allTags.filter((tag) =>
                                  selectedTagIds.includes(tag.id)
                              ),
                          }
                        : doc
                )
            );
            closeEditTagsModal();
        } finally {
            setSavingTags(false);
        }
    };

    // Update or remove tag in all documentsData (for real-time tag edit/delete)
    const handleTagUpdate = (action) => {
        setDocumentsData((prevDocs) =>
            prevDocs.map((doc) => ({
                ...doc,
                tags: doc.tags
                    ? doc.tags
                          .filter((tag) =>
                              action.type === "delete"
                                  ? tag.id !== action.tagId
                                  : true
                          )
                          .map((tag) =>
                              action.type === "edit" && tag.id === action.tag.id
                                  ? { ...tag, ...action.tag }
                                  : tag
                          )
                    : [],
            }))
        );
        // Refresh allTags after tag create/edit/delete
        fetchAllTags();
    };

    // Filter documents by selected tag
    const filteredDocuments = filteredTagId
        ? documentsData.filter(
              (doc) =>
                  doc.tags && doc.tags.some((tag) => tag.id === filteredTagId)
          )
        : documentsData;

    // Callback for tag click from TagsSection
    const handleTagClick = (tag) => {
        setFilteredTagId(tag.id === filteredTagId ? null : tag.id);
    };

    // Helper to format date
    function formatDate(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    // Focus the input when the modal opens
    useEffect(() => {
        if (showEditNameModal && editNameInputRef.current) {
            editNameInputRef.current.focus();
        }
    }, [showEditNameModal]);

    return (
        <div className="bg-[#f7f8fa]" >
            <Head title="Library" />
            <HeaderNavbar />
            <div className="min-h-screen w-full max-w-7xl mx-auto py-8">
                
                {/* Analytics Section */}
                <AnalyticsSection />
                
                {/* Tags Section */}
                {/* <TagsSection
                    onTagUpdate={handleTagUpdate}
                    onTagClick={handleTagClick}
                    allTags={allTags}
                    fetchAllTags={fetchAllTags}
                    loading={tagsLoading}
                /> */}

                {/* Documents Section */}
                {/* <section className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[25px] text-blue-900 font-semibold">
                            Grammar Check
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-[10px] hover:bg-orange-600 transition">
                            <Plus size={16} />
                            Start New
                        </button>
                    </div>
                    {!loading && filteredDocuments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="border-2 border-gray-200 rounded-xl px-4 py-3 shadow hover:shadow-xl relative"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">
                                            {doc.title || "Untitled document"}
                                        </h3>
                                        <div
                                            className="relative"
                                            ref={(el) =>
                                                (dropdownRefs.current[doc.id] =
                                                    el)
                                            }
                                        >
                                            <button
                                                className="text-gray-400 text-xl cursor-pointer flex items-center hover:bg-gray-100 p-1 rounded-full"
                                                onClick={() =>
                                                    setOpenDropdownId(
                                                        openDropdownId ===
                                                            doc.id
                                                            ? null
                                                            : doc.id
                                                    )
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="19"
                                                    height="19"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="5"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="19"
                                                        r="1"
                                                    />
                                                </svg>
                                            </button>
                                            {openDropdownId === doc.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                                    <div className="px-2 py-2 space-y-1">
                                                        <button
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 rounded-lg transition"
                                                            onClick={() =>
                                                                openEditNameModal(
                                                                    doc
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                                className="text-blue-500"
                                                            />
                                                            Edit Name
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 rounded-lg transition"
                                                            onClick={() =>
                                                                openEditTagsModal(
                                                                    doc
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            <Tags
                                                                size={16}
                                                                className="text-green-500"
                                                            />
                                                            Edit Tags
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 rounded-lg transition"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    doc
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            <Trash2
                                                                size={16}
                                                                className="text-red-500"
                                                            />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p
                                        className="text-gray-600 text-sm mt-1 break-words w-11/12 overflow-hidden"
                                        style={{
                                            wordBreak: "break-word",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {doc.paragraph}
                                    </p>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-gray-600 text-sm">
                                            <span className="text-[14px] font-semibold">
                                                Words:{" "}
                                            </span>
                                            {doc.word_count}
                                        </p>
                                        {doc.tags && doc.tags.length > 0 && (
                                            <div className="flex flex-wrap">
                                                {doc.tags.map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                tag.color,
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex justify-between items-center text-sm">
                                        <span className="text-gray-500 text-sm">
                                            Created on:{" "}
                                            {formatDate(doc.created_at)}
                                        </span>
                                        <button className="text-blue-700 text-md hover:underline">
                                            Open
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredDocuments.length === 0 && (
                        <div className="p-6 text-center border rounded-xl">
                            <FileText
                                size={32}
                                className="text-orange-500 mb-2 hover:text-orange-600 mx-auto"
                            />

                            <h3 className="text-[22px] font-semibold mb-2">
                                No document yet
                            </h3>
                            <p className="text-gray-600">
                                Create your first documents to test your
                                knowledge
                            </p>

                            <div className="flex justify-center gap-4">
                                <button className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition">
                                    <Plus size={16} />
                                    Create First Tag
                                </button>
                            </div>
                        </div>
                    )}
                </section> */}

                {/* Edit Name Modal (render at top level, not inside section/grid) */}
                {showEditNameModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget)
                                closeEditNameModal();
                        }}
                    >
                        <form
                            onSubmit={handleSaveEdit}
                            className="bg-white rounded-2xl w-full max-w-lg"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center px-6 py-3">
                                <h2 className="text-2xl font-semibold text-blue-900">
                                    Rename Document
                                </h2>
                            </div>
                            <div className="px-6 pb-1">
                                <input
                                    ref={editNameInputRef}
                                    type="text"
                                    value={editingDocTitle}
                                    onChange={(e) =>
                                        setEditingDocTitle(e.target.value)
                                    }
                                    className="w-full rounded-xl border-none px-3 py-2.5 bg-blue-50 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 hover:bg-blue-100 focus:outline-none text-base font-semibold mb-4"
                                    placeholder="Document Name"
                                    required
                                    disabled={savingEdit}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape")
                                            closeEditNameModal();
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center px-6 pb-6">
                                <button
                                    type="button"
                                    onClick={closeEditNameModal}
                                    disabled={savingEdit}
                                    className="rounded-[15px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        savingEdit || !editingDocTitle.trim()
                                    }
                                    className="rounded-[15px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {savingEdit ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget)
                                setShowDeleteModal(false);
                        }}
                    >
                        <form
                            onSubmit={handleDeleteDoc}
                            className="bg-white rounded-xl shadow-xl p-4 w-full max-w-xl"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-2xl font-semibold text-blue-900">
                                    Delete this document
                                </h2>
                            </div>
                            <p className="text-gray-500 mb-6 mt-2 text-base">
                                Are you sure you want to delete this document?
                                This cannot be undone.
                            </p>
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="rounded-[15px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-[15px] px-9 py-1 bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60"
                                >
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Tags Modal */}
                {showEditTagsModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget)
                                closeEditTagsModal();
                        }}
                    >
                        <form
                            onSubmit={handleSaveTags}
                            className="bg-white rounded-2xl w-full max-w-md shadow-xl"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center px-6 py-3">
                                <h2 className="text-2xl font-semibold text-blue-900">
                                    Edit Tags
                                </h2>
                            </div>
                            <div className="px-6 pb-1">
                                {allTags.map((tag) => (
                                    <button
                                        type="button"
                                        key={tag.id}
                                        className={`flex items-center w-full mb-3 rounded-xl border px-4 py-3 gap-3 transition text-base font-medium
                                ${
                                    selectedTagIds.includes(tag.id)
                                        ? "border-blue-500 ring-2 ring-blue-400"
                                        : "border-gray-200 hover:bg-gray-50"
                                }
                            `}
                                        style={{
                                            boxShadow: selectedTagIds.includes(
                                                tag.id
                                            )
                                                ? "0 0 0 2px #2563eb"
                                                : undefined,
                                        }}
                                        onClick={() => {
                                            setSelectedTagIds(
                                                (ids) =>
                                                    ids.includes(tag.id)
                                                        ? [] // unselect if already selected (allow null)
                                                        : [tag.id] // select only this tag
                                            );
                                        }}
                                    >
                                        <span
                                            className="w-6 h-6 rounded-md"
                                            style={{
                                                backgroundColor: tag.color,
                                                display: "inline-block",
                                            }}
                                        ></span>
                                        <span className="font-medium">
                                            {tag.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center px-6 pb-6 mt-2">
                                <button
                                    type="button"
                                    onClick={closeEditTagsModal}
                                    className="rounded-[15px] border-2 border-gray-200 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    disabled={savingTags}
                                    style={{ minWidth: 110 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-[15px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                    disabled={savingTags}
                                    style={{ minWidth: 110 }}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}
