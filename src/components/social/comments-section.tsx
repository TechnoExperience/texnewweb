import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MessageCircle, Send, Edit2, Trash2, Reply, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  user_id: string
  content: string
  is_edited: boolean
  edited_at: string | null
  created_at: string
  updated_at: string
  parent_id: string | null
  profiles?: {
    id: string
    name: string | null
    avatar_url: string | null
    email: string
  }
}

interface CommentsSectionProps {
  resourceType: "news" | "event" | "video" | "release" | "review"
  resourceId: string
  className?: string
}

export function CommentsSection({ resourceType, resourceId, className = "" }: CommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    loadComments()
  }, [resourceType, resourceId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            email
          )
        `)
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId)
        .eq("is_approved", true)
        .is("parent_id", null)
        .order("created_at", { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error: any) {
      console.error("Error loading comments:", error)
      toast.error("Error al cargar comentarios")
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (parentId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url,
          email
        )
      `)
      .eq("parent_id", parentId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  }

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para comentar")
      return
    }

    if (!newComment.trim()) {
      toast.error("El comentario no puede estar vacío")
      return
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          resource_type: resourceType,
          resource_id: resourceId,
          content: newComment.trim(),
        })

      if (error) throw error

      toast.success("Comentario publicado")
      setNewComment("")
      loadComments()
    } catch (error: any) {
      console.error("Error posting comment:", error)
      toast.error("Error al publicar comentario")
    }
  }

  const handleReply = async (parentId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para responder")
      return
    }

    if (!replyContent.trim()) {
      toast.error("La respuesta no puede estar vacía")
      return
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          resource_type: resourceType,
          resource_id: resourceId,
          parent_id: parentId,
          content: replyContent.trim(),
        })

      if (error) throw error

      toast.success("Respuesta publicada")
      setReplyingTo(null)
      setReplyContent("")
      loadComments()
    } catch (error: any) {
      console.error("Error posting reply:", error)
      toast.error("Error al publicar respuesta")
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("El comentario no puede estar vacío")
      return
    }

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: editContent.trim() })
        .eq("id", commentId)
        .eq("user_id", user?.id)

      if (error) throw error

      toast.success("Comentario actualizado")
      setEditingId(null)
      setEditContent("")
      loadComments()
    } catch (error: any) {
      console.error("Error editing comment:", error)
      toast.error("Error al actualizar comentario")
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) return

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user?.id)

      if (error) throw error

      toast.success("Comentario eliminado")
      loadComments()
    } catch (error: any) {
      console.error("Error deleting comment:", error)
      toast.error("Error al eliminar comentario")
    }
  }

  const CommentItem = ({ comment, level = 0 }: { comment: Comment; level?: number }) => {
    const [replies, setReplies] = useState<Comment[]>([])
    const [showReplies, setShowReplies] = useState(false)
    const [loadingReplies, setLoadingReplies] = useState(false)

    const loadRepliesForComment = async () => {
      if (showReplies) {
        setShowReplies(false)
        setReplies([])
        return
      }

      setLoadingReplies(true)
      try {
        const replyData = await loadReplies(comment.id)
        setReplies(replyData)
        setShowReplies(true)
      } catch (error) {
        console.error("Error loading replies:", error)
      } finally {
        setLoadingReplies(false)
      }
    }

    const isOwner = user?.id === comment.user_id
    const displayName = comment.profiles?.name || comment.profiles?.email?.split("@")[0] || "Usuario"
    const avatarUrl = comment.profiles?.avatar_url || "/placeholder-user.jpg"

    return (
      <div className={`${level > 0 ? "ml-8 mt-4" : ""}`}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <OptimizedImage
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{displayName}</span>
                <span className="text-white/40 text-xs">
                  {format(new Date(comment.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                </span>
                {comment.is_edited && (
                  <span className="text-white/40 text-xs italic">(editado)</span>
                )}
              </div>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="text-white hover:bg-zinc-800"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(comment.id)}
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                  >
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setEditContent("")
                    }}
                    className="border-white/20 text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-white/90 text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4">
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (replyingTo === comment.id) {
                          setReplyingTo(null)
                        } else {
                          setReplyingTo(comment.id)
                          setReplyContent("")
                        }
                      }}
                      className="text-white/60 hover:text-white text-xs h-8"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Responder
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadRepliesForComment}
                    className="text-white/60 hover:text-white text-xs h-8"
                    disabled={loadingReplies}
                  >
                    {showReplies ? "Ocultar" : "Ver"} respuestas ({replies.length})
                  </Button>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Responder
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent("")
                        }}
                        className="border-white/20 text-white"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {showReplies && replies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} level={level + 1} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#00F9FF]" />
        <h3 className="text-2xl font-bold text-white">Comentarios</h3>
        <span className="text-white/60 text-sm">({comments.length})</span>
      </div>

      {user ? (
        <div className="mb-8 space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
          />
          <Button
            onClick={handleSubmitComment}
            className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
          >
            <Send className="w-4 h-4 mr-2" />
            Publicar comentario
          </Button>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-zinc-900/50 border border-white/10 rounded-lg">
          <p className="text-white/60 text-sm mb-2">Debes iniciar sesión para comentar</p>
          <Button asChild variant="outline" className="border-white/20 text-white">
            <a href="/auth/login">Iniciar sesión</a>
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#00F9FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-white/60 text-sm">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No hay comentarios aún. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

