<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md animate-fade-in">
      <h2 class="text-3xl font-bold text-center text-blue-400 mb-2">
        Selamat Datang!
      </h2>
      <p class="text-center text-gray-500 mb-6 text-sm">Masuk untuk mengakses catatan Anda.</p>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all"
            :class="{
              'border-gray-300 focus:ring-indigo-500': !emailTouched || isValidEmail(email),
              'border-red-500 focus:ring-red-500': emailTouched && !isValidEmail(email)
            }"
            @blur="emailTouched = true"
          />
          <p v-if="emailTouched && !isValidEmail(email)" class="text-sm text-red-500 mt-1">
            Email tidak valid.
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="block mb-1 text-sm font-semibold text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all"
            :class="{
              'border-gray-300 focus:ring-indigo-500': !passwordTouched || password.length >= 6,
              'border-red-500 focus:ring-red-500': passwordTouched && password.length < 6
            }"
            @blur="passwordTouched = true"
          />
          <p v-if="passwordTouched && password.length < 6" class="text-sm text-red-500 mt-1">
            Password minimal 6 karakter.
          </p>
        </div>

        <!-- Button -->
        <button
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-300 text-white py-2 rounded-xl transition-all font-semibold tracking-wide shadow-md disabled:opacity-50"
        >
          {{ loading ? 'Memproses...' : 'Login' }}
        </button>
      </form>

      <!-- Link register -->
      <p class="text-sm text-center mt-4 text-gray-600">
        Belum punya akun?
        <router-link to="/register" class="text-blue-600 font-semibold hover:underline">
          Daftar di sini
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, realtimeDb } from '../firebase/firebase.js' 
import { ref as rtdbRef, set, onDisconnect } from 'firebase/database'

const email = ref('')
const password = ref('')
const emailTouched = ref(false)
const passwordTouched = ref(false)
const loading = ref(false)
const router = useRouter()

const isValidEmail = (val) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(val)
}

const handleLogin = async () => {
  emailTouched.value = true
  passwordTouched.value = true

  if (!isValidEmail(email.value) || password.value.length < 6) {
    return
  }

  loading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    alert('Login berhasil!')
    router.push('/mininotes')
  } catch (err) {
    alert('Login gagal: ' + err.message)
  } finally {
    loading.value = false
  }
}

// Cek jika sudah login sebelumnya dan set status online
onMounted(async () => {
  if (auth.currentUser) {
    const userStatusRef = rtdbRef(realtimeDb, 'status/' + auth.currentUser.uid)
    await set(userStatusRef, {
      online: true,
      typing: false,
      name: auth.currentUser.email
    })

    onDisconnect(userStatusRef).set({
      online: false,
      typing: false
    })
  }
})
</script>


<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
</style>
