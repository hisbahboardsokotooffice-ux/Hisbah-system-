import { auth, db, storage } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { ref as sref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

// Simple helper to detect current page
const path = location.pathname.split('/').pop();

// REGISTER
if(path === 'register.html'){
  const form = document.getElementById('register-form');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const department = document.getElementById('department').value.trim();
    const role = document.getElementById('role').value;
    try{
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      await setDoc(doc(db, 'users', uid), {
        fullName, email, department, role, createdAt: new Date().toISOString()
      });
      alert('User created');
      location.href = 'index.html';
    }catch(err){console.error(err);alert(err.message)}
  })
}

// LOGIN
if(path === 'index.html'){
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    try{
      const res = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role
      const uid = res.user.uid;
      const userSnap = await getDoc(doc(db, 'users', uid));
      if(userSnap.exists()){
        const data = userSnap.data();
        if(data.role === 'admin') location.href = 'admin-dashboard.html';
        else location.href = 'staff-dashboard.html';
      }else{
        alert('User profile missing');
      }
    }catch(err){console.error(err); alert(err.message)}
  })
}

// ADMIN DASHBOARD
if(path === 'admin-dashboard.html'){
  // ensure auth state
  auth.onAuthStateChanged(async user=>{
    if(!user) return location.href='index.html';
    const userSnap = await getDoc(doc(db,'users',user.uid));
    if(!userSnap.exists()) return alert('No profile');
    const profile = userSnap.data();
    if(profile.role !== 'admin') return alert('Access denied');

    const staffList = document.getElementById('staffList');
    const q = collection(db,'users');
    const snapshot = await getDocs(q);
    snapshot.forEach(docu=>{
      const d = docu.data();
      const li = document.createElement('li');
      li.textContent = `${d.fullName} — ${d.department} — ${d.role}`;
      staffList.appendChild(li);
    })

    // Task creation
    const taskForm = document.getElementById('taskForm');
    const assignTo = document.getElementById('assignTo');
    // populate assignTo
    snapshot.forEach(docu=>{
      const d = docu.data();
      const opt = document.createElement('option');
      opt.value = docu.id; opt.textContent = d.fullName;
      assignTo.appendChild(opt);
    })

    taskForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const title = document.getElementById('taskTitle').value;
      const desc = document.getElementById('taskDesc').value;
      const to = assignTo.value;
      await addDoc(collection(db,'tasks'),{title,desc,assignedTo:to,status:'open',createdAt:new Date().toISOString()});
      alert('Task created');
    })
  })
}

// STAFF DASHBOARD
if(path === 'staff-dashboard.html'){
  auth.onAuthStateChanged(async user=>{
    if(!user) return location.href='index.html';
    const userSnap = await getDoc(doc(db,'users',user.uid));
    if(!userSnap.exists()) return alert('No profile');
    const profile = userSnap.data();
    document.getElementById('staffName').textContent = profile.fullName;

    // load my tasks
    const tasksQ = query(collection(db,'tasks'), where('assignedTo','==', user.uid));
    const tasksSnapshot = await getDocs(tasksQ);
    const myTasks = document.getElementById('myTasks');
    tasksSnapshot.forEach(t=>{
      const data = t.data();
      const li = document.createElement('li');
      li.textContent = `${data.title} — ${data.status}`;
      myTasks.appendChild(li);
    })

    // report form
    const reportForm = document.getElementById('reportForm');
    reportForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const title = document.getElementById('reportTitle').value;
      const body = document.getElementById('reportBody').value;
      const fileInput = document.getElementById('reportFile');
      let fileUrl = '';
      if(fileInput.files.length){
        const f = fileInput.files[0];
        const s = sref(storage, `reports/${Date.now()}_${f.name}`);
        await uploadBytes(s, f);
        fileUrl = await getDownloadURL(s);
      }
      await addDoc(collection(db,'reports'),{title,body,fileUrl,author:user.uid,createdAt:new Date().toISOString()});
      alert('Report submitted');
    })
  })
}

// COMMON: logout link if exists
const logoutLink = document.querySelector('nav a');
if(logoutLink){
  logoutLink.addEventListener('click', async (e)=>{e.preventDefault(); await signOut(auth); location.href='index.html';})
}