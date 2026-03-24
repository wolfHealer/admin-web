// src/api/community/post.ts
import request from '@/utils/request'

export interface PostParams {
  page: number
  pageSize: number
  keyword?: string
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
  content: string
  images: string[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  createdAt: string
}

export interface CommentItem {
  id: number
  postId: number
  userId: number
  displayName: string
  content: string
  likeCount: number
  createdAt: string
  parentId: number      // 新增
  children?: CommentItem[]  // 新增
}

// 获取帖子列表
export const getPostList = (params: PostParams) => {
  return request({
    url: '/community/posts',
    method: 'get',
    params
  })
}

// 获取帖子详情
export const getPostDetail = (id: number) => {
  return request({
    url: `/community/posts/${id}`,
    method: 'get'
  })
}

// 更新帖子
export const updatePost = (id: number, data: Partial<PostItem>) => {
  return request({
    url: `/community/posts/${id}`,
    method: 'put',
    data
  })
}

// 删除帖子
export const deletePost = (id: number) => {
  return request({
    url: `/community/posts/${id}`,
    method: 'delete'
  })
}

// 获取评论列表
export const getCommentList = (params: CommentParams) => {
  return request({
    url: `/community/posts/${params.postId}/comments`,
    method: 'get',
    params
  })
}

// 更新评论
export const updateComment = (id: number, data: Partial<CommentItem>) => {
  return request({
    url: `/community/comments/${id}`,
    method: 'put',
    data
  })
}

// 删除评论
export const deleteComment = (id: number) => {
  return request({
    url: `/community/comments/${id}`,
    method: 'delete'
  })
}


// 创建帖子
export const createPost = (data: Partial<PostItem>) => {
  return request({
    url: '/community/posts',
    method: 'post',
    data
  })
}