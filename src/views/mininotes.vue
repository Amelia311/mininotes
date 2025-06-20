<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-200 to-blue-400">
      <!-- Navbar -->
      <div class="bg-white/80 backdrop-blur-md shadow-lg px-6 py-4 flex justify-between items-center rounded-b-xl">
        <h1 class="text-2xl font-bold text-indigo-700">Mini Notes</h1>
        <button @click="showForm = true"
          class="flex items-center gap-2 bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow transition-all">
          Tambah Catatan
        </button>
      </div>
  
      <!-- Main Content -->
      <div class="max-w-3xl mx-auto mt-8 p-5 bg-white rounded-3xl shadow-lg">
        <h2 class="text-3xl font-extrabold text-center text-blue-500 mb-6">Catatan Saya</h2>
  
        <!-- Note Form -->
        <div v-if="showForm" class="bg-blue-50 p-5 rounded-xl mb-6 shadow-inner space-y-4">
          <input v-model="note.title" type="text" placeholder="Judul Catatan"
            class="w-full px-4 py-2 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <textarea v-model="note.content" rows="4" placeholder="Isi catatan..."
            class="w-full px-4 py-2 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          <button @click="saveNote"
            class="w-full bg-blue-600 hover:bg-blue-400 text-white py-2 rounded-xl font-semibold transition-all shadow-md">
            {{ editingId === null ? 'Tambah Catatan' : 'Perbarui Catatan' }}
          </button>
        </div>
  
        <!-- Notes List -->
        <div v-if="notes.length" class="space-y-4">
          <div v-for="(item, index) in notes" :key="item.id"
            class="bg-white p-4 rounded-xl shadow flex justify-between items-start border border-blue-200">
            <div>
              <h3 class="text-lg font-semibold text-indigo-700">{{ item.title }}</h3>
              <p class="text-gray-600 whitespace-pre-wrap">{{ item.content }}</p>
            </div>
            <div class="flex flex-col space-y-2 ml-4">
              <button @click="editNote(item)"
                class="bg-blue-400 hover:bg-yellow-300 text-white px-3 py-1 rounded-xl text-sm font-semibold">Edit</button>
              <button @click="deleteNote(item.id)"
                class="bg-pink-500 hover:bg-red-400 text-white px-3 py-1 rounded-xl text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
  
        <!-- Empty State -->
        <div v-else class="text-center bg-white/80 p-10 rounded-xl border-2 border-dashed border-indigo-300 mt-4">
          <div class="text-5xl mb-4">📝</div>
          <p class="text-lg font-semibold text-gray-700">Belum ada catatan.</p>
          <p class="text-gray-500">Klik tombol di atas untuk menambahkan catatan baru.</p>
        </div>
      </div>
  
      <!-- Logout
      <div class="flex justify-center mt-6">
        <router-link to="/login">
          <button @click="logout"
            class="bg-blue-900 hover:bg-pink-400 text-white px-5 py-1 rounded-2xl font-semibold shadow-md">
            Logout
          </button>
        </router-link>
      </div> -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
  } from "firebase/firestore"
  import { db } from '../firebase/firebase'
  
  const notes = ref([])
  const note = ref({ title: '', content: '' })
  const editingId = ref(null)
  const showForm = ref(false)
  
  const notesCollection = collection(db, "notes")
  
  // Ambil data realtime
  onMounted(() => {
    onSnapshot(notesCollection, (snapshot) => {
      notes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    })
  })
  
  // Simpan catatan baru atau update
  const saveNote = async () => {
    if (!note.value.title || !note.value.content) {
      alert('Judul dan isi wajib diisi!')
      return
    }
  
    try {
      if (editingId.value === null) {
        // Tambah catatan
        await addDoc(notesCollection, note.value)
      } else {
        // Update catatan
        const docRef = doc(db, "notes", editingId.value)
        await updateDoc(docRef, note.value)
      }
  
      resetForm()
    } catch (error) {
      console.error('Gagal menyimpan catatan:', error)
    }
  }
  
  // Edit catatan
  const editNote = (item) => {
    note.value = { title: item.title, content: item.content }
    editingId.value = item.id
    showForm.value = true
  }
  
  // Hapus catatan
  const deleteNote = async (id) => {
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      try {
        await deleteDoc(doc(db, "notes", id))
        // Tidak perlu hapus dari notes.value, karena onSnapshot akan update otomatis
      } catch (error) {
        console.error('Gagal menghapus catatan:', error)
      }
    }
  }
  
  // Reset form
  const resetForm = () => {
    note.value = { title: '', content: '' }
    editingId.value = null
    showForm.value = false
  }
  </script>
  
  
  <style scoped>
  body {
    font-family: 'Inter', sans-serif;
  }
  </style>
  