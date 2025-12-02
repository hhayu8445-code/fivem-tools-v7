# 🔍 CODE DUPLICATE ANALYSIS - FiveM Tools V7

**Date:** December 2024  
**Scope:** Full codebase analysis  
**Status:** ⚠️ DUPLICATES FOUND

---

## 📊 EXECUTIVE SUMMARY

| Category | Duplicates Found | Severity | Action Required |
|----------|------------------|----------|-----------------|
| **Auth Check Logic** | 3 files | 🔴 HIGH | Refactor to hook |
| **Permission Check** | 2 files | 🔴 HIGH | Create utility function |
| **Loading States** | 3 files | 🟡 MEDIUM | Create shared component |
| **ReactQuill Setup** | 3 files | 🟡 MEDIUM | Extract config |
| **Toast Messages** | Multiple | 🟢 LOW | Acceptable |

---

## 🔴 CRITICAL DUPLICATES

### 1. AUTH CHECK LOGIC (3 Files)

**Duplicate Pattern Found In:**
- `CreateThread.jsx` (lines 19-31)
- `EditThread.jsx` (lines 21-48)
- `EditReply.jsx` (lines 18-45)

**Duplicate Code:**
```javascript
// Pattern 1: Auth check
const [user, setUser] = useState(null);
useEffect(() => {
    base44.auth.me().then(u => {
        if (!u) {
            // Handle not logged in
            return;
        }
        setUser(u);
    }).catch(() => /* error handling */);
}, []);
```

**Impact:** ~30 lines duplicated across 3 files

**Recommendation:** ✅ Already have `useAuth` hook, but not used consistently!

---

### 2. PERMISSION CHECK LOGIC (2 Files)

**Duplicate Pattern Found In:**
- `EditThread.jsx` (lines 38-46)
- `EditReply.jsx` (lines 35-43)

**Duplicate Code:**
```javascript
// Check if user can edit
const profiles = await base44.entities.UserProfile.list({ 
    query: { user_email: currentUser.email } 
});
const isAdmin = profiles[0]?.membership_tier === 'admin';
const isMod = profiles[0]?.membership_tier === 'moderator';

if (item.author_email !== currentUser.email && !isAdmin && !isMod) {
    toast.error('You can only edit your own items');
    navigate('/somewhere');
    return;
}
```

**Impact:** ~15 lines duplicated across 2 files

**Recommendation:** Create `usePermissions` hook or utility function

---

### 3. LOADING STATE COMPONENT (3 Files)

**Duplicate Pattern Found In:**
- `EditThread.jsx` (lines 93-99)
- `EditReply.jsx` (lines 80-86)
- Multiple other pages

**Duplicate Code:**
```javascript
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
```

**Impact:** ~7 lines duplicated across multiple files

**Recommendation:** ✅ Already have `LoadingSpinner` component, but not used!

---

### 4. REACTQUILL CONFIGURATION (3 Files)

**Duplicate Pattern Found In:**
- `CreateThread.jsx` (lines 234-245)
- `EditThread.jsx` (line 115)
- `EditReply.jsx` (line 92)

**Duplicate Code:**
```javascript
<div className="bg-white rounded-lg overflow-hidden">
    <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        className="h-[300px] mb-12"
        modules={{
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link', 'image', 'code-block'],
                ['clean']
            ],
        }}
    />
</div>
```

**Impact:** ~15 lines duplicated across 3 files

**Recommendation:** Create `RichTextEditor` component

---

## 🟡 MEDIUM DUPLICATES

### 5. CARD LAYOUT PATTERN

**Found In:**
- `EditThread.jsx`
- `EditReply.jsx`

**Pattern:**
```javascript
<Card className="bg-zinc-900 border-zinc-800">
    <CardHeader>
        <CardTitle className="text-white">Title</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        {/* Content */}
    </CardContent>
</Card>
```

**Recommendation:** Create `EditFormCard` wrapper component

---

### 6. SAVE/CANCEL BUTTON GROUP

**Found In:**
- `EditThread.jsx` (lines 119-126)
- `EditReply.jsx` (lines 96-103)

**Pattern:**
```javascript
<div className="flex gap-2 pt-4">
    <Button onClick={handleSave} disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-700">
        {saving ? 'Saving...' : 'Save Changes'}
    </Button>
    <Button onClick={() => navigate(backUrl)} variant="outline" className="border-zinc-700 text-zinc-300">
        Cancel
    </Button>
</div>
```

**Recommendation:** Create `FormActions` component

---

## 📋 DETAILED FINDINGS

### File: `CreateThread.jsx`
**Issues:**
1. ❌ Not using `useAuth` hook (lines 19-31)
2. ❌ Not using `LoadingOverlay` for loading state
3. ⚠️ ReactQuill config duplicated
4. ⚠️ Complex form logic (could be extracted)

### File: `EditThread.jsx`
**Issues:**
1. ❌ Not using `useAuth` hook (lines 21-48)
2. ❌ Not using `LoadingSpinner` component (lines 93-99)
3. ❌ Permission check logic duplicated (lines 38-46)
4. ⚠️ ReactQuill config duplicated (line 115)

### File: `EditReply.jsx`
**Issues:**
1. ❌ Not using `useAuth` hook (lines 18-45)
2. ❌ Not using `LoadingSpinner` component (lines 80-86)
3. ❌ Permission check logic duplicated (lines 35-43)
4. ⚠️ ReactQuill config duplicated (line 92)

---

## 🛠️ REFACTORING RECOMMENDATIONS

### Priority 1: Create Shared Hooks

#### 1.1 Use Existing `useAuth` Hook
**Current:** Manual auth check in 3 files  
**Solution:** Use existing `useAuth` hook from `hooks/useAuth.js`

```javascript
// Replace manual auth check with:
import { useAuth } from '@/hooks/useAuth';

const { user, loading } = useAuth();
```

#### 1.2 Create `usePermissions` Hook
**File:** `src/hooks/usePermissions.js`

```javascript
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function usePermissions(userEmail) {
  const [permissions, setPermissions] = useState({
    isAdmin: false,
    isMod: false,
    isVIP: false,
    loading: true
  });

  useEffect(() => {
    if (!userEmail) return;
    
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list({ 
          query: { user_email: userEmail } 
        });
        const tier = profiles[0]?.membership_tier;
        setPermissions({
          isAdmin: tier === 'admin',
          isMod: tier === 'moderator',
          isVIP: tier === 'vip',
          loading: false
        });
      } catch (error) {
        console.error('Failed to load permissions:', error);
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    };
    
    load();
  }, [userEmail]);

  return permissions;
}

export function canEdit(item, user, permissions) {
  return item.author_email === user.email || 
         permissions.isAdmin || 
         permissions.isMod;
}
```

---

### Priority 2: Create Shared Components

#### 2.1 Create `RichTextEditor` Component
**File:** `src/Components/RichTextEditor.jsx`

```javascript
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EDITOR_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image', 'code-block'],
    ['clean']
  ],
};

export default function RichTextEditor({ value, onChange, height = '300px', placeholder = '' }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-zinc-700">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className={`h-[${height}] mb-12`}
        placeholder={placeholder}
        modules={EDITOR_MODULES}
      />
    </div>
  );
}
```

#### 2.2 Create `EditFormCard` Component
**File:** `src/Components/EditFormCard.jsx`

```javascript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function EditFormCard({ title, children }) {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.3 Create `FormActions` Component
**File:** `src/Components/FormActions.jsx`

```javascript
import React from 'react';
import { Button } from '@/Components/ui/button';

export default function FormActions({ 
  onSave, 
  onCancel, 
  saving = false, 
  saveText = 'Save Changes',
  savingText = 'Saving...' 
}) {
  return (
    <div className="flex gap-2 pt-4">
      <Button 
        onClick={onSave} 
        disabled={saving} 
        className="bg-fuchsia-600 hover:bg-fuchsia-700"
      >
        {saving ? savingText : saveText}
      </Button>
      <Button 
        onClick={onCancel} 
        variant="outline" 
        className="border-zinc-700 text-zinc-300"
      >
        Cancel
      </Button>
    </div>
  );
}
```

---

### Priority 3: Refactor Existing Files

#### 3.1 Refactor `EditThread.jsx`
**Before:** 127 lines  
**After:** ~80 lines (37% reduction)

**Changes:**
- Use `useAuth` hook
- Use `usePermissions` hook
- Use `LoadingSpinner` component
- Use `RichTextEditor` component
- Use `EditFormCard` component
- Use `FormActions` component

#### 3.2 Refactor `EditReply.jsx`
**Before:** 104 lines  
**After:** ~70 lines (33% reduction)

**Changes:**
- Use `useAuth` hook
- Use `usePermissions` hook
- Use `LoadingSpinner` component
- Use `RichTextEditor` component
- Use `EditFormCard` component
- Use `FormActions` component

#### 3.3 Refactor `CreateThread.jsx`
**Before:** 367 lines  
**After:** ~340 lines (7% reduction)

**Changes:**
- Use `useAuth` hook (already has LoginRequiredModal)
- Use `RichTextEditor` component for main editor

---

## 📊 IMPACT ANALYSIS

### Code Reduction
| File | Before | After | Reduction |
|------|--------|-------|-----------|
| EditThread.jsx | 127 lines | ~80 lines | 37% ↓ |
| EditReply.jsx | 104 lines | ~70 lines | 33% ↓ |
| CreateThread.jsx | 367 lines | ~340 lines | 7% ↓ |
| **Total** | **598 lines** | **~490 lines** | **18% ↓** |

### New Shared Code
| Component | Lines | Reused In |
|-----------|-------|-----------|
| usePermissions.js | ~40 lines | 2 files |
| RichTextEditor.jsx | ~25 lines | 3 files |
| EditFormCard.jsx | ~15 lines | 2 files |
| FormActions.jsx | ~20 lines | 2 files |
| **Total** | **~100 lines** | **9 reuses** |

### Net Result
- **Gross Reduction:** 108 lines removed
- **New Shared Code:** 100 lines added
- **Net Reduction:** 8 lines
- **Maintainability:** ⬆️ Significantly improved
- **Reusability:** ⬆️ 9 reuse points created

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Create Shared Hooks (30 min)
- [ ] Create `src/hooks/usePermissions.js`
- [ ] Test with EditThread.jsx
- [ ] Test with EditReply.jsx

### Phase 2: Create Shared Components (45 min)
- [ ] Create `src/Components/RichTextEditor.jsx`
- [ ] Create `src/Components/EditFormCard.jsx`
- [ ] Create `src/Components/FormActions.jsx`
- [ ] Test each component individually

### Phase 3: Refactor EditThread.jsx (20 min)
- [ ] Replace auth check with `useAuth`
- [ ] Add `usePermissions` hook
- [ ] Replace loading spinner
- [ ] Replace ReactQuill with `RichTextEditor`
- [ ] Replace card layout with `EditFormCard`
- [ ] Replace buttons with `FormActions`
- [ ] Test functionality

### Phase 4: Refactor EditReply.jsx (20 min)
- [ ] Same steps as EditThread.jsx
- [ ] Test functionality

### Phase 5: Refactor CreateThread.jsx (15 min)
- [ ] Replace auth check with `useAuth`
- [ ] Replace ReactQuill with `RichTextEditor`
- [ ] Test functionality

### Phase 6: Testing (30 min)
- [ ] Test all edit flows
- [ ] Test permissions
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test on production

**Total Estimated Time:** ~2.5 hours

---

## 🎯 PRIORITY RANKING

1. **🔴 CRITICAL** - Create `usePermissions` hook (security-related)
2. **🔴 HIGH** - Use existing `useAuth` hook (consistency)
3. **🟡 MEDIUM** - Create `RichTextEditor` component (maintainability)
4. **🟡 MEDIUM** - Create `EditFormCard` component (consistency)
5. **🟢 LOW** - Create `FormActions` component (nice-to-have)

---

## 📝 NOTES

### Why These Duplicates Exist
1. **Rapid Development** - Features added quickly without refactoring
2. **Copy-Paste Pattern** - EditThread/EditReply likely copied from each other
3. **Missing Awareness** - Developers didn't know about existing hooks/components

### Why Fix Now
1. **Maintainability** - Changes need to be made in multiple places
2. **Consistency** - Different auth patterns across files
3. **Bug Risk** - Permission logic could diverge
4. **Performance** - Unused components already exist

### What NOT to Fix
1. ✅ Toast messages - Acceptable duplication
2. ✅ Navigation patterns - Context-specific
3. ✅ Form validation - Different rules per form

---

## 🚀 NEXT STEPS

1. **Review this analysis** with team
2. **Prioritize** which duplicates to fix first
3. **Create** shared hooks and components
4. **Refactor** existing files one by one
5. **Test** thoroughly after each refactor
6. **Document** new shared components

---

**Generated:** December 2024  
**Analyst:** Amazon Q  
**Status:** Ready for Implementation
