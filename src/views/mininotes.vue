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
        <textarea v-model="note.content" @input="handleTyping" rows="4" placeholder="Isi catatan..."
          class="w-full px-4 py-2 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
        <button @click="saveNote"
          class="w-full bg-blue-600 hover:bg-blue-400 text-white py-2 rounded-xl font-semibold transition-all shadow-md">
          {{ editingId === null ? 'Tambah Catatan' : 'Perbarui Catatan' }}
        </button>
      </div>

      <!-- Notes List -->
      <div v-if="notes.length" class="space-y-4">
        <div v-for="item in notes" :key="item.id"
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

      <!-- User Status -->
      <div class="text-sm text-gray-600 mt-6 border-t pt-4">
        <p v-if="userStatuses.length === 0" class="italic text-gray-400">Tidak ada pengguna online</p>
        <p v-for="user in userStatuses" :key="user.name">
          <span v-if="user.online">🟢 {{ user.name }} sedang online</span>
          <span v-if="user.typing"> - sedang mengetik...</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from 'firebase/firestore'
import { db, auth, realtimeDb } from '../firebase/firebase'
import { ref as rtdbRef, set, onValue, onDisconnect } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'

// Data & State
const notes = ref([])
const note = ref({ title: '', content: '' })
const editingId = ref(null)
const showForm = ref(false)
const notesCollection = collection(db, "notes")

// Realtime status
const userStatuses = ref([])
const typingTimeout = ref(null)

// Fungsi mengetik
const handleTyping = () => {
  if (!auth.currentUser) return

  const typingRef = rtdbRef(realtimeDb, 'status/' + auth.currentUser.uid)
  set(typingRef, {
    online: true,
    typing: true,
    name: auth.currentUser.email
  })

  if (typingTimeout.value) clearTimeout(typingTimeout.value)

  typingTimeout.value = setTimeout(() => {
    set(typingRef, {
      online: true,
      typing: false,
      name: auth.currentUser.email
    })
  }, 2000)
}

// Listener realtime Firestore & Realtime DB
onMounted(() => {
  // Catatan realtime
  onSnapshot(notesCollection, (snapshot) => {
    notes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })

  // Status realtime
  const statusRef = rtdbRef(realtimeDb, 'status')
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val()
    userStatuses.value = data ? Object.values(data) : []
    console.log('🔥 Status:', userStatuses.value)
  })
})

// Login status
onAuthStateChanged(auth, (user) => {
  if (user) {
    const statusRef = rtdbRef(realtimeDb, 'status/' + user.uid)
    set(statusRef, {
      online: true,
      typing: false,
      name: user.email
    })
    onDisconnect(statusRef).remove()
  }
})

// Tambah/Update note
const saveNote = async () => {
  if (!note.value.title || !note.value.content) {
    alert('Judul dan isi wajib diisi!')
    return
  }

  try {
    if (editingId.value === null) {
      await addDoc(notesCollection, note.value)
    } else {
      const docRef = doc(db, "notes", editingId.value)
      await updateDoc(docRef, note.value)
    }

    resetForm()
  } catch (error) {
    console.error('❌ Gagal simpan:', error)
  }
}

// Edit note
const editNote = (item) => {
  note.value = { title: item.title, content: item.content }
  editingId.value = item.id
  showForm.value = true
}

// Hapus note
const deleteNote = async (id) => {
  if (confirm('Yakin hapus catatan ini?')) {
    try {
      await deleteDoc(doc(db, "notes", id))
    } catch (error) {
      console.error('❌ Gagal hapus:', error)
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
