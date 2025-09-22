import { useState, useEffect } from "react";
import axios from "axios";

// ✅ Your backend (Render) URL
const API = "https://contact-book-app-i1yg.onrender.com";

function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  // Fetch contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await axios.get(
          `${API}/contacts?page=${page}&limit=${limit}`
        );
        setContacts(res.data.contacts);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch contacts");
      }
    };
    loadContacts();
  }, [page]);

  // Add contact
  const addContact = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(form.email) || !/^\d{10}$/.test(form.phone)) {
      alert("Invalid input");
      return;
    }
    try {
      await axios.post(`${API}/contacts`, form);
      setForm({ name: "", email: "", phone: "" });
      setPage(1); // reload first page
    } catch (err) {
      console.error(err);
      alert("Failed to add contact");
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    try {
      await axios.delete(`${API}/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete contact");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
          📒 Contact Book
        </h1>

        {/* Add contact form */}
        <form
          onSubmit={addContact}
          className="flex flex-col items-center gap-3 mb-6 bg-gray-700 p-4 rounded-lg shadow"
        >
          <input
            className="border rounded p-2 text-black w-72"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded p-2 text-black w-72"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border rounded p-2 text-black w-72"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition w-72"
          >
            Add Contact
          </button>
        </form>

        {/* Contact list */}
        <ul className="space-y-3">
          {contacts.map((c) => (
            <li
              key={c.id}
              className="flex flex-col items-center border border-gray-600 p-3 rounded bg-gray-700 hover:bg-gray-600 transition"
            >
              <span className="text-center">
                <strong className="capitalize">{c.name}</strong> — {c.email} — {c.phone}
              </span>
              <button
                onClick={() => deleteContact(c.id)}
                className="mt-2 px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
