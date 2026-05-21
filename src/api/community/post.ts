import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'


export interface PostParams {
  page: number
  pageSize: number
  keyword?: string
  sort?: string
}

export interface CommentParams {
  postId: number
  page: number
  pageSize: number
  keyword?: string
}

export interface PostItem {
  id: number
  userId: number
  displayName: string
  diseaseId: number
  categoryId: number
  type: string
  title: string
  content: string
  images: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  isTop: boolean
  isRecommend: boolean
  status: number
  createdAt: string
  isLiked: boolean
  isFavorited: boolean
}

export interface CommentItem {
  id: number
  postId: number
  userId: number
  displayName: string
  content: string
  likeCount: number
  createdAt: string
  parentId: number
  children?: CommentItem[]
}

export interface PostListResponse {
  list: PostItem[]
  total: number
}

export interface CommentListResponse {
  list: CommentItem[]
  total: number
}

type RawRecord = Record<string, unknown>

const normalizePost = (item: RawRecord): PostItem => ({
  id: Number(item.id),
  userId: Number(item.user_id ?? item.userId ?? 0),
  displayName: String(item.display_name ?? item.displayName ?? ''),
  diseaseId: Number(item.disease_id ?? item.diseaseId ?? 0),
  categoryId: Number(item.category_id ?? item.categoryId ?? 0),
  type: String(item.type ?? ''),
  title: String(item.title ?? ''),
  content: String(item.content ?? ''),
  images: Array.isArray(item.images) ? item.images.map(String) : [],
  viewCount: Number(item.view_count ?? item.viewCount ?? 0),
  likeCount: Number(item.like_count ?? item.likeCount ?? 0),
  commentCount: Number(item.comment_count ?? item.commentCount ?? 0),
  favoriteCount: Number(item.favorite_count ?? item.favoriteCount ?? 0),
  isTop: Boolean(item.is_top ?? item.isTop ?? false),
  isRecommend: Boolean(item.is_recommend ?? item.isRecommend ?? false),
  status: Number(item.status ?? 0),
  createdAt: String(item.created_at ?? item.createdAt ?? ''),
  isLiked: Boolean(item.is_liked ?? item.isLiked ?? false),
  isFavorited: Boolean(item.is_favorited ?? item.isFavorited ?? false),
})

const normalizeComment = (item: RawRecord): CommentItem => ({
  id: Number(item.id),
  postId: Number(item.post_id ?? item.postId ?? 0),
  userId: Number(item.user_id ?? item.userId ?? 0),
  displayName: String(item.display_name ?? item.displayName ?? ''),
  content: String(item.content ?? ''),
  likeCount: Number(item.like_count ?? item.likeCount ?? 0),
  createdAt: String(item.created_at ?? item.createdAt ?? ''),
  parentId: Number(item.parent_id ?? item.parentId ?? 0),
  children: Array.isArray(item.children)
    ? item.children.map((child) => normalizeComment(child as RawRecord))
    : undefined,
})

const extractListPayload = (payload: unknown): { list: RawRecord[]; total: number } => {
  if (Array.isArray(payload)) {
    return { list: payload as RawRecord[], total: payload.length }
  }
  const data = (payload ?? {}) as RawRecord
  const list = (data.list ?? data.records ?? []) as RawRecord[]
  return {
    list,
    total: Number(data.total ?? list.length),
  }
}

const toListQueryParams = (params: PostParams) => ({
  page: params.page,
  pageSize: params.pageSize,
  limit: params.pageSize,
  keyword: params.keyword,
  sort: params.sort ?? 'latest',
})

export const getPostList = async (params: PostParams): Promise<ApiResponse<PostListResponse>> => {
  const res = await request.get<unknown>('/community/posts', {
    params: toListQueryParams(params),
  })
  const { list, total } = extractListPayload(res.data)
  return {
    ...res,
    data: {
      list: list.map(normalizePost),
      total,
    },
  }
}

export const getPostDetail = async (id: number): Promise<ApiResponse<PostItem>> => {
  const res = await request.get<RawRecord>(`/community/posts/${id}`)
  return {
    ...res,
    data: normalizePost(res.data ?? {}),
  }
}

export const updatePost = (id: number, data: Partial<Pick<PostItem, 'content' | 'title' | 'images'>>) => {
  return request.put<null>(`/community/posts/${id}`, data)
}

export const deletePost = (id: number) => {
  return request.delete<null>(`/community/posts/${id}`)
}

export const getCommentList = async (params: CommentParams): Promise<ApiResponse<CommentListResponse>> => {
  const { postId, page, pageSize, keyword } = params
  const res = await request.get<unknown>(`/community/posts/${postId}/comments`, {
    params: {
      page,
      pageSize,
      limit: pageSize,
      keyword,
    },
  })
  const { list, total } = extractListPayload(res.data)
  return {
    ...res,
    data: {
      list: list.map(normalizeComment),
      total,
    },
  }
}

export const updateComment = (id: number, data: Partial<Pick<CommentItem, 'content'>>) => {
  return request.put<null>(`/community/comments/${id}`, data)
}

export const deleteComment = (id: number) => {
  return request.delete<null>(`/community/comments/${id}`)
}

export const createPost = (data: Partial<Pick<PostItem, 'content' | 'title' | 'images'>>) => {
  return request.post<null>('/community/posts', data)
}
