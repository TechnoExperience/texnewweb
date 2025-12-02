/**
 * Rich Text Editor Component
 * WordPress-like editor with H1-H6, lists, links, quotes, inline images with drag & drop
 * Uses TipTap for rich text editing capabilities
 */

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#00F9FF] underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none text-white",
      },
    },
  })

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const reader = new FileReader()
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const { data, error } = await supabase.functions.invoke("upload-media", {
        body: {
          fileData,
          fileName: file.name,
          fileType: file.type,
          folder: "editor",
        },
      })

      if (error) throw error

      const publicUrl = data?.data?.publicUrl || ""
      if (publicUrl && editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run()
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen. Verifica que el archivo sea válido (máx. 5MB, JPG/PNG/WebP).")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageFromUrl = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
      setShowImageInput(false)
    }
  }

  const handleLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  if (!editor) {
    return <div className="text-zinc-400">Cargando editor...</div>
  }

  return (
    <div className={`border border-zinc-700 rounded bg-zinc-900 ${className}`}>
      <style>{`
        .ProseMirror {
          color: white !important;
        }
        .ProseMirror p {
          color: white !important;
        }
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          color: white !important;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          color: white !important;
        }
        .ProseMirror li {
          color: white !important;
        }
        .ProseMirror blockquote {
          color: white !important;
          border-left-color: #00F9FF !important;
        }
        .ProseMirror strong {
          color: white !important;
        }
        .ProseMirror em {
          color: white !important;
        }
        .ProseMirror a {
          color: #00F9FF !important;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror::placeholder {
          color: #71717a !important;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-700 bg-zinc-800/50">
        {/* Text Formatting */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Italic className="w-4 h-4" />
        </Button>

        {/* Headings */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive("heading", { level: 4 }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Heading4 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive("heading", { level: 5 }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Heading5 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive("heading", { level: 6 }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Heading6 className="w-4 h-4" />
        </Button>

        {/* Lists */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        {/* Quote */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <Quote className="w-4 h-4" />
        </Button>

        {/* Alignment */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-zinc-700 text-white" : "text-zinc-300"}
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        {/* Link */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        {showLinkInput ? (
          <div className="flex items-center gap-1">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="px-2 py-1 text-sm bg-zinc-900 border border-zinc-600 text-white rounded w-48"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLink()
                } else if (e.key === "Escape") {
                  setShowLinkInput(false)
                  setLinkUrl("")
                }
              }}
            />
            <Button type="button" size="sm" variant="ghost" onClick={handleLink} className="text-zinc-300">
              Añadir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowLinkInput(false)
                setLinkUrl("")
              }}
              className="text-zinc-300"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowLinkInput(true)}
            className={editor.isActive("link") ? "bg-zinc-700 text-white" : "text-zinc-300"}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Image */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        {showImageInput ? (
          <div className="flex items-center gap-1">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de imagen..."
              className="px-2 py-1 text-sm bg-zinc-900 border border-zinc-600 text-white rounded w-48"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleImageFromUrl()
                } else if (e.key === "Escape") {
                  setShowImageInput(false)
                  setImageUrl("")
                }
              }}
            />
            <Button type="button" size="sm" variant="ghost" onClick={handleImageFromUrl} className="text-zinc-300">
              Añadir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowImageInput(false)
                setImageUrl("")
              }}
              className="text-zinc-300"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      alert("La imagen no puede superar 5MB")
                      return
                    }
                    // Validate file type
                    if (!file.type.startsWith("image/")) {
                      alert("Solo se permiten archivos de imagen")
                      return
                    }
                    handleImageUpload(file)
                  }
                }}
                disabled={uploadingImage}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-zinc-300"
                disabled={uploadingImage}
                asChild
              >
                <span>
                  <ImageIcon className="w-4 h-4" />
                  {uploadingImage && "..."}
                </span>
              </Button>
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowImageInput(true)}
              className="text-zinc-300"
            >
              URL
            </Button>
          </>
        )}

        {/* Undo/Redo */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="text-zinc-300"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="text-zinc-300"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor}
          className="[&_.ProseMirror]:text-white [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-base [&_.ProseMirror_*]:text-white [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h3]:text-white [&_.ProseMirror_h4]:text-white [&_.ProseMirror_h5]:text-white [&_.ProseMirror_h6]:text-white [&_.ProseMirror_p]:text-white [&_.ProseMirror_li]:text-white [&_.ProseMirror_blockquote]:text-white [&_.ProseMirror_strong]:text-white [&_.ProseMirror_em]:text-white"
        />
        {placeholder && !editor.getText() && (
          <div className="absolute top-4 left-4 text-zinc-500 pointer-events-none">{placeholder}</div>
        )}
      </div>

      {/* Drag & Drop Zone for Images */}
      <div
        className="hidden md:block border-t border-zinc-700 p-2 text-xs text-zinc-500 text-center"
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file && file.type.startsWith("image/")) {
            if (file.size > 5 * 1024 * 1024) {
              alert("La imagen no puede superar 5MB")
              return
            }
            handleImageUpload(file)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        Arrastra imágenes aquí para insertarlas
      </div>
    </div>
  )
}

