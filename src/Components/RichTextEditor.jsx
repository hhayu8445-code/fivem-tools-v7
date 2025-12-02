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
