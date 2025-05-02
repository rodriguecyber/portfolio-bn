export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "admin"
  createdAt?: Date
  updatedAt?: Date
}

export interface Blog {
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string | User
  tags: string[]
  image: string
  gallery?: {
    type: "image" | "video"
    url: string
    caption: string
  }[]
  published: boolean
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface Project {
  _id?: string
  title: string
  slug: string
  description: string
  longDescription: string
  tags: string[]
  image: string
  demoUrl: string
  repoUrl: string
  versions: {
    version: string
    date: string
    notes: string
    description: string
    features: string[]
    media: {
      type: "image" | "video"
      url: string
      caption: string
    }[]
    changes: string[]
  }[]
  features: string[]
  challenges: string[]
  screenshots: string[]
  published: boolean
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface Comment {
  _id?: string
  contentId: string
  contentType: "blog" | "project"
  parentId?: string
  author: {
    name: string
    email?: string
    avatar?: string
  }
  content: string
  approved: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Like {
  _id?: string
  contentId: string
  contentType: "blog" | "project"
  ipAddress: string
  createdAt?: Date
}

export interface Contact {
  _id?: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Subscriber {
  _id?: string
  email: string
  active: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ServerHealth {
  _id?: string
  timestamp: Date
  cpu: number
  memory: number
  requests: number
  errors: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
