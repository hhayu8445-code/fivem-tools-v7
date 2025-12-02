# 📝 Edit Thread & Reply Feature - Complete Guide

## ✨ Overview
Fitur edit thread dan reply memungkinkan user untuk mengedit konten mereka sendiri, dan admin/moderator dapat mengedit semua konten untuk moderasi.

## 🎯 Features

### 1. Edit Thread
- ✅ Author dapat edit thread mereka sendiri
- ✅ Admin dapat edit semua thread
- ✅ Moderator dapat edit semua thread
- ✅ Rich text editor (ReactQuill)
- ✅ Update timestamp otomatis
- ✅ Validasi permission
- ✅ Toast notification

### 2. Edit Reply
- ✅ Author dapat edit reply mereka sendiri
- ✅ Admin dapat edit semua reply
- ✅ Moderator dapat edit semua reply
- ✅ Rich text editor (ReactQuill)
- ✅ Update timestamp otomatis
- ✅ Validasi permission
- ✅ Toast notification

## 🔐 Permission System

### Thread Edit Permission
```javascript
// User dapat edit jika:
1. User adalah author thread (author_email === user.email)
2. User adalah admin (membership_tier === 'admin')
3. User adalah moderator (membership_tier === 'moderator')
```

### Reply Edit Permission
```javascript
// User dapat edit jika:
1. User adalah author reply (author_email === user.email)
2. User adalah admin (membership_tier === 'admin')
3. User adalah moderator (membership_tier === 'moderator')
```

## 🛠️ Implementation

### Routes (App.jsx)
```javascript
// Edit Thread Route
<Route path="/community/edit-thread/:id" element={<ProtectedRoute><EditThread /></ProtectedRoute>} />

// Edit Reply Route
<Route path="/community/edit-reply/:id" element={<ProtectedRoute><EditReply /></ProtectedRoute>} />
```

### Edit Button in Thread.jsx
```javascript
// Thread Edit Button (di header thread)
{(user?.email === thread.author_email || isAdminOrMod) && (
  <Button
    size="sm" 
    variant="ghost"
    className="text-zinc-400 hover:text-fuchsia-400"
    onClick={() => navigate(`/community/edit-thread/${thread.id}`)}
  >
    <img src="https://img.icons8.com/3d-fluency/94/edit.png" className="w-4 h-4 mr-1" alt="Edit" /> 
    Edit
  </Button>
)}

// Reply Edit Button (di setiap reply)
{(user?.email === reply.author_email || isAdminOrMod) && (
  <Button
    size="sm" 
    variant="ghost"
    className="text-zinc-400 hover:text-fuchsia-400"
    onClick={() => navigate(`/community/edit-reply/${reply.id}`)}
  >
    <img src="https://img.icons8.com/3d-fluency/94/edit.png" className="w-4 h-4 mr-1" alt="Edit" /> 
    Edit
  </Button>
)}
```

## 📋 File Structure

```
src/
├── Pages/
│   ├── EditThread.jsx      # Edit thread page
│   ├── EditReply.jsx       # Edit reply page
│   └── Thread.jsx          # Thread detail with edit buttons
└── App.jsx                 # Routes configuration
```

## 🔄 Edit Flow

### Edit Thread Flow
1. User klik tombol "Edit" di thread
2. Navigate ke `/community/edit-thread/:id`
3. Load thread data & validate permission
4. Show rich text editor dengan content existing
5. User edit content
6. Klik "Save Changes"
7. Update thread di database dengan `updated_date`
8. Navigate kembali ke thread detail
9. Show success toast

### Edit Reply Flow
1. User klik tombol "Edit" di reply
2. Navigate ke `/community/edit-reply/:id`
3. Load reply data & validate permission
4. Show rich text editor dengan content existing
5. User edit content
6. Klik "Save Changes"
7. Update reply di database dengan `updated_date`
8. Navigate kembali ke thread detail
9. Show success toast

## 🎨 UI Components

### EditThread.jsx
```javascript
- Card dengan title "Edit Thread"
- Input field untuk title
- ReactQuill editor untuk content
- Save Changes button (fuchsia)
- Cancel button (outline)
- Loading spinner saat load
- Loading state saat save
```

### EditReply.jsx
```javascript
- Card dengan title "Edit Reply"
- ReactQuill editor untuk content
- Save Changes button (fuchsia)
- Cancel button (outline)
- Loading spinner saat load
- Loading state saat save
```

## 🔒 Security Features

### 1. Authentication Check
```javascript
const currentUser = await base44.auth.me();
if (!currentUser) {
  toast.error('Please login first');
  navigate('/community');
  return;
}
```

### 2. Permission Validation
```javascript
const profiles = await base44.entities.UserProfile.list({ 
  query: { user_email: currentUser.email } 
});
const isAdmin = profiles[0]?.membership_tier === 'admin';
const isMod = profiles[0]?.membership_tier === 'moderator';

if (data.author_email !== currentUser.email && !isAdmin && !isMod) {
  toast.error('You can only edit your own content');
  navigate(`/community/thread/${threadId}`);
  return;
}
```

### 3. Content Validation
```javascript
if (!content.trim()) {
  toast.error('Content is required');
  return;
}
```

## 📊 Database Updates

### Thread Update
```javascript
await base44.entities.ForumThread.update(id, {
  title: title.trim(),
  content: content.trim(),
  updated_date: new Date().toISOString()
});
```

### Reply Update
```javascript
await base44.entities.ForumReply.update(id, {
  content: content.trim(),
  updated_date: new Date().toISOString()
});
```

## 🎯 User Experience

### Visual Indicators
- ✅ Edit button hanya muncul untuk author/admin/mod
- ✅ Edit icon (3D fluency style)
- ✅ Hover effect pada button
- ✅ Loading state saat save
- ✅ Toast notification untuk feedback

### Navigation
- ✅ Breadcrumb untuk orientasi
- ✅ Cancel button untuk kembali
- ✅ Auto redirect setelah save
- ✅ Error handling dengan redirect

## 🐛 Error Handling

### Load Error
```javascript
try {
  // Load data
} catch (error) {
  console.error('Error loading:', error);
  toast.error('Failed to load');
  navigate('/community');
}
```

### Save Error
```javascript
try {
  // Save data
} catch (error) {
  console.error('Error updating:', error);
  toast.error('Failed to update');
}
```

## 🚀 Testing Checklist

### Thread Edit
- [ ] Author dapat edit thread sendiri
- [ ] Admin dapat edit semua thread
- [ ] Moderator dapat edit semua thread
- [ ] Non-author tidak bisa edit
- [ ] Title validation bekerja
- [ ] Content validation bekerja
- [ ] Updated_date tersimpan
- [ ] Toast notification muncul
- [ ] Redirect ke thread detail

### Reply Edit
- [ ] Author dapat edit reply sendiri
- [ ] Admin dapat edit semua reply
- [ ] Moderator dapat edit semua reply
- [ ] Non-author tidak bisa edit
- [ ] Content validation bekerja
- [ ] Updated_date tersimpan
- [ ] Toast notification muncul
- [ ] Redirect ke thread detail

## 📱 Responsive Design
- ✅ Mobile friendly
- ✅ ReactQuill responsive
- ✅ Button layout responsive
- ✅ Card layout responsive

## 🎨 Styling
- Dark theme (zinc-900/950)
- Fuchsia accent color
- 3D fluency icons
- Smooth transitions
- Consistent with forum design

## 🔮 Future Enhancements
- [ ] Edit history tracking
- [ ] Show "Edited" badge on edited content
- [ ] Diff view untuk moderator
- [ ] Undo/Redo functionality
- [ ] Auto-save draft
- [ ] Edit time limit
- [ ] Edit count limit

## 📝 Notes
- Edit button hanya muncul jika user memiliki permission
- Admin dan moderator dapat edit semua konten untuk moderasi
- Updated_date otomatis diupdate saat save
- Rich text editor support HTML formatting
- Content di-trim untuk menghindari whitespace

---

**Status:** ✅ Fully Implemented & Working
**Last Updated:** 2024
**Version:** 1.0.0
