export { createUser, getUserByEmail, getUserById } from "./users"
export type { User } from "./users"

export { 
  createPost, 
  getPostsByUserId, 
  getPostById, 
  getAllPosts, 
  getPostCountByUserId,
  getUserProofLevel,
  deletePost,
  PROOF_LEVELS 
} from "./posts"
export type { Post, PostImage, PostProof, ProofLevel } from "./posts"

export { 
  getCourses, 
  getCourseById, 
  getFeaturedCourses,
  getCoursesByCategory,
  enrollInCourse,
  getUserCourses,
  updateCourseProgress,
  isUserEnrolled 
} from "./courses"
export type { Course, CourseModule, UserCourse } from "./courses"
